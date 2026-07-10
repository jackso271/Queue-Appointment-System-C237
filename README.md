# QueueEase – Queue & Appointment Management System

## Overview

QueueEase is a web-based Queue and Appointment Management System developed using Node.js, Express.js, MySQL, and EJS.

The application allows customers to book appointments online and join a service queue, while administrators can manage users, staff, services, appointments, queues, feedback, and operational reports through a centralized dashboard.

QueueEase implements authentication and role-based authorization so that users can only access features and pages permitted by their assigned role.

The system aims to replace manual booking methods such as phone calls, WhatsApp messages, spreadsheets, and paper appointment books with a secure and organized digital solution.

---

## Problem Statement

Many small businesses, including clinics, salons, tuition centres, repair shops, and consultation services, still rely on manual appointment and queue-management methods.

These methods may result in:

- Double bookings
- Long customer waiting times
- Lost or forgotten appointments
- Difficulty tracking appointment history
- Unclear queue order
- Inefficient customer and staff management
- Unauthorized access to sensitive management functions

QueueEase addresses these problems by providing an online platform that improves scheduling accuracy, queue visibility, data management, security, and operational efficiency.

---

## Objectives

QueueEase aims to:

- Digitize appointment booking and queue management
- Reduce scheduling conflicts and double bookings
- Allow customers to make bookings at any time
- Provide queue numbers and queue-status tracking
- Allow administrators to manage daily operations
- Protect administrative functions using role-based authorization
- Improve customer waiting experience
- Maintain organized records for users, services, staff, appointments, queues, and feedback
- Provide useful dashboard statistics and reports

---

## Target Users

### Customer

Customers can:

- Register an account
- Log in securely
- View available services
- Book appointments
- View appointment history
- Edit eligible appointments
- Cancel their own appointments
- Check in and receive a queue number
- View their queue status
- Update their profile
- Submit feedback after a completed appointment

### Administrator

Administrators can:

- Access the administrator dashboard
- Manage users
- Manage staff
- Manage services
- Manage appointments
- Approve or reject appointments
- Update appointment status
- Manage customer queues
- Search for customers and records
- View dashboard statistics
- Monitor daily appointments and queue activity
- View feedback and generate reports

---

## Authentication and Authorization

### Authentication

The system supports:

- User registration
- Secure login
- Password hashing
- Session management
- Session validation
- Logout

### Role-Based Authorization

QueueEase uses role-based access control after a user has logged in.

#### Customer Permissions

Customers are allowed to:

- View available services
- Create appointments
- View their own appointment history
- Edit or cancel their own eligible appointments
- View their own queue information
- Update their own profile
- Submit feedback for their completed appointments

Customers are not allowed to:

- Access the administrator dashboard
- Manage other users
- Manage staff
- Add, edit, or delete services
- Manage another customer's appointment
- Manage another customer's queue record
- View restricted reports

#### Administrator Permissions

Administrators are allowed to:

- Access protected administrator routes
- Manage users, staff, services, appointments, and queues
- Update appointment and queue statuses
- Search and filter system records
- View customer feedback
- View operational statistics and reports

---

## System Features

### Customer Module

- Register and log in
- View available services
- Book an appointment
- View appointment details
- View appointment history
- Edit an eligible appointment
- Cancel an appointment
- Join or check in to a queue
- View queue number and queue status
- Submit feedback

### Appointment Management

- Create appointment
- View appointment list and details
- Update appointment information
- Delete or cancel appointment
- Approve or reject appointment
- Update appointment status
- Detect conflicting booking slots

### Queue Management

- Generate queue number
- Check in an appointment
- View waiting customers
- Call the next customer
- Update queue status
- Cancel or complete a queue entry
- Monitor queue progress

### Service Management

- Add service
- View service list and details
- Edit service
- Delete service
- Search services
- Mark services as available or unavailable

### User Management

- Add user
- View user list and profile
- Edit user
- Delete user
- Search users
- Update user role or account status

### Staff Management

- Add staff member
- View staff list
- Edit staff details
- Delete staff member
- Search staff
- Update staff availability

### Feedback Management

- Submit feedback
- View feedback
- Filter feedback by rating or date
- Delete inappropriate feedback
- Calculate average rating
- Include feedback information in reports

### Dashboard and Reports

The administrator dashboard displays:

- Total users
- Total staff
- Total services
- Today's appointments
- Pending appointments
- Approved appointments
- Completed appointments
- Cancelled appointments
- Customers currently waiting
- Customers currently being served
- Average feedback rating

