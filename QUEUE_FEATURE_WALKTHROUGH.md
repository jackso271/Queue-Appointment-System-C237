# Queue Management Feature Walkthrough

## Feature Scope

This feature covers Queue Management only. It does not build appointment CRUD, authentication, authorization, service management, staff management, feedback, dashboards or reports.

The queue feature uses the existing `appointments` table only to validate whether an appointment can check in.

## Important Authentication Limitation

Customer queue actions are intentionally blocked until the authentication teammate provides a verified logged-in user ID.

In `controllers/queueController.js`, the `getAuthenticatedUserId` function currently returns `null`. This means:

- Customer check-in is blocked.
- Customer queue-status viewing is blocked.
- Ownership checks cannot be bypassed.

This is safer than allowing customers to check in without knowing who is logged in.

Admin queue routes currently contain TODO comments for administrator middleware, but they are not secure yet. They should not be described as protected until the authentication and administrator authorization middleware is connected.

## Request Flow

### Customer Check-In Flow

1. Customer sends a POST request to `/queue/check-in/:appointmentID`.
2. `queueRoutes.js` sends the request to `queueController.checkInCustomer`.
3. The controller tries to get the authenticated user ID.
4. If no verified user ID is available, the request is blocked with a 403 response.
5. After authentication is integrated, the controller will check whether the appointment exists.
6. The controller checks whether the appointment belongs to the logged-in customer.
7. The controller checks whether the appointment status is `Approved`.
8. The controller checks whether the appointment already has a queue entry.
9. The model generates the next queue number.
10. The model creates a new `Waiting` queue record.
11. The customer is redirected to the queue-status page.

### Customer Queue Status Flow

1. Customer opens `/queue/status/:appointmentID`.
2. The controller tries to get the authenticated user ID.
3. If no verified user ID is available, the page is blocked with a 403 response.
4. After authentication is integrated, the model loads the queue record only if the appointment belongs to the logged-in customer.
5. If the customer is waiting, the model counts how many waiting customers are ahead.
6. The page displays queue number, status and position.

### Admin Queue Flow

1. Admin opens `/queue/admin`.
2. The controller loads active queue entries with status `Waiting` or `Serving`.
3. The admin page displays queue entries in serving/waiting order.
4. Admin can call a Waiting customer.
5. Admin can complete a Serving customer.
6. Admin can cancel a Waiting or Serving queue entry.

Important: this admin route still needs administrator middleware from the authentication teammate.

## File Purposes

### `config/database.js`

Creates one shared MySQL connection pool using `mysql2/promise`.

It reads database settings from environment variables instead of hardcoding passwords.

### `models/queueModel.js`

Contains all SQL queries used by the queue feature.

Every SQL input uses placeholders such as `?` to avoid unsafe string interpolation.

### `controllers/queueController.js`

Contains the queue business logic.

It checks appointment existence, ownership, approval status, duplicate check-in and valid queue status changes.

### `routes/queueRoutes.js`

Defines the queue URLs and connects them to controller functions.

It includes TODO comments showing where customer and admin middleware must be added later.

### `views/queue/customer-status.ejs`

Displays a customer's queue number, queue status and number of waiting customers ahead.

### `views/queue/admin-queue.ejs`

Displays active queue entries for admin queue management.

It includes a warning that admin routes are not secure until admin middleware is integrated.

### `.env.example`

Shows the environment variables needed to run the project without exposing real credentials.

### `.gitignore`

Ignores `.env` and `node_modules/`.

## Model Functions

### `getNextQueueNumber`

Reads the highest existing queue number and returns the next number.

Example: if the highest queue number is 12, the next customer gets 13.

### `findByAppointmentId`

Checks whether an appointment already has a queue record.

This prevents duplicate check-in.

### `createQueueEntry`

Creates a queue record with status `Waiting`.

It stores the appointment ID, queue number and check-in time.

### `getWaitingQueue`

Reads active queue records for the admin page.

It returns `Waiting` and `Serving` records with appointment, service and staff details.

### `getCustomerQueueStatus`

Reads one queue record only when the appointment belongs to the logged-in customer.

This supports personalization and ownership checking after auth integration.

### `markAsServing`

Changes a queue record from `Waiting` to `Serving`.

It rejects invalid transitions by updating only rows where `queueStatus = 'Waiting'`.

### `markAsCompleted`

Changes a queue record from `Serving` to `Completed`.

It rejects invalid transitions by updating only rows where `queueStatus = 'Serving'`.

### `cancelQueueEntry`

Changes an active queue record to `Cancelled`.

It only cancels records that are still `Waiting` or `Serving`.

### `countCustomersAhead`

Counts how many waiting customers have a smaller queue number.

This is used to show the customer's queue position.

### `findAppointmentForQueue`

Reads appointment details needed for check-in validation.

It is not appointment CRUD. It only supports queue validation.

