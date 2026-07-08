# QueueEase – Queue & Appointment Management System

## Overview

QueueEase is a web-based Queue & Appointment Management System developed using Node.js, Express.js, MySQL, and EJS.

The application allows customers to conveniently book appointments online while enabling administrators to efficiently manage appointments, services, and customer information through a centralized dashboard.

The system aims to replace traditional manual booking methods such as phone calls, WhatsApp messages, and paper appointment books with a secure, digital solution.

---

# Problem Statement

Many small businesses such as clinics, salons, tuition centres, repair shops, and consultation services still rely on manual appointment booking methods.

These methods often result in:

- Double bookings
- Long customer waiting times
- Lost or forgotten appointments
- Difficulty tracking appointment history
- Inefficient customer management

QueueEase solves these problems by providing an online appointment management platform that improves scheduling accuracy and operational efficiency.

---

# Objectives

The objectives of QueueEase are to:

- Digitize appointment booking
- Reduce scheduling conflicts
- Improve queue management
- Allow customers to book appointments anytime
- Provide administrators with an easy-to-use management dashboard
- Improve customer experience

---

# Target Users

## Customer

Customers can:

- Register an account
- Login securely
- Book appointments
- View appointment history
- Cancel appointments
- Update personal profile

---

## Administrator

Administrators can:

- Manage users
- Manage services
- Manage appointments
- Update appointment status
- Search customers
- View system dashboard
- Monitor daily appointments

---

# System Features

## Authentication

- User Registration
- User Login
- Password Encryption
- Session Management
- Logout

---

## Customer Module

- Book Appointment
- View Appointment History
- Edit Appointment
- Cancel Appointment
- View Available Services

---

## Appointment Management

- Create Appointment
- Update Appointment
- Delete Appointment
- View Appointment Details

---

## Service Management

- Add Service
- Edit Service
- Delete Service
- Search Services

---

## User Management

- Add User
- Edit User
- Delete User
- Search Users

---

## Dashboard

Displays:

- Total Users
- Total Services
- Today's Appointments
- Pending Appointments
- Completed Appointments

---

## Search

Users can search by:

- Customer Name
- Service Name

---

## Filter

Appointments can be filtered by:

- Pending
- Approved
- Completed
- Cancelled

---

## Sort

Appointments can be sorted by:

- Appointment Date
- Appointment Time
- Service Name
- Booking Status

---

# Technologies Used

| Technology | Purpose |
|------------|----------|
| Node.js | Backend Runtime |
| Express.js | Web Framework |
| MySQL | Database |
| EJS | Server-side Rendering |
| Bootstrap | Responsive UI |
| HTML5 | Frontend Structure |
| CSS3 | Styling |
| JavaScript | Client-side Interaction |
| Git | Version Control |
| GitHub | Source Code Repository |

---

# Project Structure

```
QueueEase
│
├── routes
│   ├── authRoutes.js
│   ├── appointmentRoutes.js
│   ├── serviceRoutes.js
│   ├── adminRoutes.js
│
├── controllers
│
├── models
│
├── middleware
│
├── public
│   ├── css
│   ├── js
│   └── images
│
├── views
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── appointments.ejs
│   ├── services.ejs
│   └── adminDashboard.ejs
│
├── database
│   └── queueease.sql
│
├── app.js
├── package.json
└── README.md
```

---

# Database Design

## 1. Users

Stores customer and admin account information.

| Field | Description |
|------|-------------|
| userID | Primary Key |
| fullName | User's full name |
| email | User email |
| password | Encrypted password |
| phone | Contact number |
| role | Customer / Admin |

---

## 2. Services

Stores the services offered by the business.

| Field | Description |
|------|-------------|
| serviceID | Primary Key |
| serviceName | Name of service |
| description | Service details |
| duration | Duration of service |
| price | Service price |
| status | Available / Unavailable |

---

## 3. Appointments

Stores customer appointment bookings.

| Field | Description |
|------|-------------|
| appointmentID | Primary Key |
| userID | Foreign Key |
| serviceID | Foreign Key |
| appointmentDate | Appointment date |
| appointmentTime | Appointment time |
| status | Pending / Approved / Completed / Cancelled |
| remarks | Additional notes |

---

## 4. Queue

Stores queue numbers and walk-in customer status.

| Field | Description |
|------|-------------|
| queueID | Primary Key |
| appointmentID | Foreign Key |
| queueNumber | Customer queue number |
| queueStatus | Waiting / Serving / Completed / Cancelled |
| checkInTime | Time customer checked in |

---

## 5. Staff

Stores staff information and staff availability.

| Field | Description |
|------|-------------|
| staffID | Primary Key |
| fullName | Staff name |
| email | Staff email |
| phone | Staff contact |
| position | Staff role or job title |
| availabilityStatus | Available / Unavailable |

---

## 6. Feedback

Stores customer feedback after appointments.

| Field | Description |
|------|-------------|
| feedbackID | Primary Key |
| appointmentID | Foreign Key |
| userID | Foreign Key |
| rating | Customer rating |
| comments | Customer feedback |
| submittedDate | Date feedback was submitted |

# User Roles

## Customer

- Register
- Login
- Book Appointment
- View History
- Cancel Appointment

---

## Administrator

- Manage Users
- Manage Services
- Manage Appointments
- Update Appointment Status
- View Dashboard

---

# CRUD Operations

| Module | Create | Read | Update | Delete |
|---------|:------:|:----:|:------:|:------:|
| Users | ✓ | ✓ | ✓ | ✓ |
| Services | ✓ | ✓ | ✓ | ✓ |
| Appointments | ✓ | ✓ | ✓ | ✓ |

---

# Installation Guide

## Clone Repository

```bash
git clone https://github.com/yourusername/QueueEase.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Database

Create a MySQL database.

```sql
CREATE DATABASE queueease;
```

Import:

```
queueease.sql
```

---

## Configure Environment Variables

Create a `.env` file.

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=queueease
PORT=3000
SESSION_SECRET=yourSecretKey
```

---

## Run Application

```bash
npm start
```

or

```bash
nodemon app.js
```

---

Visit

```
http://localhost:3000
```

---

# Future Improvements

- Email Notifications
- SMS Appointment Reminder
- QR Code Check-In
- Online Payment Integration
- Google Calendar Integration
- Customer Feedback System
- Live Queue Tracking

---

# Team Members

| Name | Feature |
|------|----------|
| Member 1 | Authentication |
| Member 2 | Appointment Booking |
| Member 3 | Service Management |
| Member 4 | Queue Management |
| Member 5 | User Management |
| Member 6 | Dashboard & Reports |

---

# License

This project is developed for educational purposes as part of the Republic Polytechnic C237 Software Application Development Continuous Assessment 2 (CA2).