Reports may be filtered or grouped by:

- Date
- Service
- Appointment status
- Queue status
- Staff availability
- Feedback rating

---

## Search, Filter, and Sort

### Search

Records can be searched by:

- Customer name
- Customer email
- Service name
- Staff name
- Appointment ID
- Queue number

### Filter

Appointments and queues can be filtered by:

- Pending
- Approved
- Waiting
- Serving
- Completed
- Cancelled
- Available
- Unavailable

### Sort

Records can be sorted by:

- Appointment date
- Appointment time
- Service name
- Customer name
- Queue number
- Booking status
- Feedback rating

---

## Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | Web application framework |
| MySQL | Relational database |
| EJS | Server-side template rendering |
| Bootstrap | Responsive user-interface design |
| HTML5 | Frontend page structure |
| CSS3 | Application styling |
| JavaScript | Client-side and server-side interaction |
| Git | Version control |
| GitHub | Source-code repository and collaboration |

---

## Project Structure

```text
QueueEase/
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── authController.js
│   ├── appointmentController.js
│   ├── serviceController.js
│   ├── queueController.js
│   ├── staffController.js
│   ├── userController.js
│   ├── feedbackController.js
│   └── dashboardController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── validationMiddleware.js
│
├── models/
│   ├── userModel.js
│   ├── serviceModel.js
│   ├── appointmentModel.js
│   ├── queueModel.js
│   ├── staffModel.js
│   └── feedbackModel.js
│
├── routes/
│   ├── authRoutes.js
│   ├── appointmentRoutes.js
│   ├── serviceRoutes.js
│   ├── queueRoutes.js
│   ├── staffRoutes.js
│   ├── userRoutes.js
│   ├── feedbackRoutes.js
│   └── adminRoutes.js
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
├── views/
│   ├── auth/
│   ├── appointments/
│   ├── services/
│   ├── queue/
│   ├── staff/
│   ├── users/
│   ├── feedback/
│   ├── admin/
│   ├── partials/
│   └── errors/
│
├── database/
│   ├── queueease.sql
│   └── seed.sql
│
├── .env.example
├── .gitignore
├── app.js
├── package.json
└── README.md
```

---

## Database Design

### 1. Users

Stores customer and administrator account information.

| Field | Description |
|---|---|
| userID | Primary key |
| fullName | User's full name |
| email | Unique user email |
| password | Hashed password |
| phone | Contact number |
| role | Customer or Admin |
| accountStatus | Active, Suspended, or Disabled |
| createdAt | Account creation date and time |

### 2. Services

Stores services offered by the business.

| Field | Description |
|---|---|
| serviceID | Primary key |
| serviceName | Name of service |
| description | Service details |
| duration | Estimated duration in minutes |
| price | Service price |
| status | Available or Unavailable |

### 3. Appointments

Stores customer appointment bookings.

| Field | Description |
|---|---|
| appointmentID | Primary key |
| userID | Foreign key referencing Users |
| serviceID | Foreign key referencing Services |
| staffID | Foreign key referencing Staff, nullable until assigned |
| appointmentDate | Appointment date |
| appointmentTime | Appointment time |
| status | Pending, Approved, Completed, or Cancelled |
| remarks | Additional notes |
| createdAt | Booking creation date and time |

### 4. Queue

Stores queue numbers and customer service progress.

| Field | Description |
|---|---|
| queueID | Primary key |
| appointmentID | Foreign key referencing Appointments |
| queueNumber | Customer queue number |
| queueStatus | Waiting, Serving, Completed, or Cancelled |
| checkInTime | Customer check-in time |
| calledTime | Time customer was called |
| completedTime | Time service was completed |

### 5. Staff

Stores staff information and availability.

| Field | Description |
|---|---|
| staffID | Primary key |
| fullName | Staff member's name |
| email | Staff email |
| phone | Staff contact number |
| position | Staff role or job title |
| availabilityStatus | Available or Unavailable |

### 6. Feedback

Stores customer feedback submitted after appointments.

| Field | Description |
|---|---|
| feedbackID | Primary key |
| appointmentID | Foreign key referencing Appointments |
| userID | Foreign key referencing Users |
| rating | Customer rating, for example 1 to 5 |
| comments | Customer feedback |
| submittedDate | Feedback submission date |

---

## Database Relationships