## SQL Interactions

### Generate Queue Number

```sql
SELECT COALESCE(MAX(queueNumber), 0) + 1 AS nextQueueNumber
FROM `queue`;
```

This reads the next queue number.

### Prevent Duplicate Check-In

```sql
SELECT *
FROM `queue`
WHERE appointmentID = ?
LIMIT 1;
```

This checks whether the appointment already has a queue entry.

### Create Queue Entry

```sql
INSERT INTO `queue`
    (appointmentID, queueNumber, queueStatus, checkInTime)
VALUES
    (?, ?, 'Waiting', NOW());
```

This creates a new waiting queue record.

### Read Customer Queue Status

```sql
SELECT ...
FROM `queue` q
INNER JOIN appointments a ON q.appointmentID = a.appointmentID
WHERE q.appointmentID = ?
AND a.userID = ?;
```

This reads a queue record only if the appointment belongs to the logged-in customer.

### Read Admin Queue

```sql
SELECT ...
FROM `queue` q
INNER JOIN appointments a ON q.appointmentID = a.appointmentID
WHERE q.queueStatus IN ('Waiting', 'Serving');
```

This reads active queue records for the admin queue page.

### Call Customer

```sql
UPDATE `queue`
SET queueStatus = 'Serving',
    calledTime = NOW()
WHERE queueID = ?
AND queueStatus = 'Waiting';
```

This moves a customer from Waiting to Serving.

### Complete Customer

```sql
UPDATE `queue`
SET queueStatus = 'Completed',
    completedTime = NOW()
WHERE queueID = ?
AND queueStatus = 'Serving';
```

This moves a customer from Serving to Completed.

### Cancel Queue Entry

```sql
UPDATE `queue`
SET queueStatus = 'Cancelled'
WHERE queueID = ?
AND queueStatus IN ('Waiting', 'Serving');
```

This cancels only active queue entries.

## Authentication, Authorization And Ownership

Customer ownership depends on a verified logged-in user ID.

Current TODO location:

```js
function getAuthenticatedUserId(req) {
    // TODO: Connect this to the authentication teammate's session user ID.
    return null;
}
```

Once authentication is ready, replace `return null` with the final session user ID from the auth teammate.

The customer controller already blocks requests if the ID is missing.

Administrator authorization still needs middleware in `routes/queueRoutes.js`.

Current TODO location:

```js
// TODO: Add the authentication teammate's administrator middleware before these routes.
```

## Queue Number Generation

Queue numbers are generated using the current maximum queue number plus one.

This is simple and easy to explain:

- First customer gets 1.
- Next customer gets 2.
- The number keeps increasing as customers check in.

## Status Progression

Normal queue progress:

```text
Waiting -> Serving -> Completed
```

Cancellation:

```text
Waiting -> Cancelled
Serving -> Cancelled
```

Invalid status transitions are rejected by the SQL `WHERE` conditions.

For example, a Completed customer cannot be marked as Serving because the SQL only updates rows that are currently Waiting.

## Testing Instructions

After authentication is integrated:

1. Create or find an approved appointment owned by the logged-in customer.
2. POST to `/queue/check-in/:appointmentID`.
3. Confirm a queue record is created.
4. Try checking in again and confirm duplicate check-in is rejected.
5. Try checking in for a non-approved appointment and confirm it is rejected.
6. Try viewing another customer's queue status and confirm it is blocked.
7. Add admin middleware, then open `/queue/admin`.
8. Call a Waiting customer and confirm status changes to Serving.
9. Complete a Serving customer and confirm status changes to Completed.
10. Try invalid transitions and confirm they are rejected.
11. Cancel a Waiting or Serving queue entry and confirm status changes to Cancelled.

Before authentication is integrated:

1. Open `/queue/status/:appointmentID`.
2. Confirm a 403 integration error appears.
3. POST to `/queue/check-in/:appointmentID`.
4. Confirm a 403 integration error appears.
5. Open `/queue/admin`.
6. Confirm the page warns that admin routes are not secure yet.

## Possible Lecturer Questions

### Why do customer routes block when authentication is missing?

Because the system must know the logged-in user's ID before checking appointment ownership. Allowing access without a verified user ID would be unsafe.

### How do you prevent duplicate check-in?

Before creating a queue record, the system searches the `queue` table by `appointmentID`. If a record already exists, check-in is rejected.

### How do you make sure only approved appointments can check in?

The controller reads the appointment and checks that its status is `Approved` before creating the queue record.

### How do you stop invalid queue status changes?

The SQL update includes the expected current status in the `WHERE` clause. For example, a customer can only be called if the current status is `Waiting`.

### Are the admin routes secure now?

No. They are functional but not secure until the authentication teammate's administrator middleware is added.

### Are SQL queries protected against injection?

Yes. User inputs are passed through SQL placeholders such as `?` instead of string interpolation.

