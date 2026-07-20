# QueueEase – Queue & Appointment Management System

QueueEase is a web-based queue and appointment management application developed for the Republic Polytechnic C237 Software Application Development CA2 project.

The system enables customers to book appointments and monitor their queue status online. Administrators can manage services, staff, users, appointments, queues, feedback and operational reports through a centralised dashboard.

QueueEase is developed using Node.js, Express.js, MySQL, EJS and Bootstrap.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Project Objectives](#project-objectives)
- [Why QueueEase Was Chosen](#why-queueease-was-chosen)
- [Intended Users](#intended-users)
- [Core Resource](#core-resource)
- [CA2 Requirement Mapping](#ca2-requirement-mapping)
- [User Roles and Permissions](#user-roles-and-permissions)
- [System Features](#system-features)
- [Personalisation](#personalisation)
- [Meaningful Enhancements](#meaningful-enhancements)
- [Application Flow](#application-flow)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [Database Relationships](#database-relationships)
- [Team Responsibilities](#team-responsibilities)
- [Database Interactions by Team Member](#database-interactions-by-team-member)
- [Project Structure](#project-structure)
- [Installation Guide](#installation-guide)
- [Security Considerations](#security-considerations)
- [Testing Checklist](#testing-checklist)
- [Git Workflow](#git-workflow)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [Contribution Evidence](#contribution-evidence)
- [Licence](#licence)

---

# Project Overview

QueueEase is designed to digitalise appointment scheduling and queue management for small and medium-sized service businesses.

Customers can register an account, log in, view available services, book appointments, check in for approved appointments, receive a queue number and monitor their queue status.

Administrators can manage daily business operations such as:

- Customer accounts
- Staff records
- Services
- Appointments
- Queue progression
- Customer feedback
- Dashboard statistics
- Operational reports

Authentication and role-based authorization are used to ensure that users can access only the pages and actions permitted by their assigned role.

---

# Problem Statement

Many clinics, salons, tuition centres, consultation services and repair businesses still manage appointments through:

- Phone calls
- WhatsApp messages
- Spreadsheets
- Paper appointment books
- Manual queue numbers

These methods can result in:

- Double bookings
- Long waiting times
- Missed or forgotten appointments
- Unclear queue order
- Difficulty tracking appointment history
- Inefficient customer and staff management
- Inaccurate operational records
- Unauthorized access to management functions

QueueEase addresses these problems by combining appointment booking, queue management and administrative control within one secure web application.

---

# Project Objectives

QueueEase aims to:

1. Digitalise appointment booking and queue management.
2. Reduce scheduling conflicts and double bookings.
3. Allow customers to book appointments online at any time.
4. Allow customers to manage their own appointment information.
5. Provide customers with queue numbers and queue-status information.
6. Allow administrators to manage services, staff, users and appointments.
7. Protect restricted functions through authentication and authorization.
8. Provide search, filter and sorting functions for locating records.
9. Improve the customer waiting experience.
10. Provide dashboard statistics and reports for business operations.

---

# Project Folder Structure

The QueueEase project follows a modular structure to keep the application organised and make it easier for team members to work on separate features.

```text
Queue-Appointment-System-C237/
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
│   ├── appointmentModel.js
│   ├── serviceModel.js
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
├── views/
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   │
│   ├── appointments/
│   │   ├── index.ejs
│   │   ├── create.ejs
│   │   ├── details.ejs
│   │   └── edit.ejs
│   │
│   ├── services/
│   │   ├── index.ejs
│   │   ├── create.ejs
│   │   ├── details.ejs
│   │   └── edit.ejs
│   │
│   ├── queue/
│   │   ├── index.ejs
│   │   ├── customer-status.ejs
│   │   └── admin-queue.ejs
│   │
│   ├── staff/
│   │   ├── index.ejs
│   │   ├── create.ejs
│   │   ├── details.ejs
│   │   └── edit.ejs
│   │
│   ├── users/
│   │   ├── index.ejs
│   │   ├── profile.ejs
│   │   └── edit.ejs
│   │
│   ├── feedback/
│   │   ├── index.ejs
│   │   ├── create.ejs
│   │   └── edit.ejs
│   │
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   └── reports.ejs
│   │
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── navbar.ejs
│   │   ├── footer.ejs
│   │   └── messages.ejs
│   │
│   ├── errors/
│   │   ├── 403.ejs
│   │   ├── 404.ejs
│   │   └── 500.ejs
│   │
│   └── index.ejs
│
├── public/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── appointment.js
│   │   └── queue.js
│   │
│   └── images/
│
├── database/
│   ├── queueease.sql
│   └── seed.sql
│
├── .env
├── .env.example
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
└── README.md
```

## Folder Explanation

| Folder or File | Purpose |
|---|---|
| `config/` | Stores application configuration such as the MySQL database connection |
| `controllers/` | Contains server-side business logic for each feature |
| `middleware/` | Contains authentication, authorization and validation checks |
| `models/` | Contains MySQL queries and database interaction functions |
| `routes/` | Defines the Express routes for each module |
| `views/` | Contains all EJS pages displayed to users |
| `views/partials/` | Contains reusable EJS components such as the navigation bar and footer |
| `views/errors/` | Contains custom error pages |
| `public/css/` | Contains application stylesheets |
| `public/js/` | Contains browser-side JavaScript |
| `public/images/` | Contains logos, icons and other images |
| `database/` | Contains the MySQL schema and optional sample data |
| `.env` | Stores private environment variables and must not be committed |
| `.env.example` | Shows the environment variables required to run the project |
| `app.js` | Main application entry point |
| `package.json` | Stores dependencies, project details and npm scripts |
| `README.md` | Contains the project documentation |

## Application Architecture

QueueEase follows a simplified MVC-style structure:

```text
User Request
     ↓
Route
     ↓
Middleware
     ↓
Controller
     ↓
Model / SQL Query
     ↓
MySQL Database
     ↓
Controller Response
     ↓
EJS View or Redirect
```

### Example

When a customer books an appointment:

```text
Customer submits appointment form
                ↓
appointmentRoutes.js
                ↓
authMiddleware.js
                ↓
appointmentController.js
                ↓
appointmentModel.js
                ↓
Appointments table in MySQL
                ↓
Customer is redirected to appointment history
```

## Shared Files

Some files will be edited by multiple team members and should be coordinated carefully:

- `app.js`
- `database/queueease.sql`
- `views/partials/navbar.ejs`
- `public/css/style.css`
- `package.json`

Each member should mainly work inside their assigned controller, model, route and view folders to reduce merge conflicts.

---

# Why QueueEase Was Chosen

QueueEase was chosen because appointment and queue management is a common real-world problem experienced by many service businesses.

Manual booking systems can become difficult to manage as the number of customers increases. A digital platform provides a more organised way to store information, prevent conflicting bookings and track customers through the service process.

The application is meaningful because it provides benefits to both customers and business administrators.

## Benefits for Customers

- Convenient online booking
- Access to personal appointment history
- Clear appointment status
- Queue-number visibility
- Reduced uncertainty while waiting
- Ability to update personal information

## Benefits for Administrators

- Centralised record management
- Better appointment organisation
- Improved queue control
- Easier service and staff management
- Searchable customer information
- Dashboard statistics for decision-making

---

# Intended Users

## Customer

Customers use QueueEase to arrange and manage their appointments.

Customers can:

- Register an account
- Log in securely
- View available services
- Book an appointment
- View their appointment history
- View appointment details
- Edit an eligible appointment
- Cancel an eligible appointment
- Check in for an approved appointment
- Receive a queue number
- View their queue position and status
- Update their profile
- Submit feedback after a completed appointment

## Administrator

Administrators manage QueueEase and monitor business operations.

Administrators can:

- Access the administrator dashboard
- Manage customer accounts
- Manage staff records
- Manage services
- View and manage appointments
- Approve or reject appointments
- Update appointment statuses
- Monitor the waiting queue
- Call the next customer
- Update queue statuses
- Search and filter records
- View customer feedback
- View dashboard statistics
- Generate operational reports

---

# Core Resource

The main resource in QueueEase is the **Appointment**.

Customers can perform the following actions on appointments:

| CRUD Operation | QueueEase Action |
|---|---|
| Create | Book a new appointment |
| Read | View appointment history and details |
| Update | Edit an eligible appointment |
| Delete/Cancel | Cancel an eligible appointment |

The Appointment resource connects the customer, service, staff, queue and feedback modules.

## Supporting Modules

QueueEase also includes:

- Authentication and authorization
- Service management
- Queue management
- Staff management
- User administration
- Feedback management
- Dashboard and reporting

---

# CA2 Requirement Mapping

| CA2 Requirement | QueueEase Implementation |
|---|---|
| User login system | Registration, login, logout and session management |
| Authenticated and unauthenticated users | Protected routes require a valid login session |
| At least two user roles | Customer and Administrator |
| Different role permissions | Customers manage their own records while administrators manage system records |
| Resource creation | Customers create appointments |
| Resource viewing | Customers and administrators view appointment information |
| Resource updating | Eligible appointments can be edited |
| Resource deletion | Eligible appointments can be cancelled |
| Personalisation | Customers see and manage only their own profile, appointments, queues and feedback |
| Finding information | Search, filtering and sorting are provided |
| User-friendly interface | EJS pages use Bootstrap for organised and responsive layouts |
| JavaScript and database interaction | Each team member owns a feature with server-side JavaScript and SQL operations |
| Meaningful enhancement | Queue check-in, queue-number generation and queue-status progression |
| Team contribution | Each member has a defined module and database responsibility |

---

# User Roles and Permissions

QueueEase contains two main user roles:

1. Customer
2. Administrator

## Customer Permissions

Customers are allowed to:

- View available services
- Create appointments
- View their own appointments
- Edit their own eligible appointments
- Cancel their own eligible appointments
- View their own queue record
- Update their own profile
- Submit feedback for their completed appointments

Customers are not allowed to:

- Access the administrator dashboard
- Manage other user accounts
- Create, edit or delete services
- Manage staff records
- Manage another customer's appointment
- Manage another customer's queue record
- View restricted reports
- Change their own role to Administrator

## Administrator Permissions

Administrators are allowed to:

- Access protected administrator routes
- Manage users
- Manage staff
- Manage services
- Manage appointments
- Approve or reject appointments
- Update appointment statuses
- Manage queue progression
- View customer feedback
- Search and filter records
- View dashboard statistics
- View operational reports

---

# System Features

## 1. Authentication and Authorization

Authentication verifies the identity of a user.

Authorization determines what the authenticated user is permitted to access.

### Authentication Features

- User registration
- User login
- Password hashing using bcrypt
- Session creation
- Session validation
- Session regeneration after login
- Logout
- Session destruction

### Authorization Features

- Role-based access control
- Authentication middleware
- Administrator middleware
- Protected customer routes
- Protected administrator routes
- Ownership checks
- Unauthorized-access handling

### Example Authentication Flow

```text
User submits login form
        ↓
POST /login
        ↓
Server searches for the email in MySQL
        ↓
Hashed password is compared using bcrypt
        ↓
A session is created when the login is valid
        ↓
The user is redirected according to their role
```

### Example Authorization Flow

```text
User requests a protected route
        ↓
Authentication middleware checks the session
        ↓
Authorization middleware checks the user role
        ↓
Access is allowed or rejected
```

---

## 2. Appointment Management

Appointment management is the main CRUD feature of QueueEase.

### Customer Appointment Functions

- Book a new appointment
- Select an available service
- Choose an appointment date and time
- Add appointment remarks
- View appointment history
- View appointment details
- Edit an eligible appointment
- Cancel an eligible appointment

### Administrator Appointment Functions

- View all appointments
- View appointment details
- Approve an appointment
- Reject an appointment
- Assign a staff member
- Update appointment status
- Search appointments
- Filter appointments by status
- Sort appointments by date or time

### Appointment Statuses

- Pending
- Approved
- Rejected
- Completed
- Cancelled

### Booking Conflict Validation

Before an appointment is created or updated, the system checks whether the selected date, time and staff member are already assigned to another active appointment.

This reduces the possibility of double bookings.

---

## 3. Queue Management

The queue module manages customers who have arrived for approved appointments.

### Customer Queue Functions

- Check in for an approved appointment
- Receive a queue number
- View queue status
- View current queue position
- View whether they are waiting, being served or completed

### Administrator Queue Functions

- View the current waiting queue
- View queue records in queue-number order
- Call the next customer
- Change a queue record from Waiting to Serving
- Change a queue record from Serving to Completed
- Cancel an invalid queue entry
- Monitor the number of waiting customers

### Queue Statuses

- Waiting
- Serving
- Completed
- Cancelled

### Example Queue Progression

```text
Approved Appointment
        ↓
Customer Checks In
        ↓
Queue Number Generated
        ↓
Waiting
        ↓
Serving
        ↓
Completed
```

---

## 4. Service Management

The service module stores the services that customers can select during appointment booking.

Administrators can:

- Create a service
- View all services
- View service details
- Edit a service
- Delete a service when permitted
- Search services by name
- Filter services by availability
- Mark a service as available or unavailable

Each service includes:

- Service name
- Description
- Duration
- Price
- Availability status

Customers can view only services that are available for booking.

---

## 5. Staff Management

The staff module stores employee information and availability.

Administrators can:

- Add a staff member
- View all staff members
- View staff details
- Edit staff information
- Delete an inactive staff member
- Search staff by name
- Filter staff by position
- Filter staff by availability
- Assign available staff to appointments

Each staff record includes:

- Full name
- Email
- Phone number
- Position
- Availability status

---

## 6. User Administration

Administrators can manage registered QueueEase users.

Administrator functions include:

- View all users
- View a user profile
- Search users by name or email
- Update account status
- Update a user's role where permitted
- Suspend an account
- Reactivate an account
- Delete an account when permitted

User administration is separate from customer authentication.

The authentication member develops account registration and login security, while the user-administration member develops administrator-facing account-management functions.

---

## 7. Feedback Management

Customers can submit feedback after completing an appointment.

Feedback includes:

- Rating
- Comments
- Submission date
- Related customer
- Related appointment
- Related service

### Customer Feedback Functions

- Submit feedback for a completed appointment
- View submitted feedback
- Edit feedback when permitted
- Delete feedback when permitted

### Administrator Feedback Functions

- View all feedback
- Filter feedback by rating
- Filter feedback by date
- Remove inappropriate feedback
- View average customer rating
- Include feedback information in reports

---

## 8. Dashboard and Reports

The administrator dashboard provides a summary of QueueEase operations.

### Dashboard Statistics

- Total users
- Total staff
- Total services
- Available services
- Today's appointments
- Pending appointments
- Approved appointments
- Completed appointments
- Cancelled appointments
- Customers currently waiting
- Customers currently being served
- Average feedback rating

### Report Filters

Reports may be filtered or grouped by:

- Date
- Service
- Appointment status
- Queue status
- Staff availability
- Feedback rating

Dashboard values are calculated from the database instead of being hardcoded.

---

## 9. Search, Filter and Sort

QueueEase allows users to find information efficiently.

### Search

Records can be searched using:

- Customer name
- Customer email
- Service name
- Staff name
- Appointment ID
- Queue number

### Filter

Records can be filtered using:

- Pending
- Approved
- Rejected
- Waiting
- Serving
- Completed
- Cancelled
- Available
- Unavailable

### Sort

Records can be sorted using:

- Appointment date
- Appointment time
- Service name
- Customer name
- Queue number
- Booking status
- Feedback rating

---

# Personalisation

QueueEase provides a personalised experience for every authenticated customer.

A customer can:

- View only their own profile
- Update only their own profile
- View only their own appointment history
- Edit only appointments that belong to them
- Cancel only appointments that belong to them
- View only their own queue information
- Submit feedback only for their own completed appointments

The logged-in user's ID is obtained from the session and used in SQL queries to restrict access to the correct records.

Example:

```sql
SELECT *
FROM Appointments
WHERE userID = ?;
```

Ownership checks are also performed before update and cancellation actions.

---

# Meaningful Enhancements

## Queue Check-In and Queue Progression

The main enhancement beyond basic appointment CRUD is the queue-management feature.

### Problem Addressed

A booking system alone does not help a business manage customers after they arrive. Customers may still experience unclear waiting order and uncertainty about when they will be served.

### Enhancement Introduced

QueueEase allows an approved customer to:

1. Check in for their appointment.
2. Receive a queue number.
3. View their queue position.
4. Monitor changes to their queue status.

Administrators can:

1. View customers in queue-number order.
2. Call the next customer.
3. Update the customer to Serving.
4. Mark the queue entry as Completed.

### Technical Implementation

The enhancement involves:

- Express routes
- Server-side JavaScript
- MySQL queries
- Queue-number generation
- Appointment validation
- Queue-status validation
- Database joins
- Role-based authorization
- EJS rendering

This enhancement improves the application behaviour instead of adding only cosmetic changes.

## Booking-Conflict Prevention

QueueEase also checks for existing appointments before accepting a selected date and time.

This prevents two active appointments from occupying the same booking slot.

## Dynamic Dashboard Statistics

Dashboard values are generated using SQL aggregation queries such as:

```sql
SELECT status, COUNT(*) AS total
FROM Appointments
GROUP BY status;
```

This allows administrators to view real database information instead of hardcoded numbers.

---

# Application Flow

QueueEase follows a server-side MVC-style structure.

```text
User Action
    ↓
Express Route
    ↓
Middleware Validation
    ↓
Controller Logic
    ↓
Model / SQL Query
    ↓
MySQL Database
    ↓
Controller Response
    ↓
EJS Page or Redirect
```

## Appointment Booking Flow

```text
Customer completes booking form
        ↓
POST /appointments
        ↓
Authentication middleware validates session
        ↓
Controller validates the form
        ↓
Model checks for conflicting slots
        ↓
INSERT query creates the appointment
        ↓
Customer is redirected to appointment history
```

## Administrator Queue Flow

```text
Administrator selects "Call Next"
        ↓
POST /admin/queue/:id/serve
        ↓
Authentication middleware checks login
        ↓
Authorization middleware checks Admin role
        ↓
Queue record is updated to Serving
        ↓
Queue page is refreshed
```

---

# Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Server-side JavaScript runtime |
| Express.js | Web application framework |
| MySQL | Relational database |
| EJS | Server-side template rendering |
| Bootstrap | Responsive interface design |
| HTML5 | Page structure |
| CSS3 | Application styling |
| JavaScript | Client-side and server-side logic |
| bcrypt | Password hashing |
| express-session | Login-session management |
| dotenv | Environment-variable management |
| mysql2 | MySQL database connection |
| Git | Version control |
| GitHub | Repository and team collaboration |
| Render or similar | Application deployment |
| Online MySQL service | Hosted production database |

---

# Database Design

QueueEase uses six main database tables.

## 1. Users

Stores customer and administrator account information.

| Field | Description |
|---|---|
| userID | Primary key |
| fullName | User's full name |
| email | Unique user email |
| password | Hashed password |
| phone | Contact number |
| role | Customer or Admin |
| accountStatus | Active, Suspended or Disabled |
| createdAt | Account creation date and time |

---

## 2. Services

Stores services offered by the business.

| Field | Description |
|---|---|
| serviceID | Primary key |
| serviceName | Name of the service |
| description | Service details |
| duration | Estimated duration in minutes |
| price | Service price |
| status | Available or Unavailable |

---

## 3. Appointments

Stores customer appointment bookings.

| Field | Description |
|---|---|
| appointmentID | Primary key |
| userID | Foreign key referencing Users |
| serviceID | Foreign key referencing Services |
| staffID | Foreign key referencing Staff; may be null until assigned |
| appointmentDate | Appointment date |
| appointmentTime | Appointment time |
| status | Pending, Approved, Rejected, Completed or Cancelled |
| remarks | Additional notes |
| createdAt | Booking creation date and time |

---

## 4. Queue

Stores appointment check-ins and queue progression.

| Field | Description |
|---|---|
| queueID | Primary key |
| appointmentID | Foreign key referencing Appointments |
| queueNumber | Customer queue number |
| queueStatus | Waiting, Serving, Completed or Cancelled |
| checkInTime | Time the customer checked in |
| calledTime | Time the customer was called |
| completedTime | Time the service was completed |

---

## 5. Staff

Stores staff information and availability.

| Field | Description |
|---|---|
| staffID | Primary key |
| fullName | Staff member's name |
| email | Staff email |
| phone | Staff contact number |
| position | Staff role or job title |
| availabilityStatus | Available or Unavailable |

---

## 6. Feedback

Stores feedback submitted after completed appointments.

| Field | Description |
|---|---|
| feedbackID | Primary key |
| appointmentID | Foreign key referencing Appointments |
| userID | Foreign key referencing Users |
| rating | Customer rating from 1 to 5 |
| comments | Customer comments |
| submittedDate | Feedback submission date |

---

# Database Relationships

- One user can create many appointments.
- One service can be selected for many appointments.
- One staff member can be assigned to many appointments.
- One appointment can have zero or one active queue record.
- One completed appointment can have zero or one feedback record.
- One user can submit feedback for multiple completed appointments.

```text
Users 1 ───────────────< Appointments >────────────── 1 Services
                              │
                              ├────────────────────── 1 Staff
                              │
                              ├────────────────────── 0..1 Queue
                              │
                              └────────────────────── 0..1 Feedback

Users 1 ─────────────────────────────────────────────< Feedback
```

---

# Team Responsibilities

Each member is responsible for a substantial feature involving server-side JavaScript and database interaction.

| Team Member | Main Feature Responsibility | Primary Database Responsibility |
|---|---|---|
| Ming Hao | Authentication and Authorization | Users |
| MM | Appointment Booking and Appointment History | Appointments |
| Wei Jin | Service Management | Services |
| Jason | Queue Management | Queue |
| Ray | Staff and User Administration | Staff and related Users operations |
| Kay Yi | Dashboard, Reports and Feedback | Feedback and multi-table reporting |

## Shared Responsibilities

All members should contribute to shared files where required, including:

- `app.js`
- Database schema
- Navigation partials
- Shared middleware
- Shared styling
- Integration testing

Changes to shared files should be coordinated to reduce merge conflicts.

---

# Database Interactions by Team Member

## Ming Hao – Authentication and Authorization

Ming Hao is responsible for user identity, login security, session handling and role-based route protection.

### Main Functions

- User registration
- User login
- User logout
- Password hashing
- Session creation
- Authentication middleware
- Authorization middleware
- Customer and administrator route protection

### Six Database Interactions

1. Create a new customer account.
2. Read a user by email during login.
3. Read a user by ID during session validation.
4. Update the user's hashed password.
5. Update the user's profile information.
6. Read the user's role and account status for authorization.

### Example SQL Actions

```sql
INSERT INTO Users
(fullName, email, password, phone, role)
VALUES (?, ?, ?, ?, 'Customer');
```

```sql
SELECT *
FROM Users
WHERE email = ?;
```

```sql
SELECT userID, fullName, email, role, accountStatus
FROM Users
WHERE userID = ?;
```

```sql
UPDATE Users
SET password = ?
WHERE userID = ?;
```

```sql
UPDATE Users
SET fullName = ?, phone = ?
WHERE userID = ?;
```

```sql
SELECT role, accountStatus
FROM Users
WHERE userID = ?;
```

---

## MM – Appointment Management

MM is responsible for appointment creation, viewing, editing, cancellation and booking validation.

### Main Functions

- Book appointment
- View appointment history
- View appointment details
- Edit appointment
- Cancel appointment
- Prevent conflicting bookings

### Six Database Interactions

1. Create a new appointment.
2. Read all appointments belonging to the logged-in customer.
3. Read one appointment with customer, service and staff details.
4. Update appointment date, time, service or remarks.
5. Cancel an eligible appointment.
6. Check whether the selected booking slot already exists.

### Example SQL Actions

```sql
INSERT INTO Appointments
(userID, serviceID, appointmentDate, appointmentTime, status, remarks)
VALUES (?, ?, ?, ?, 'Pending', ?);
```

```sql
SELECT *
FROM Appointments
WHERE userID = ?
ORDER BY appointmentDate, appointmentTime;
```

```sql
SELECT
    a.*,
    u.fullName AS customerName,
    s.serviceName,
    st.fullName AS staffName
FROM Appointments a
JOIN Users u ON a.userID = u.userID
JOIN Services s ON a.serviceID = s.serviceID
LEFT JOIN Staff st ON a.staffID = st.staffID
WHERE a.appointmentID = ?;
```

```sql
UPDATE Appointments
SET serviceID = ?, appointmentDate = ?, appointmentTime = ?, remarks = ?
WHERE appointmentID = ? AND userID = ?;
```

```sql
UPDATE Appointments
SET status = 'Cancelled'
WHERE appointmentID = ? AND userID = ?;
```

```sql
SELECT COUNT(*) AS conflictCount
FROM Appointments
WHERE appointmentDate = ?
AND appointmentTime = ?
AND status IN ('Pending', 'Approved');
```

---

## Wei Jin – Service Management

Wei Jin is responsible for services that customers can select during appointment booking.

### Main Functions

- Add service
- View services
- View service details
- Edit service
- Delete service
- Search and filter services

### Six Database Interactions

1. Create a service.
2. Read all services.
3. Read one service by ID.
4. Update service details.
5. Delete a service when permitted.
6. Search or filter services by name and status.

### Example SQL Actions

```sql
INSERT INTO Services
(serviceName, description, duration, price, status)
VALUES (?, ?, ?, ?, ?);
```

```sql
SELECT *
FROM Services
ORDER BY serviceName;
```

```sql
SELECT *
FROM Services
WHERE serviceID = ?;
```

```sql
UPDATE Services
SET serviceName = ?, description = ?, duration = ?, price = ?, status = ?
WHERE serviceID = ?;
```

```sql
DELETE FROM Services
WHERE serviceID = ?;
```

```sql
SELECT *
FROM Services
WHERE serviceName LIKE ?
AND status = ?;
```

---

## Jason – Queue Management

Jason is responsible for customer check-in, queue-number generation and queue progression.

### Main Functions

- Create queue entry
- Generate queue number
- View waiting queue
- View customer queue position
- Call next customer
- Complete or cancel queue entry

### Six Database Interactions

1. Create a queue record after an approved appointment checks in.
2. Read the waiting queue in queue-number order.
3. Read a customer's queue position and status.
4. Update a queue entry from Waiting to Serving.
5. Update a queue entry from Serving to Completed.
6. Cancel an invalid queue entry.

### Example SQL Actions

```sql
INSERT INTO Queue
(appointmentID, queueNumber, queueStatus, checkInTime)
VALUES (?, ?, 'Waiting', NOW());
```

```sql
SELECT *
FROM Queue
WHERE queueStatus = 'Waiting'
ORDER BY queueNumber;
```

```sql
SELECT *
FROM Queue
WHERE appointmentID = ?;
```

```sql
UPDATE Queue
SET queueStatus = 'Serving',
    calledTime = NOW()
WHERE queueID = ?;
```

```sql
UPDATE Queue
SET queueStatus = 'Completed',
    completedTime = NOW()
WHERE queueID = ?;
```

```sql
UPDATE Queue
SET queueStatus = 'Cancelled'
WHERE queueID = ?;
```

---

## Ray – Staff and User Administration

Ray is responsible for staff records and administrator-facing user-management functions.

### Main Functions

- Add staff
- View staff
- Edit staff
- Delete staff
- Search and filter staff
- Manage customer account status

### Six Database Interactions

1. Create a staff record.
2. Read all staff records.
3. Read one staff member by ID.
4. Update staff details and availability.
5. Delete an inactive staff member.
6. Search staff by name, position or availability.

### Example SQL Actions

```sql
INSERT INTO Staff
(fullName, email, phone, position, availabilityStatus)
VALUES (?, ?, ?, ?, ?);
```

```sql
SELECT *
FROM Staff
ORDER BY fullName;
```

```sql
SELECT *
FROM Staff
WHERE staffID = ?;
```

```sql
UPDATE Staff
SET fullName = ?, email = ?, phone = ?, position = ?, availabilityStatus = ?
WHERE staffID = ?;
```

```sql
DELETE FROM Staff
WHERE staffID = ?;
```

```sql
SELECT *
FROM Staff
WHERE fullName LIKE ?
OR position LIKE ?
OR availabilityStatus = ?;
```

Ray may also perform administrator account-management operations such as:

```sql
UPDATE Users
SET accountStatus = ?
WHERE userID = ?;
```

Coordination with Ming Hao is required when working with the Users table so that authentication code is not overwritten.

---

## Kay Yi – Dashboard, Reports and Feedback

Kay Yi is responsible for feedback CRUD, dashboard statistics and operational reporting.

### Main Functions

- Submit feedback
- View feedback
- Edit feedback
- Delete feedback
- Calculate dashboard statistics
- Generate operational reports

### Six Database Interactions

1. Create feedback for a completed appointment.
2. Read feedback with customer and service information.
3. Update feedback when permitted.
4. Delete feedback when permitted.
5. Calculate average ratings.
6. Read aggregated dashboard and report information.

### Example SQL Actions

```sql
INSERT INTO Feedback
(appointmentID, userID, rating, comments, submittedDate)
VALUES (?, ?, ?, ?, NOW());
```

```sql
SELECT
    f.*,
    u.fullName AS customerName,
    s.serviceName
FROM Feedback f
JOIN Users u ON f.userID = u.userID
JOIN Appointments a ON f.appointmentID = a.appointmentID
JOIN Services s ON a.serviceID = s.serviceID
ORDER BY f.submittedDate DESC;
```

```sql
UPDATE Feedback
SET rating = ?, comments = ?
WHERE feedbackID = ? AND userID = ?;
```

```sql
DELETE FROM Feedback
WHERE feedbackID = ?;
```

```sql
SELECT AVG(rating) AS averageRating
FROM Feedback;
```

```sql
SELECT status, COUNT(*) AS total
FROM Appointments
GROUP BY status;
```

Additional dashboard queries may include:

```sql
SELECT COUNT(*) AS totalUsers
FROM Users;
```

```sql
SELECT COUNT(*) AS totalServices
FROM Services
WHERE status = 'Available';
```

```sql
SELECT COUNT(*) AS waitingCustomers
FROM Queue
WHERE queueStatus = 'Waiting';
```

---

# Database Interaction Summary

| Member | Primary Module | Create | Read | Update | Delete/Cancel | Additional Logic |
|---|---|---:|---:|---:|---:|---|
| Ming Hao | Authentication and Authorization | ✓ | ✓ | ✓ | — | Session and role validation |
| MM | Appointments | ✓ | ✓ | ✓ | ✓ | Conflict validation |
| Wei Jin | Services | ✓ | ✓ | ✓ | ✓ | Search and availability filter |
| Jason | Queue | ✓ | ✓ | ✓ | ✓ | Queue number and position |
| Ray | Staff and User Administration | ✓ | ✓ | ✓ | ✓ | Search and account management |
| Kay Yi | Feedback, Dashboard and Reports | ✓ | ✓ | ✓ | ✓ | Aggregation and reporting |

---

# CRUD Operations by Module

| Module | Create | Read | Update | Delete or Cancel |
|---|---:|---:|---:|---:|
| Users | ✓ | ✓ | ✓ | ✓ |
| Services | ✓ | ✓ | ✓ | ✓ |
| Appointments | ✓ | ✓ | ✓ | ✓ |
| Queue | ✓ | ✓ | ✓ | ✓ |
| Staff | ✓ | ✓ | ✓ | ✓ |
| Feedback | ✓ | ✓ | ✓ | ✓ |

---

# Project Structure

The planned QueueEase structure follows separation of routes, controllers, models, middleware, views and public assets.

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

## Folder Responsibilities

| Folder | Purpose |
|---|---|
| `config` | Database and application configuration |
| `controllers` | Request handling and business logic |
| `middleware` | Authentication, authorization and validation |
| `models` | SQL queries and database access |
| `routes` | Express route definitions |
| `views` | EJS pages and reusable partials |
| `public` | CSS, browser JavaScript and images |
| `database` | Database schema and optional sample data |

---

# Installation Guide

## Prerequisites

Install the following before running QueueEase:

- Node.js
- npm
- MySQL Server
- Git

## 1. Clone the Repository

```bash
git clone https://github.com/jackso271/Queue-Appointment-System-C237.git
cd Queue-Appointment-System-C237
```

## 2. Install Dependencies

```bash
npm install
```

Recommended dependencies:

```bash
npm install express ejs mysql2 dotenv bcrypt express-session
npm install --save-dev nodemon
```

## 3. Create the Database

Open MySQL and run:

```sql
CREATE DATABASE queueease;
```

Import the database schema:

```text
database/queueease.sql
```

Optional sample data may be imported from:

```text
database/seed.sql
```

## 4. Configure Environment Variables

Create a `.env` file in the project root.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=queueease
PORT=3000
SESSION_SECRET=replace_with_a_long_random_secret
```

Do not commit the `.env` file to GitHub.

Create a safe `.env.example` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=queueease
PORT=3000
SESSION_SECRET=
```

## 5. Configure Package Scripts

Recommended scripts:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
```

## 6. Run the Application

Normal execution:

```bash
npm start
```

Development execution:

```bash
npm run dev
```

Visit:

```text
http://localhost:3000
```

---

# Security Considerations

QueueEase should follow these security practices:

- Hash passwords using bcrypt.
- Never store plain-text passwords.
- Store sensitive values in `.env`.
- Do not commit `.env` to GitHub.
- Use parameterised SQL queries.
- Validate all form inputs.
- Sanitize user-provided data where appropriate.
- Regenerate the session after successful login.
- Destroy the session during logout.
- Protect customer routes with authentication middleware.
- Protect administrator routes with authentication and role middleware.
- Check record ownership before customer updates or deletions.
- Reject suspended or disabled accounts.
- Display friendly error pages without exposing database errors.
- Do not allow customers to modify their own role.

Example parameterised query:

```javascript
const sql = 'SELECT * FROM Users WHERE email = ?';

db.query(sql, [email], (error, results) => {
    // Handle the database response.
});
```

---

# User Interface and Experience

QueueEase aims to provide a clear and organised interface.

Planned UI features include:

- Responsive Bootstrap layouts
- Consistent navigation
- Reusable EJS partials
- Clear form labels
- Input validation messages
- Confirmation messages
- Appointment-status badges
- Queue-status badges
- Dashboard cards
- Search and filter controls
- Friendly empty-state messages
- Confirmation before destructive actions
- Mobile-friendly pages

The team will design its own interface and will not use a complete website template downloaded from the internet.

---

# Testing Checklist

## Authentication

- [ ] A new customer can register.
- [ ] Duplicate email registration is rejected.
- [ ] Passwords are stored as hashes.
- [ ] A valid user can log in.
- [ ] An invalid email or password is rejected.
- [ ] A suspended user cannot log in.
- [ ] A login session is created successfully.
- [ ] Logout destroys the session.
- [ ] A logged-out user cannot access protected pages.

## Authorization

- [ ] A customer cannot access the administrator dashboard.
- [ ] An administrator can access administrator routes.
- [ ] A customer cannot edit another customer's profile.
- [ ] A customer cannot edit another customer's appointment.
- [ ] A customer cannot view another customer's queue record.
- [ ] Unauthorized access redirects or displays an appropriate error.
- [ ] A customer cannot change their own role.

## Appointments

- [ ] A customer can create an appointment.
- [ ] Required appointment fields are validated.
- [ ] Conflicting booking slots are rejected.
- [ ] A customer can view their own appointment history.
- [ ] A customer can view appointment details.
- [ ] An eligible appointment can be edited.
- [ ] An eligible appointment can be cancelled.
- [ ] An administrator can approve or reject an appointment.
- [ ] Appointment-status changes are stored correctly.

## Queue

- [ ] Only an approved appointment can check in.
- [ ] Duplicate check-in is rejected.
- [ ] Queue numbers are generated correctly.
- [ ] The waiting queue is displayed in queue-number order.
- [ ] A customer can view their queue status.
- [ ] Queue status changes from Waiting to Serving.
- [ ] Queue status changes from Serving to Completed.
- [ ] A queue record can be cancelled when appropriate.

## Services

- [ ] An administrator can create a service.
- [ ] Services are displayed correctly.
- [ ] A service can be edited.
- [ ] A service can be deleted when permitted.
- [ ] Services can be searched.
- [ ] Services can be filtered by status.
- [ ] Unavailable services cannot be selected for a new booking.

## Staff and User Administration

- [ ] An administrator can create a staff record.
- [ ] Staff records can be viewed and edited.
- [ ] Staff can be searched and filtered.
- [ ] Staff availability can be updated.
- [ ] An administrator can view registered users.
- [ ] User account status can be updated.
- [ ] Suspended accounts are restricted correctly.

## Feedback, Dashboard and Reports

- [ ] A customer can submit feedback for a completed appointment.
- [ ] Duplicate feedback is rejected where required.
- [ ] Feedback can be viewed and filtered.
- [ ] Dashboard totals match database records.
- [ ] Appointment statistics are calculated correctly.
- [ ] Queue statistics are calculated correctly.
- [ ] Average feedback rating is calculated correctly.
- [ ] Report filters return the correct records.

---

# Git Workflow

Each team member should develop their feature on a separate branch.

| Team Member | Suggested Branch |
|---|---|
| Ming Hao | `feature/authentication-authorization` |
| MM | `feature/appointment-management` |
| Wei Jin | Service Management feature removed; services data remains shared |
| Jason | `feature/queue-management` |
| Ray | `feature/staff-user-management` |
| Kay Yi | `feature/dashboard-reports-feedback` |

## Create a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

## Commit and Push Changes

```bash
git add .
git commit -m "feat: describe completed feature"
git push -u origin feature/your-feature-name
```

Create a pull request into `main` after completing and testing the feature.

## Recommended Commit Types

```text
feat: add a new feature
fix: correct a problem
docs: update documentation
style: update interface styling
refactor: reorganise code without changing behaviour
test: add or update testing
```

## Pull Request Requirements

A pull request should include:

- Summary of the completed feature
- Main files changed
- Database interactions added
- Testing steps performed
- Screenshots where appropriate
- Known limitations
- Confirmation that the branch was updated from `main`

---

# Integration Rules

To reduce merge conflicts and maintain code quality:

1. Each member should mainly modify files within their assigned module.
2. Changes to `app.js` should be coordinated.
3. Changes to the database schema should be discussed before merging.
4. Members should not overwrite another member's controller, model, route or view.
5. Every route must validate required input.
6. Protected routes must apply appropriate middleware.
7. SQL statements must use parameterised queries.
8. Customers may update only records that they own.
9. Changes must be tested locally before creating a pull request.
10. Another member should review the pull request before merging.
11. The latest `main` branch should be pulled before beginning new work.
12. Merge conflicts should be resolved carefully rather than deleting another member's work.

---

# Development Status

Update this table throughout development.

| Module | Status |
|---|---|
| Project planning | Completed |
| Database design | Planned |
| Authentication and Authorization | Not Started |
| Appointment Management | Not Started |
| Service Management | Not Started |
| Queue Management | Not Started |
| Staff and User Administration | Not Started |
| Dashboard, Reports and Feedback | Not Started |
| Integration Testing | Not Started |
| Deployment | Not Started |
| Final Documentation | In Progress |

Status values may be updated to:

- Not Started
- In Progress
- Testing
- Completed

---

# Deployment

The completed QueueEase application will be deployed using:

- Render or a similar Node.js hosting platform
- An online MySQL database provider
- GitHub for the latest source code

The deployed environment should contain the same required environment variables as the local environment.

Production secrets must be configured through the hosting platform and must not be stored in the repository.

---

# Submission Requirements

Before submission, the team should prepare:

- Complete Node.js project folder
- Project folder without `node_modules`
- MySQL database exported as an `.sql` file
- Completed CA2 Team Development Journal
- Deployed application
- Online MySQL database
- GitHub repository with latest commits
- Contribution evidence for every team member
- Working live demonstration

Recommended project submission structure:

```text
TeamName_C237_ClassCode_CA2Submission.zip
```

---

# Presentation Preparation

Each member should be able to explain:

1. The purpose of their assigned feature.
2. The user problem addressed by the feature.
3. The application flow.
4. The Express route used.
5. The middleware applied.
6. The controller logic.
7. The SQL query.
8. The database table affected.
9. The response returned to the user.
10. Important implementation decisions.
11. Challenges encountered.
12. How those challenges were resolved.

A useful explanation structure is:

```text
User action
    ↓
Route
    ↓
Middleware
    ↓
Controller
    ↓
SQL query
    ↓
Database
    ↓
Response
```

---

# Future Improvements

Possible future improvements include:

- Email appointment confirmations
- Email or SMS appointment reminders
- QR-code check-in
- Estimated waiting-time calculation
- Automatic queue notifications
- Live queue updates
- Online payment integration
- Google Calendar integration
- Staff scheduling
- Appointment rescheduling notifications
- Exportable PDF reports
- Exportable CSV reports
- Multi-branch business support
- Customer notification preferences
- Administrator audit logs

These features are not part of the minimum implementation unless the team completes the core CA2 requirements first.

---

# Contribution Evidence

Each team member should maintain evidence of their work through:

- Feature-branch commits
- Pull requests
- Database queries
- Model functions
- Routes and controllers
- EJS pages
- Screenshots
- Testing records
- Development-journal entries
- Presentation explanation
- Code comments where appropriate

Every member must understand and explain the code used in their assigned feature, including code developed with AI assistance.

---

# Team Members

| Name | Assigned Feature | Primary Database Responsibility |
|---|---|---|
| Ming Hao | Authentication and Authorization | Users |
| MM | Appointment Booking and History | Appointments |
| Wei Jin | Service Management | Services |
| Jason | Queue Management | Queue |
| Ray | Staff and User Administration | Staff and related Users operations |
| Kay Yi | Dashboard, Reports and Feedback | Feedback and multi-table reporting |

---

# Licence

This project is developed for educational purposes as part of Republic Polytechnic's C237 Software Application Development Continuous Assessment 2.

The project is not intended for commercial use.