- One user can create many appointments.
- One service can be selected for many appointments.
- One staff member can be assigned to many appointments.
- One appointment can have zero or one active queue record.
- One completed appointment can have zero or one feedback record.
- One user can submit feedback for many completed appointments.

```text
Users 1 ───────< Appointments >─────── 1 Services
                     │
                     ├─────────────── 1 Staff
                     │
                     ├─────────────── 0..1 Queue
                     │
                     └─────────────── 0..1 Feedback

Users 1 ─────────────────────────────< Feedback
```

---

## Team Responsibilities and Database Ownership

Each member has one main feature area and one primary database table. Members may query related tables where required, but they remain responsible for the design, validation, routes, controllers, views, and database operations of their assigned module.

| Team Member | Main Feature Responsibility | Primary Table | Related Tables |
|---|---|---|---|
| Ming Hao | Authentication and account security | Users | Appointments |
| MM | Appointment booking and appointment history | Appointments | Users, Services, Staff, Queue |
| Wei Jin | Service management | Services | Appointments |
| Jason | Queue management | Queue | Appointments, Users, Services |
| Ray 5 | Staff and administrative user management | Staff | Users, Appointments |
| Kay Yi | Authorization, dashboard, feedback, and reports | Feedback | Users, Appointments, Services, Queue, Staff |

### Ming Hao – Authentication and Users Database

Ming Hao is responsible for user registration, login, logout, password security, and session handling.

Six database interactions:

1. Create a new customer account.
2. Read a user by email during login.
3. Read a user by ID when restoring or validating a session.
4. Update the user's hashed password.
5. Update the user's profile information.
6. Update the user's account status after administrative action or security checks.

Primary SQL actions:

```sql
INSERT INTO Users (...);
SELECT * FROM Users WHERE email = ?;
SELECT * FROM Users WHERE userID = ?;
UPDATE Users SET password = ? WHERE userID = ?;
UPDATE Users SET fullName = ?, phone = ? WHERE userID = ?;
UPDATE Users SET accountStatus = ? WHERE userID = ?;
```

### MM – Appointment Booking Database

MM is responsible for creating, displaying, editing, cancelling, and validating appointments.

Six database interactions:

1. Create a new appointment.
2. Read all appointments belonging to the logged-in customer.
3. Read one appointment with customer and service details.
4. Update an appointment's date, time, service, or remarks.
5. Cancel or delete an eligible appointment.
6. Check for an existing appointment in the same date and time slot to prevent conflicts.

Primary SQL actions:

```sql
INSERT INTO Appointments (...);
SELECT * FROM Appointments WHERE userID = ?;
SELECT ... FROM Appointments JOIN Users ... JOIN Services ...;
UPDATE Appointments SET appointmentDate = ?, appointmentTime = ? WHERE appointmentID = ?;
UPDATE Appointments SET status = 'Cancelled' WHERE appointmentID = ?;
SELECT COUNT(*) FROM Appointments WHERE appointmentDate = ? AND appointmentTime = ?;
```

### Wei Jin – Service Management Database

Wei Jin is responsible for maintaining services that customers can select during appointment booking.

Six database interactions:

1. Create a new service.
2. Read all services.
3. Read one service by its ID.
4. Update service name, description, duration, or price.
5. Delete a service that is not being used, or perform a controlled deletion.
6. Search or filter services by name and availability status.

Primary SQL actions:

```sql
INSERT INTO Services (...);
SELECT * FROM Services;
SELECT * FROM Services WHERE serviceID = ?;
UPDATE Services SET serviceName = ?, duration = ?, price = ? WHERE serviceID = ?;
DELETE FROM Services WHERE serviceID = ?;
SELECT * FROM Services WHERE serviceName LIKE ? OR status = ?;
```

### Jason – Queue Management Database

Jason is responsible for customer check-in, queue-number generation, and queue-status updates.

Six database interactions:

1. Create a queue record when an eligible customer checks in.
2. Read the current waiting queue in queue-number order.
3. Read a customer's queue position and status.
4. Update a queue entry from Waiting to Serving.
5. Update a queue entry from Serving to Completed.
6. Cancel or remove an invalid queue entry.

Primary SQL actions:

```sql
INSERT INTO Queue (...);
SELECT * FROM Queue WHERE queueStatus = 'Waiting' ORDER BY queueNumber;
SELECT * FROM Queue WHERE appointmentID = ?;
UPDATE Queue SET queueStatus = 'Serving', calledTime = NOW() WHERE queueID = ?;
UPDATE Queue SET queueStatus = 'Completed', completedTime = NOW() WHERE queueID = ?;
UPDATE Queue SET queueStatus = 'Cancelled' WHERE queueID = ?;
```

