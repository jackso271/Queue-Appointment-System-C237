# QueueEase - Queue Appointment System

Republic Polytechnic C237 Software Application Development CA2 project.

QueueEase is an Express and EJS web application for public appointment booking, queue status checking, feedback submission, staff queue work, staff management, user management, and operational reporting.

## Tech Stack

- HTML
- CSS
- Bootstrap
- JavaScript
- Node.js
- Express
- EJS
- MySQL with `mysql2`
- `express-session`
- `connect-flash`
- `dotenv`

## Project Structure

```text
Queue-Appointment-System-C237/
|-- app.js
|-- package.json
|-- package-lock.json
|-- .env.example
|-- .gitignore
|-- README.md
|-- database/
|   `-- DatabaseQueue.sql
|-- public/
|   `-- css/
`-- views/
    |-- partials/
    |-- auth/
    |-- appointments/
    |-- queue/
    |-- feedback/
    |-- reports/
    |-- admin/
    |-- staff/
    `-- users/
```

All Express routes, SQL queries, request handling, redirects, and `res.render` calls are kept directly in `app.js` to match the C237 lesson style.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in local MySQL values.

3. Create the database tables using:

```sql
database/DatabaseQueue.sql
```

4. Start the app:

```bash
npm start
```

For development:

```bash
npm run dev
```

## Main Routes

- `/login` - Staff/Admin only
- `/signup` - disabled; redirects to staff/admin login
- `/logout`
- `/staff`
- `/admin`
- `/appointments/book`
- `/booking-details`
- `/appointments/:id`
- `/queue/status`
- `/queue/admin`
- `/feedback/add/:appointmentID`
- `/appointments`
- `/reports/operational`
- `/service-management`
- `/admin/staff`
- `/admin/users`

## Notes

- `.env` is ignored and must not be committed.
- `node_modules/` is ignored and should be installed locally with `npm install`.
- Public customers do not create application accounts.
- Staff/Admin accounts are stored in `users`; staff accounts are created through Admin Staff CRUD.
- Passwords are handled plainly here to stay within the requested C237 concepts; do not use real production credentials with this project.