### Ray 5 – Staff and Administrative User Management Database

Ray 5 is responsible for staff records and administrative account-management functions.

Six database interactions:

1. Create a staff record.
2. Read all staff records.
3. Read one staff member by ID.
4. Update staff contact details, position, or availability.
5. Delete a staff member who is no longer active.
6. Search staff by name, position, or availability.

Primary SQL actions:

```sql
INSERT INTO Staff (...);
SELECT * FROM Staff;
SELECT * FROM Staff WHERE staffID = ?;
UPDATE Staff SET phone = ?, position = ?, availabilityStatus = ? WHERE staffID = ?;
DELETE FROM Staff WHERE staffID = ?;
SELECT * FROM Staff WHERE fullName LIKE ? OR position LIKE ? OR availabilityStatus = ?;
```

Ray 5 may also work with the Users table for administrator actions such as viewing users, changing account status, or deleting accounts. Coordination with Ming Hao is required to avoid editing the same authentication code.

### Kay Yi – Authorization, Dashboard, Feedback, and Reports Database

Kay Yi is responsible for role-based route protection, dashboard statistics, customer feedback, and operational reports.

Six database interactions:

1. Read the logged-in user's role for authorization checks.
2. Create feedback for a completed appointment.
3. Read feedback with customer and service information.
4. Update feedback submitted by the customer when permitted.
5. Delete feedback when permitted by the application rules.
6. Read aggregated dashboard and report information from multiple tables.

Primary SQL actions:

```sql
SELECT role FROM Users WHERE userID = ?;
INSERT INTO Feedback (...);
SELECT ... FROM Feedback JOIN Users ... JOIN Appointments ... JOIN Services ...;
UPDATE Feedback SET rating = ?, comments = ? WHERE feedbackID = ?;
DELETE FROM Feedback WHERE feedbackID = ?;
SELECT status, COUNT(*) FROM Appointments GROUP BY status;
```

Dashboard reporting may also use:

```sql
SELECT COUNT(*) FROM Users;
SELECT COUNT(*) FROM Services WHERE status = 'Available';
SELECT COUNT(*) FROM Queue WHERE queueStatus = 'Waiting';
SELECT AVG(rating) FROM Feedback;
```

---

## Database Interaction Summary

| Member | Primary Module | Create | Read | Update | Delete/Cancel | Search, Validation, or Report |
|---|---|:---:|:---:|:---:|:---:|:---:|
| Ming Hao | Authentication and Users | ✓ | ✓ | ✓ | — | Session/account validation |
| MM | Appointments | ✓ | ✓ | ✓ | ✓ | Booking-conflict validation |
| Wei Jin | Services | ✓ | ✓ | ✓ | ✓ | Search and availability filter |
| Jason | Queue | ✓ | ✓ | ✓ | ✓ | Queue order and position |
| Ray 5 | Staff and User Administration | ✓ | ✓ | ✓ | ✓ | Staff search and filter |
| Kay Yi | Authorization, Feedback, Dashboard, Reports | ✓ | ✓ | ✓ | ✓ | Aggregated reports |

---

## CRUD Operations by Module

| Module | Create | Read | Update | Delete or Cancel |
|---|:---:|:---:|:---:|:---:|
| Users | ✓ | ✓ | ✓ | ✓ |
| Services | ✓ | ✓ | ✓ | ✓ |
| Appointments | ✓ | ✓ | ✓ | ✓ |
| Queue | ✓ | ✓ | ✓ | ✓ |
| Staff | ✓ | ✓ | ✓ | ✓ |
| Feedback | ✓ | ✓ | ✓ | ✓ |

---

## Suggested Git Branches

Each member should develop on a separate feature branch.

| Team Member | Suggested Branch |
|---|---|
| Ming Hao | `feature/authentication` |
| MM | `feature/appointment-booking` |
| Wei Jin | `feature/service-management` |
| Jason | `feature/queue-management` |
| Ray 5 | `feature/staff-user-management` |
| Kay Yi | `feature/authorization-dashboard-reports` |

Recommended workflow:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

After completing and testing the feature:

```bash
git add .
git commit -m "feat: describe completed feature"
git push -u origin feature/your-feature-name
```

Create a pull request into `main`. The feature should be reviewed before it is merged.

---

## Integration Rules

To reduce merge conflicts:

- Each member should mainly modify files within their assigned module.
- Shared files such as `app.js`, navigation partials, database schema, and common middleware should be coordinated before changes are made.
- Members should not directly overwrite another member's controller, model, route, or view files.
- Every route must validate user input.
- Protected routes must apply authentication and role middleware.
- SQL statements must use parameterized queries.
- Passwords must never be stored as plain text.
- A user must only be able to edit records that they own unless the user is an administrator.
- Changes should be tested locally before a pull request is created.
- Pull requests should include screenshots and a brief testing description.

---

## Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/jackso271/Queue-Appointment-System-C237.git
cd Queue-Appointment-System-C237
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create the Database

Open MySQL and run:

```sql
CREATE DATABASE queueease;
```

Import the schema:

```text
database/queueease.sql
```

Optional sample data may be imported from:

```text
database/seed.sql
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=queueease
PORT=3000
SESSION_SECRET=replace_with_a_long_random_secret
```

Do not commit the `.env` file to GitHub.

Create a safe example file named `.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=queueease
PORT=3000
SESSION_SECRET=
```

### 5. Run the Application

For normal execution:

```bash
npm start
```

For development with automatic restart:

```bash
npm run dev
```

Visit:

```text
http://localhost:3000
```

---

## Recommended Dependencies

```bash
npm install express ejs mysql2 dotenv bcrypt express-session
npm install --save-dev nodemon
```

Suggested `package.json` scripts:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
```

---

## Security Considerations

- Hash passwords using bcrypt.
- Store sensitive configuration values in `.env`.
- Use parameterized SQL queries to reduce SQL-injection risk.
- Validate and sanitize form input.
- Regenerate the session after successful login.
- Destroy the session during logout.
- Protect administrator routes with authentication and role middleware.
- Check record ownership before customer updates or deletions.
- Display friendly error pages without exposing database errors.
- Do not store plain-text passwords or secrets in GitHub.

---

## Testing Checklist

### Authentication

- [ ] A new customer can register.
- [ ] Duplicate email registration is rejected.
- [ ] A valid user can log in.
- [ ] An invalid password is rejected.
- [ ] A logged-out user cannot access protected pages.
- [ ] Logout destroys the session.

### Authorization

- [ ] A customer cannot access the administrator dashboard.
- [ ] An administrator can access administrator routes.
- [ ] A customer cannot edit another customer's appointment.
- [ ] Unauthorized access displays an appropriate error or redirect.

### Appointments

- [ ] A customer can create an appointment.
- [ ] Conflicting booking slots are rejected.
- [ ] A customer can view their own appointment history.
- [ ] An eligible appointment can be edited.
- [ ] An eligible appointment can be cancelled.

### Queue

- [ ] An approved appointment can check in.
- [ ] Queue numbers are generated correctly.
- [ ] The waiting queue is displayed in the correct order.
- [ ] Queue status changes from Waiting to Serving.
- [ ] Queue status changes from Serving to Completed.

### Administration

- [ ] Users can be searched and managed.
- [ ] Services can be created, edited, searched, and removed.
- [ ] Staff can be created, edited, searched, and removed.
- [ ] Appointment status can be updated.
- [ ] Dashboard totals match database records.
- [ ] Feedback statistics are calculated correctly.

---

## Future Improvements

- Email appointment confirmation
- SMS appointment reminders
- QR-code check-in
- Online payment integration
- Google Calendar integration
- Live queue tracking
- Estimated waiting-time calculation
- Staff scheduling
- Appointment rescheduling notifications
- Exportable PDF or CSV reports
- Multi-branch business support

---

## Team Members

| Name | Assigned Feature | Primary Database Responsibility |
|---|---|---|
| Ming Hao | Authentication and account security | Users |
| MM | Appointment booking and history | Appointments |
| Wei Jin | Service management | Services |
| Jason | Queue management | Queue |
| Ray 5 | Staff and administrative user management | Staff and related Users operations |
| Kay Yi | Authorization, dashboard, feedback, and reports | Feedback and multi-table reporting |

---

## Contribution Evidence

Each team member should maintain evidence of their contribution through:

- Feature branch commits
- Pull requests
- Code comments where appropriate
- Screenshots of completed features
- Database queries or model functions
- Testing records
- Individual explanation of assigned code
- Development reflection documentation where required

---

## License

This project is developed for educational purposes as part of Republic Polytechnic's C237 Software Application Development module.
