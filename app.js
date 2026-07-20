require('dotenv').config();

const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const PORT = process.env.PORT || 3000;

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'queue_appointment_system'
});

connection.connect((error) => {
    if (error) {
        console.error('Database connection error. Please check your MySQL settings.');
        return;
    }

    console.log('Connected to MySQL database.');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'queueease-secret',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success = req.flash('success')[0] || null;
    res.locals.error = req.flash('error')[0] || null;
    next();
});

function isLoggedIn(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Please login to continue.');
        return res.redirect('/login');
    }

    next();
}

function checkRole(role) {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error', 'Please login to continue.');
            return res.redirect('/login');
        }

        if (req.session.user.role !== role) {
            return res.status(403).send('You do not have permission to access this page.');
        }

        next();
    };
}

function checkAnyRole(roles) {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error', 'Please login to continue.');
            return res.redirect('/login');
        }

        if (!roles.includes(req.session.user.role)) {
            return res.status(403).send('You do not have permission to access this page.');
        }

        next();
    };
}

function currentUserID(req) {
    return req.session.user ? req.session.user.id : null;
}

function redirectAfterLogin(req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.role === 'Admin') {
        return res.redirect('/admin');
    }

    if (req.session.user.role === 'Staff') {
        return res.redirect('/staff');
    }

    return res.redirect('/login');
}

app.get('/', (req, res) => {
    res.render('home', {
        user: req.session.user || null
    });
});

app.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        error: res.locals.error,
        success: res.locals.success
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.flash('error', 'Email and password are required.');
        return res.redirect('/login');
    }

    const sql = `
        SELECT id, username, email, password, role, accountStatus
        FROM users
        WHERE email = ?
        LIMIT 1
    `;

    connection.query(sql, [email], (error, results) => {
        if (error) {
            console.error('Login query error:', error.message);
            return res.status(500).send('Unable to login');
        }

        if (results.length === 0 || results[0].password !== password) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        if (!['Staff', 'Admin'].includes(results[0].role)) {
            req.flash('error', 'Only staff and admin accounts can login.');
            return res.redirect('/login');
        }

        if (results[0].accountStatus !== 'Active') {
            return res.status(403).send('Your account is not active.');
        }

        req.session.user = {
            id: results[0].id,
            username: results[0].username,
            email: results[0].email,
            role: results[0].role
        };

        return redirectAfterLogin(req, res);
    });
});

app.get('/signup', (req, res) => {
    req.flash('error', 'Public signup is not used. Please login with a staff or admin account.');
    res.redirect('/login');
});

app.post('/signup', (req, res) => {
    req.flash('error', 'Public signup is not used. Staff accounts are managed by administrators.');
    res.redirect('/login');
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/auth/login', (req, res) => res.redirect('/login'));
app.post('/auth/login', (req, res) => res.redirect(307, '/login'));
app.get('/auth/register', (req, res) => res.redirect('/signup'));
app.post('/auth/register', (req, res) => res.redirect(307, '/signup'));
app.post('/auth/logout', (req, res) => res.redirect(307, '/logout'));

app.get('/user', isLoggedIn, (req, res) => {
    return redirectAfterLogin(req, res);
});

app.get('/user/profile', isLoggedIn, (req, res) => {
    const sql = `
        SELECT id, username, email, address, contact, role, accountStatus
        FROM users
        WHERE id = ?
    `;

    connection.query(sql, [currentUserID(req)], (error, rows) => {
        if (error) {
            console.error('Profile query error:', error.message);
            return res.status(500).send('Unable to load profile');
        }

        res.render('users/profile', {
            title: 'My Profile',
            user: rows[0],
            error: res.locals.error,
            success: res.locals.success
        });
    });
});

app.get('/user/edit', isLoggedIn, (req, res) => {
    const sql = `
        SELECT id, username, email, address, contact, role, accountStatus
        FROM users
        WHERE id = ?
    `;

    connection.query(sql, [currentUserID(req)], (error, rows) => {
        if (error) {
            console.error('Edit profile query error:', error.message);
            return res.status(500).send('Unable to load profile');
        }

        res.render('users/edit', {
            title: 'Edit Profile',
            user: rows[0],
            error: res.locals.error
        });
    });
});

app.post('/user/edit', isLoggedIn, (req, res) => {
    const { username, address, contact } = req.body;
    const sql = `
        UPDATE users
        SET username = ?, address = ?, contact = ?
        WHERE id = ?
    `;

    connection.query(sql, [username, address, contact, currentUserID(req)], (error) => {
        if (error) {
            console.error('Update profile error:', error.message);
            req.flash('error', 'Unable to update profile.');
            return res.redirect('/user/edit');
        }

        req.session.user.username = username;
        req.flash('success', 'Profile updated successfully.');
        res.redirect('/user/profile');
    });
});

app.get('/user/change-password', isLoggedIn, (req, res) => {
    res.render('users/change-password', {
        title: 'Change Password',
        error: res.locals.error
    });
});

app.post('/user/change-password', isLoggedIn, (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/user/change-password');
    }

    if (newPassword !== confirmPassword) {
        req.flash('error', 'New passwords do not match.');
        return res.redirect('/user/change-password');
    }

    const selectSql = 'SELECT password FROM users WHERE id = ?';

    connection.query(selectSql, [currentUserID(req)], (selectError, rows) => {
        if (selectError) {
            console.error('Password check error:', selectError.message);
            return res.status(500).send('Unable to update password');
        }

        if (rows.length === 0 || rows[0].password !== currentPassword) {
            req.flash('error', 'Current password is incorrect.');
            return res.redirect('/user/change-password');
        }

        const updateSql = 'UPDATE users SET password = ? WHERE id = ?';

        connection.query(updateSql, [newPassword, currentUserID(req)], (error) => {
            if (error) {
                console.error('Password update error:', error.message);
                return res.status(500).send('Unable to update password');
            }

            req.flash('success', 'Password updated successfully.');
            res.redirect('/user/profile');
        });
    });
});

app.get('/admin', checkRole('Admin'), (req, res) => {
    const statisticsSql = `
        SELECT
            (SELECT COUNT(*) FROM users) AS totalUsers,
            (SELECT COUNT(*) FROM services WHERE status = 'Available') AS availableServices,
            (SELECT COUNT(*) FROM appointments) AS totalAppointments,
            (SELECT COUNT(*) FROM appointments WHERE status = 'Completed') AS completedAppointments,
            (SELECT COUNT(*) FROM \`queue\` WHERE queueStatus = 'Waiting') AS waitingCustomers,
            (SELECT COUNT(*) FROM feedback) AS totalFeedback,
            (SELECT COALESCE(AVG(rating), 0) FROM feedback) AS averageRating
    `;
    const statusSql = 'SELECT status, COUNT(*) AS total FROM appointments GROUP BY status ORDER BY status';
    const feedbackSql = `
        SELECT f.feedbackID, f.rating, f.comments, f.submittedDate,
               a.customerName, s.serviceName
        FROM feedback f
        INNER JOIN appointments a ON f.appointmentID = a.appointmentID
        INNER JOIN services s ON a.serviceID = s.serviceID
        ORDER BY f.submittedDate DESC
        LIMIT 5
    `;

    connection.query(statisticsSql, (statisticsError, statisticsRows) => {
        if (statisticsError) {
            console.error('Admin statistics error:', statisticsError.message);
            return res.status(500).send('Unable to load admin dashboard');
        }

        connection.query(statusSql, (statusError, appointmentStatuses) => {
            if (statusError) {
                console.error('Admin status error:', statusError.message);
                return res.status(500).send('Unable to load admin dashboard');
            }

            connection.query(feedbackSql, (feedbackError, recentFeedback) => {
                if (feedbackError) {
                    console.error('Admin feedback error:', feedbackError.message);
                    return res.status(500).send('Unable to load admin dashboard');
                }

                res.render('admin/admindashboard', {
                    statistics: statisticsRows[0],
                    appointmentStatuses,
                    recentFeedback,
                    user: req.session.user
                });
            });
        });
    });
});

app.get('/admin/users', checkRole('Admin'), (req, res) => {
    const sql = `
        SELECT id, username, email, address, contact, role, accountStatus
        FROM users
        ORDER BY username
    `;

    connection.query(sql, (error, users) => {
        if (error) {
            console.error('Users query error:', error.message);
            return res.status(500).send('Unable to load users');
        }

        res.render('admin/users', {
            users,
            user: req.session.user,
            error: res.locals.error,
            success: res.locals.success
        });
    });
});

app.post('/admin/users/:id/update', checkRole('Admin'), (req, res) => {
    const { role, accountStatus } = req.body;
    const sql = 'UPDATE users SET role = ?, accountStatus = ? WHERE id = ?';

    connection.query(sql, [role, accountStatus, req.params.id], (error) => {
        if (error) {
            console.error('User update error:', error.message);
            req.flash('error', 'Unable to update user.');
            return res.redirect('/admin/users');
        }

        req.flash('success', 'User updated successfully.');
        res.redirect('/admin/users');
    });
});

app.post('/admin/users/:id/delete', checkRole('Admin'), (req, res) => {
    if (Number(req.params.id) === Number(currentUserID(req))) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin/users');
    }

    const sql = 'DELETE FROM users WHERE id = ?';

    connection.query(sql, [req.params.id], (error) => {
        if (error) {
            console.error('User delete error:', error.message);
            req.flash('error', 'Unable to delete user. The user may have appointments or feedback.');
            return res.redirect('/admin/users');
        }

        req.flash('success', 'User deleted successfully.');
        res.redirect('/admin/users');
    });
});

app.get('/staff', checkRole('Staff'), (req, res) => {
    const appointmentsSql = `
        SELECT a.*, s.serviceName
        FROM appointments a
        INNER JOIN staff st ON a.staffID = st.staffID
        LEFT JOIN services s ON a.serviceID = s.serviceID
        WHERE st.email = ?
        ORDER BY a.appointmentDate DESC, a.appointmentTime DESC
        LIMIT 10
    `;
    const waitingSql = "SELECT COUNT(*) AS waitingCount FROM `queue` WHERE queueStatus = 'Waiting'";
    connection.query(appointmentsSql, [req.session.user.email], (appointmentError, appointments) => {
        if (appointmentError) {
            console.error('Staff dashboard error:', appointmentError.message);
            return res.status(500).send('Unable to load staff dashboard');
        }

        connection.query(waitingSql, (waitingError, waitingRows) => {
            if (waitingError) {
                console.error('Waiting queue count error:', waitingError.message);
                return res.status(500).send('Unable to load staff dashboard');
            }

            const completedByEmailSql = `
                SELECT COUNT(*) AS completedToday
                FROM appointments a
                INNER JOIN staff st ON a.staffID = st.staffID
                WHERE st.email = ?
                AND a.status = 'Completed'
                AND a.appointmentDate = CURDATE()
            `;

            connection.query(completedByEmailSql, [req.session.user.email], (completedError, completedRows) => {
                if (completedError) {
                    console.error('Completed count error:', completedError.message);
                    return res.status(500).send('Unable to load staff dashboard');
                }

                res.render('staff/staffdashboard', {
                    assignedCount: appointments.length,
                    waitingCount: waitingRows[0].waitingCount || 0,
                    completedToday: completedRows[0].completedToday || 0,
                    appointments,
                    user: req.session.user
                });
            });
        });
    });
});

app.get('/staff/personal-report', checkRole('Staff'), (req, res) => {
    const sql = `
        SELECT a.status, COUNT(*) AS total
        FROM appointments a
        INNER JOIN staff st ON a.staffID = st.staffID
        WHERE st.email = ?
        GROUP BY a.status
        ORDER BY a.status
    `;

    connection.query(sql, [req.session.user.email], (error, rows) => {
        if (error) {
            console.error('Personal report error:', error.message);
            return res.status(500).send('Unable to load personal report');
        }

        res.render('staff/personalReport', {
            rows,
            user: req.session.user
        });
    });
});

function renderStaffList(req, res) {
    const { search, position, availabilityStatus } = req.query;
    let sql = 'SELECT * FROM staff WHERE 1 = 1';
    const values = [];

    if (search) {
        sql += ' AND (fullName LIKE ? OR email LIKE ?)';
        values.push(`%${search}%`, `%${search}%`);
    }

    if (position) {
        sql += ' AND position LIKE ?';
        values.push(`%${position}%`);
    }

    if (availabilityStatus) {
        sql += ' AND availabilityStatus = ?';
        values.push(availabilityStatus);
    }

    sql += ' ORDER BY fullName';

    connection.query(sql, values, (error, staff) => {
        if (error) {
            console.error('Staff query error:', error.message);
            return res.status(500).send('Unable to load staff records');
        }

        res.render('staff/index', {
            title: 'Staff Management',
            staff,
            filters: {
                search: search || '',
                position: position || '',
                availabilityStatus: availabilityStatus || ''
            },
            user: req.session.user
        });
    });
}

app.get('/admin/staff', checkRole('Admin'), renderStaffList);

app.get('/admin/staff/create', checkRole('Admin'), (req, res) => {
    res.render('staff/create', {
        title: 'Add Staff',
        staff: {},
        error: null,
        user: req.session.user
    });
});

app.post('/admin/staff/create', checkRole('Admin'), (req, res) => {
    const { fullName, email, phone, position, availabilityStatus, password } = req.body;
    const checkSql = `
        SELECT email FROM staff WHERE email = ?
        UNION
        SELECT email FROM users WHERE email = ?
        LIMIT 1
    `;

    connection.query(checkSql, [email, email], (checkError, rows) => {
        if (checkError) {
            console.error('Staff email check error:', checkError.message);
            return res.status(500).send('Unable to create staff');
        }

        if (rows.length > 0) {
            return res.status(400).render('staff/create', {
                title: 'Add Staff',
                error: 'Email already exists.',
                staff: req.body,
                user: req.session.user
            });
        }

        if (!password) {
            return res.status(400).render('staff/create', {
                title: 'Add Staff',
                error: 'Login password is required.',
                staff: req.body,
                user: req.session.user
            });
        }

        const sql = `
            INSERT INTO staff (fullName, email, phone, position, availabilityStatus)
            VALUES (?, ?, ?, ?, ?)
        `;

        connection.query(sql, [fullName, email, phone || null, position, availabilityStatus], (error) => {
            if (error) {
                console.error('Create staff error:', error.message);
                return res.status(500).send('Unable to create staff');
            }

            const userSql = `
                INSERT INTO users
                    (username, email, password, address, contact, role, accountStatus)
                VALUES
                    (?, ?, ?, NULL, ?, 'Staff', 'Active')
            `;

            connection.query(userSql, [fullName, email, password, phone || null], (userError) => {
                if (userError) {
                    console.error('Create staff login error:', userError.message);
                    return res.status(500).send('Staff was created, but the login account could not be created');
                }

                res.redirect('/admin/staff');
            });
        });
    });
});

app.get('/admin/staff/:staffID', checkRole('Admin'), (req, res) => {
    const sql = 'SELECT * FROM staff WHERE staffID = ? LIMIT 1';

    connection.query(sql, [req.params.staffID], (error, rows) => {
        if (error) {
            console.error('Staff details error:', error.message);
            return res.status(500).send('Unable to load staff');
        }

        if (rows.length === 0) {
            return res.status(404).send('Staff not found.');
        }

        res.render('staff/details', {
            title: 'Staff Details',
            staff: rows[0],
            user: req.session.user
        });
    });
});

app.get('/admin/staff/:staffID/edit', checkRole('Admin'), (req, res) => {
    const sql = 'SELECT * FROM staff WHERE staffID = ? LIMIT 1';

    connection.query(sql, [req.params.staffID], (error, rows) => {
        if (error) {
            console.error('Staff edit query error:', error.message);
            return res.status(500).send('Unable to load staff');
        }

        if (rows.length === 0) {
            return res.status(404).send('Staff not found.');
        }

        res.render('staff/edit', {
            title: 'Edit Staff',
            staff: rows[0],
            error: null,
            user: req.session.user
        });
    });
});

app.post('/admin/staff/:staffID/edit', checkRole('Admin'), (req, res) => {
    const { fullName, email, phone, position, availabilityStatus } = req.body;
    const checkSql = 'SELECT staffID FROM staff WHERE email = ? AND staffID != ? LIMIT 1';

    connection.query(checkSql, [email, req.params.staffID], (checkError, rows) => {
        if (checkError) {
            console.error('Staff email check error:', checkError.message);
            return res.status(500).send('Unable to update staff');
        }

        if (rows.length > 0) {
            return res.status(400).render('staff/edit', {
                title: 'Edit Staff',
                error: 'Email already exists.',
                staff: {
                    staffID: req.params.staffID,
                    ...req.body
                },
                user: req.session.user
            });
        }

        const oldStaffSql = 'SELECT email FROM staff WHERE staffID = ? LIMIT 1';

        connection.query(oldStaffSql, [req.params.staffID], (oldError, oldRows) => {
            if (oldError) {
                console.error('Load staff email error:', oldError.message);
                return res.status(500).send('Unable to update staff');
            }

            const oldEmail = oldRows.length > 0 ? oldRows[0].email : email;
            const sql = `
                UPDATE staff
                SET fullName = ?, email = ?, phone = ?, position = ?, availabilityStatus = ?
                WHERE staffID = ?
            `;

            connection.query(sql, [fullName, email, phone || null, position, availabilityStatus, req.params.staffID], (error) => {
                if (error) {
                    console.error('Update staff error:', error.message);
                    return res.status(500).send('Unable to update staff');
                }

                const userSql = `
                    UPDATE users
                    SET username = ?, email = ?, contact = ?
                    WHERE role = 'Staff'
                    AND email = ?
                `;

                connection.query(userSql, [fullName, email, phone || null, oldEmail], () => {
                    res.redirect('/admin/staff');
                });
            });
        });
    });
});

app.post('/admin/staff/:staffID/delete', checkRole('Admin'), (req, res) => {
    const oldStaffSql = 'SELECT email FROM staff WHERE staffID = ? LIMIT 1';

    connection.query(oldStaffSql, [req.params.staffID], (oldError, oldRows) => {
        if (oldError) {
            console.error('Load staff email error:', oldError.message);
            return res.status(500).send('Unable to delete staff');
        }

        const staffEmail = oldRows.length > 0 ? oldRows[0].email : null;
        const sql = `
            DELETE FROM staff
            WHERE staffID = ?
            AND availabilityStatus = 'Unavailable'
        `;

        connection.query(sql, [req.params.staffID], (error, result) => {
            if (error) {
                console.error('Delete staff error:', error.message);
                return res.status(500).send('Unable to delete staff');
            }

            if (result.affectedRows === 0 || !staffEmail) {
                return res.redirect('/admin/staff');
            }

            const userSql = "DELETE FROM users WHERE role = 'Staff' AND email = ?";

            connection.query(userSql, [staffEmail], () => {
                res.redirect('/admin/staff');
            });
        });
    });
});

app.get('/appointments', checkAnyRole(['Staff', 'Admin']), (req, res) => {
    const sql = `
        SELECT
            a.appointmentID,
            a.userID,
            a.serviceID,
            a.staffID,
            a.customerName AS customer_name,
            a.customerEmail AS customer_email,
            a.customerPhone,
            s.serviceName,
            a.appointmentDate,
            a.appointmentTime,
            a.remarks,
            a.status
        FROM appointments a
        LEFT JOIN services s ON a.serviceID = s.serviceID
        ORDER BY a.appointmentDate, a.appointmentTime
    `;

    connection.query(sql, (error, appointments) => {
        if (error) {
            console.error('Appointments query error:', error.message);
            return res.status(500).send('Unable to retrieve appointments');
        }

        res.render('appointments/index', {
            appointments,
            user: req.session.user
        });
    });
});

app.get('/appointments/book', (req, res) => {
    const sql = 'SELECT serviceID, serviceName FROM services WHERE status = "Available" ORDER BY serviceName';

    connection.query(sql, (error, services) => {
        if (error) {
            console.error('Services query error:', error.message);
            return res.status(500).send('Unable to load booking form');
        }

        res.render('appointments/book', {
            services,
            formData: {},
            error: null,
            user: req.session.user || null
        });
    });
});

app.post('/appointments/book', (req, res) => {
    const {
        customerName,
        customerEmail,
        customerPhone,
        serviceID,
        appointmentDate,
        appointmentTime,
        remarks
    } = req.body;

    if (!customerName || !customerEmail || !serviceID || !appointmentDate || !appointmentTime) {
        const serviceSql = 'SELECT serviceID, serviceName FROM services WHERE status = "Available" ORDER BY serviceName';

        return connection.query(serviceSql, (serviceError, services) => {
            if (serviceError) {
                console.error('Services query error:', serviceError.message);
                return res.status(500).send('Unable to load booking form');
            }

            return res.status(400).render('appointments/book', {
                services,
                formData: req.body,
                error: 'Please fill in all required booking fields.',
                user: req.session.user || null
            });
        });
    }

    const sql = `
        INSERT INTO appointments
            (userID, customerName, customerEmail, customerPhone, serviceID, staffID, appointmentDate, appointmentTime, remarks, status)
        VALUES
            (NULL, ?, ?, ?, ?, NULL, ?, ?, ?, 'Pending')
    `;

    connection.query(sql, [customerName, customerEmail, customerPhone || null, serviceID, appointmentDate, appointmentTime, remarks || null], (error, result) => {
        if (error) {
            console.error('Create appointment error:', error.message);
            return res.status(500).send('Error saving appointment');
        }

        res.redirect(`/appointments/${result.insertId}`);
    });
});

app.get('/booking-details', (req, res) => {
    res.render('appointments/check', {
        error: res.locals.error,
        user: req.session.user || null
    });
});

app.post('/booking-details', (req, res) => {
    const { appointmentID } = req.body;

    if (!appointmentID) {
        req.flash('error', 'Please enter a booking ID.');
        return res.redirect('/booking-details');
    }

    res.redirect(`/appointments/${appointmentID}`);
});

app.get('/appointments/:id', (req, res) => {
    const sql = `
        SELECT a.*, s.serviceName, st.fullName AS staffName
        FROM appointments a
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN staff st ON a.staffID = st.staffID
        WHERE a.appointmentID = ?
        LIMIT 1
    `;

    connection.query(sql, [req.params.id], (error, rows) => {
        if (error) {
            console.error('Booking details query error:', error.message);
            return res.status(500).send('Unable to load booking details');
        }

        if (rows.length === 0) {
            return res.status(404).send('Booking not found.');
        }

        res.render('appointments/details', {
            appointment: rows[0],
            user: req.session.user || null
        });
    });
});

app.get('/appointments/edit/:id', checkAnyRole(['Staff', 'Admin']), (req, res) => {
    const appointmentSql = 'SELECT * FROM appointments WHERE appointmentID = ?';
    const servicesSql = 'SELECT serviceID, serviceName FROM services ORDER BY serviceName';

    connection.query(appointmentSql, [req.params.id], (appointmentError, rows) => {
        if (appointmentError) {
            console.error('Appointment edit query error:', appointmentError.message);
            return res.status(500).send('Unable to load appointment');
        }

        if (rows.length === 0) {
            return res.status(404).send('Appointment not found');
        }

        connection.query(servicesSql, (servicesError, services) => {
            if (servicesError) {
                console.error('Services query error:', servicesError.message);
                return res.status(500).send('Unable to load services');
            }

            res.render('appointments/edit', {
                appointment: rows[0],
                services,
                error: null,
                user: req.session.user
            });
        });
    });
});

app.post('/appointments/edit/:id', checkAnyRole(['Staff', 'Admin']), (req, res) => {
    const { serviceID, appointmentDate, appointmentTime, remarks, status } = req.body;
    const selectSql = 'SELECT userID, status FROM appointments WHERE appointmentID = ?';

    connection.query(selectSql, [req.params.id], (selectError, rows) => {
        if (selectError) {
            console.error('Appointment owner query error:', selectError.message);
            return res.status(500).send('Error updating appointment');
        }

        if (rows.length === 0) {
            return res.status(404).send('Appointment not found');
        }

        const nextStatus = status || rows[0].status;

        const sql = `
            UPDATE appointments
            SET serviceID = ?, appointmentDate = ?, appointmentTime = ?, remarks = ?, status = ?
            WHERE appointmentID = ?
        `;

        connection.query(sql, [serviceID, appointmentDate, appointmentTime, remarks || null, nextStatus, req.params.id], (error) => {
            if (error) {
                console.error('Update appointment error:', error.message);
                return res.status(500).send('Error updating appointment');
            }

            res.redirect('/appointments');
        });
    });
});

app.post('/appointments/delete/:id', checkAnyRole(['Staff', 'Admin']), (req, res) => {
    const selectSql = 'SELECT userID FROM appointments WHERE appointmentID = ?';

    connection.query(selectSql, [req.params.id], (selectError, rows) => {
        if (selectError) {
            console.error('Cancel appointment query error:', selectError.message);
            return res.status(500).send('Error cancelling appointment');
        }

        if (rows.length === 0) {
            return res.status(404).send('Appointment not found');
        }

        const sql = "UPDATE appointments SET status = 'Cancelled' WHERE appointmentID = ?";

        connection.query(sql, [req.params.id], (error) => {
            if (error) {
                console.error('Cancel appointment error:', error.message);
                return res.status(500).send('Error cancelling appointment');
            }

            res.redirect('/appointments');
        });
    });
});

app.post('/appointments/:id/approve', checkAnyRole(['Admin', 'Staff']), (req, res) => {
    const sql = "UPDATE appointments SET status = 'Approved' WHERE appointmentID = ?";

    connection.query(sql, [req.params.id], (error) => {
        if (error) {
            console.error('Approve appointment error:', error.message);
            return res.status(500).send('Error approving appointment');
        }

        res.redirect('/appointments');
    });
});

app.get('/book', (req, res) => res.redirect('/appointments/book'));
app.post('/book', (req, res) => res.redirect(307, '/appointments/book'));
app.get('/edit/:id', (req, res) => res.redirect(`/appointments/edit/${req.params.id}`));
app.post('/edit/:id', (req, res) => res.redirect(307, `/appointments/edit/${req.params.id}`));
app.post('/cancel/:id', (req, res) => res.redirect(307, `/appointments/delete/${req.params.id}`));

app.post('/queue/check-in/:appointmentID', (req, res) => {
    const appointmentSql = `
        SELECT *
        FROM appointments
        WHERE appointmentID = ?
        LIMIT 1
    `;

    connection.query(appointmentSql, [req.params.appointmentID], (appointmentError, appointmentRows) => {
        if (appointmentError) {
            console.error('Queue appointment query error:', appointmentError.message);
            return res.status(500).send('Unable to check in');
        }

        if (appointmentRows.length === 0) {
            return res.status(404).send('Appointment not found.');
        }

        const appointment = appointmentRows[0];

        if (appointment.status !== 'Approved') {
            return res.status(400).send('Only approved appointments can check in.');
        }

        const existingSql = 'SELECT * FROM `queue` WHERE appointmentID = ? LIMIT 1';

        connection.query(existingSql, [req.params.appointmentID], (existingError, existingRows) => {
            if (existingError) {
                console.error('Existing queue query error:', existingError.message);
                return res.status(500).send('Unable to check in');
            }

            if (existingRows.length > 0) {
                return res.redirect(`/queue/status/${req.params.appointmentID}`);
            }

            const nextSql = 'SELECT COALESCE(MAX(queueNumber), 0) + 1 AS nextQueueNumber FROM `queue`';

            connection.query(nextSql, (nextError, nextRows) => {
                if (nextError) {
                    console.error('Queue number query error:', nextError.message);
                    return res.status(500).send('Unable to check in');
                }

                const insertSql = `
                    INSERT INTO \`queue\`
                        (appointmentID, queueNumber, queueStatus, checkInTime)
                    VALUES
                        (?, ?, 'Waiting', NOW())
                `;

                connection.query(insertSql, [req.params.appointmentID, nextRows[0].nextQueueNumber], (insertError) => {
                    if (insertError) {
                        console.error('Queue insert error:', insertError.message);
                        return res.status(500).send('Unable to check in');
                    }

                    res.redirect(`/queue/status/${req.params.appointmentID}`);
                });
            });
        });
    });
});

app.get('/queue/status', (req, res) => {
    res.render('queue/check-status', {
        error: res.locals.error,
        user: req.session.user || null
    });
});

app.post('/queue/status', (req, res) => {
    const { appointmentID } = req.body;

    if (!appointmentID) {
        req.flash('error', 'Please enter a booking ID.');
        return res.redirect('/queue/status');
    }

    res.redirect(`/queue/status/${appointmentID}`);
});

app.get('/queue/status/:appointmentID', (req, res) => {
    const sql = `
        SELECT q.*, a.userID, a.appointmentDate, a.appointmentTime,
               a.status AS appointmentStatus, s.serviceName, st.fullName AS staffName
        FROM \`queue\` q
        INNER JOIN appointments a ON q.appointmentID = a.appointmentID
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN staff st ON a.staffID = st.staffID
        WHERE q.appointmentID = ?
        LIMIT 1
    `;

    connection.query(sql, [req.params.appointmentID], (error, rows) => {
        if (error) {
            console.error('Queue status error:', error.message);
            return res.status(500).send('Unable to load queue status');
        }

        if (rows.length === 0) {
            return res.status(404).render('queue/customer-status', {
                title: 'My Queue Status',
                queueEntry: null,
                customersAhead: null,
                success: null,
                error: 'No queue record was found for this appointment.',
                user: req.session.user || null
            });
        }

        const countSql = `
            SELECT COUNT(*) AS customersAhead
            FROM \`queue\`
            WHERE queueStatus = 'Waiting'
            AND queueNumber < ?
        `;

        connection.query(countSql, [rows[0].queueNumber], (countError, countRows) => {
            if (countError) {
                console.error('Queue count error:', countError.message);
                return res.status(500).send('Unable to load queue status');
            }

            res.render('queue/customer-status', {
                title: 'My Queue Status',
                queueEntry: rows[0],
                customersAhead: rows[0].queueStatus === 'Waiting' ? countRows[0].customersAhead : 0,
                success: res.locals.success,
                error: res.locals.error,
                user: req.session.user || null
            });
        });
    });
});

app.get('/queue/admin', checkAnyRole(['Admin', 'Staff']), (req, res) => {
    const sql = `
        SELECT q.*, a.userID, a.serviceID, a.staffID, a.appointmentDate,
               a.appointmentTime, a.status AS appointmentStatus,
               s.serviceName, st.fullName AS staffName
        FROM \`queue\` q
        INNER JOIN appointments a ON q.appointmentID = a.appointmentID
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN staff st ON a.staffID = st.staffID
        WHERE q.queueStatus IN ('Waiting', 'Serving')
        ORDER BY
            CASE q.queueStatus
                WHEN 'Serving' THEN 1
                WHEN 'Waiting' THEN 2
                ELSE 3
            END,
            q.queueNumber
    `;

    connection.query(sql, (error, queueEntries) => {
        if (error) {
            console.error('Admin queue error:', error.message);
            return res.status(500).send('Unable to load queue');
        }

        res.render('queue/admin-queue', {
            title: 'Queue Management',
            queueEntries,
            totalActive: queueEntries.length,
            waitingCount: queueEntries.filter((entry) => entry.queueStatus === 'Waiting').length,
            servingCount: queueEntries.filter((entry) => entry.queueStatus === 'Serving').length,
            success: res.locals.success,
            error: res.locals.error,
            authWarning: null,
            user: req.session.user
        });
    });
});

app.post('/queue/admin/:queueID/serving', checkAnyRole(['Admin', 'Staff']), (req, res) => {
    const sql = `
        UPDATE \`queue\`
        SET queueStatus = 'Serving', calledTime = NOW()
        WHERE queueID = ?
        AND queueStatus = 'Waiting'
    `;

    connection.query(sql, [req.params.queueID], (error) => {
        if (error) {
            console.error('Serving queue error:', error.message);
            return res.status(500).send('Unable to update queue');
        }

        res.redirect('/queue/admin');
    });
});

app.post('/queue/admin/:queueID/completed', checkAnyRole(['Admin', 'Staff']), (req, res) => {
    const sql = `
        UPDATE \`queue\`
        SET queueStatus = 'Completed', completedTime = NOW()
        WHERE queueID = ?
        AND queueStatus = 'Serving'
    `;

    connection.query(sql, [req.params.queueID], (error) => {
        if (error) {
            console.error('Complete queue error:', error.message);
            return res.status(500).send('Unable to update queue');
        }

        res.redirect('/queue/admin');
    });
});

app.post('/queue/admin/:queueID/cancel', checkAnyRole(['Admin', 'Staff']), (req, res) => {
    const sql = `
        UPDATE \`queue\`
        SET queueStatus = 'Cancelled',
            completedTime = CASE WHEN completedTime IS NULL THEN NOW() ELSE completedTime END
        WHERE queueID = ?
        AND queueStatus IN ('Waiting', 'Serving')
    `;

    connection.query(sql, [req.params.queueID], (error) => {
        if (error) {
            console.error('Cancel queue error:', error.message);
            return res.status(500).send('Unable to update queue');
        }

        res.redirect('/queue/admin');
    });
});

app.get('/feedback', checkRole('Admin'), (req, res) => {
    const sql = `
        SELECT f.feedbackID, f.appointmentID, f.userID, f.rating, f.comments,
               f.submittedDate, a.customerName, s.serviceName,
               a.appointmentDate, a.appointmentTime
        FROM feedback f
        INNER JOIN appointments a ON f.appointmentID = a.appointmentID
        INNER JOIN services s ON a.serviceID = s.serviceID
        ORDER BY f.submittedDate DESC
    `;

    connection.query(sql, (error, feedback) => {
        if (error) {
            console.error('Feedback query error:', error.message);
            return res.status(500).send('Unable to retrieve feedback');
        }

        res.render('feedback/feedbackList', {
            feedback,
            user: req.session.user
        });
    });
});

app.get('/feedback/add/:appointmentID', (req, res) => {
    const sql = `
        SELECT a.appointmentID, a.userID, a.status, a.appointmentDate,
               a.appointmentTime, s.serviceName, f.feedbackID
        FROM appointments a
        INNER JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN feedback f ON a.appointmentID = f.appointmentID
        WHERE a.appointmentID = ?
        LIMIT 1
    `;

    connection.query(sql, [req.params.appointmentID], (error, rows) => {
        if (error) {
            console.error('Feedback appointment query error:', error.message);
            return res.status(500).send('Unable to load feedback page');
        }

        if (rows.length === 0) {
            return res.status(404).send('Appointment not found.');
        }

        if (rows[0].status !== 'Completed') {
            return res.status(400).send('Appointment is not completed.');
        }

        if (rows[0].feedbackID) {
            return res.status(400).send('Feedback already submitted.');
        }

        res.render('feedback/addFeedback', {
            appointment: rows[0],
            error: null,
            user: req.session.user || null
        });
    });
});

app.post('/feedback/add/:appointmentID', (req, res) => {
    const { rating, comments } = req.body;
    const sql = `
        INSERT INTO feedback (appointmentID, userID, rating, comments, submittedDate)
        VALUES (?, NULL, ?, ?, NOW())
    `;

    connection.query(sql, [req.params.appointmentID, rating, comments || null], (error) => {
        if (error) {
            console.error('Create feedback error:', error.message);
            return res.status(500).send('Unable to submit feedback');
        }

        res.redirect(`/appointments/${req.params.appointmentID}`);
    });
});

app.get('/feedback/edit/:feedbackID', checkRole('Admin'), (req, res) => {
    const sql = `
        SELECT f.*, a.customerName, s.serviceName,
               a.appointmentDate, a.appointmentTime
        FROM feedback f
        INNER JOIN appointments a ON f.appointmentID = a.appointmentID
        INNER JOIN services s ON a.serviceID = s.serviceID
        WHERE f.feedbackID = ?
        LIMIT 1
    `;

    connection.query(sql, [req.params.feedbackID], (error, rows) => {
        if (error) {
            console.error('Feedback edit query error:', error.message);
            return res.status(500).send('Unable to load feedback');
        }

        if (rows.length === 0) {
            return res.status(404).send('Feedback not found.');
        }

        res.render('feedback/editFeedback', {
            feedback: rows[0],
            error: null,
            user: req.session.user
        });
    });
});

app.post('/feedback/edit/:feedbackID', checkRole('Admin'), (req, res) => {
    const { rating, comments } = req.body;
    const sql = `
        UPDATE feedback
        SET rating = ?, comments = ?
        WHERE feedbackID = ?
    `;
    const values = [rating, comments || null, req.params.feedbackID];

    connection.query(sql, values, (error) => {
        if (error) {
            console.error('Update feedback error:', error.message);
            return res.status(500).send('Unable to update feedback');
        }

        res.redirect('/feedback');
    });
});

app.post('/feedback/delete/:feedbackID', checkRole('Admin'), (req, res) => {
    const sql = `
        DELETE FROM feedback
        WHERE feedbackID = ?
    `;
    const values = [req.params.feedbackID];

    connection.query(sql, values, (error) => {
        if (error) {
            console.error('Delete feedback error:', error.message);
            return res.status(500).send('Unable to delete feedback');
        }

        res.redirect('/feedback');
    });
});

app.get('/feedback/:feedbackID', checkRole('Admin'), (req, res) => {
    const sql = `
        SELECT f.*, a.customerName, s.serviceName,
               a.appointmentDate, a.appointmentTime
        FROM feedback f
        INNER JOIN appointments a ON f.appointmentID = a.appointmentID
        INNER JOIN services s ON a.serviceID = s.serviceID
        WHERE f.feedbackID = ?
        LIMIT 1
    `;

    connection.query(sql, [req.params.feedbackID], (error, rows) => {
        if (error) {
            console.error('Feedback details query error:', error.message);
            return res.status(500).send('Unable to load feedback');
        }

        if (rows.length === 0) {
            return res.status(404).send('Feedback not found.');
        }

        res.render('feedback/feedbackDetails', {
            feedback: rows[0],
            user: req.session.user
        });
    });
});

app.get('/feedback/:feedbackID/edit', (req, res) => {
    res.redirect(`/feedback/edit/${req.params.feedbackID}`);
});

app.post('/feedback/:feedbackID/delete', (req, res) => {
    res.redirect(307, `/feedback/delete/${req.params.feedbackID}`);
});

app.get('/service-management', checkRole('Admin'), (req, res) => {
    const sql = `
        SELECT serviceID, serviceName, description, duration, price, status, createdAt
        FROM services
        ORDER BY serviceName ASC
    `;

    connection.query(sql, (error, services) => {
        if (error) {
            console.error('Services query error:', error.message);
            return res.status(500).send('Unable to retrieve services');
        }

        res.render('serviceList', {
            services,
            successMessage: req.query.success || null,
            user: req.session.user
        });
    });
});

app.get('/service-management/add', checkRole('Admin'), (req, res) => {
    res.render('addService', {
        errorMessage: null,
        formData: {
            serviceName: '',
            description: '',
            duration: '',
            price: '',
            status: 'Available'
        },
        user: req.session.user
    });
});

app.post('/service-management/add', checkRole('Admin'), (req, res) => {
    const { serviceName, description, duration, price, status } = req.body;
    const sql = `
        INSERT INTO services (serviceName, description, duration, price, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(sql, [serviceName, description || null, duration, price, status], (error) => {
        if (error) {
            console.error('Create service error:', error.message);
            return res.status(500).render('addService', {
                errorMessage: 'Unable to create the service.',
                formData: req.body,
                user: req.session.user
            });
        }

        res.redirect('/service-management?success=Service added successfully.');
    });
});

app.get('/service-management/:serviceID/edit', checkRole('Admin'), (req, res) => {
    const sql = 'SELECT * FROM services WHERE serviceID = ?';

    connection.query(sql, [req.params.serviceID], (error, rows) => {
        if (error) {
            console.error('Service edit query error:', error.message);
            return res.status(500).send('Unable to retrieve the service');
        }

        if (rows.length === 0) {
            return res.status(404).send('Service not found.');
        }

        res.render('editService', {
            service: rows[0],
            errorMessage: null,
            user: req.session.user
        });
    });
});

app.post('/service-management/:serviceID/edit', checkRole('Admin'), (req, res) => {
    const { serviceName, description, duration, price, status } = req.body;
    const sql = `
        UPDATE services
        SET serviceName = ?, description = ?, duration = ?, price = ?, status = ?
        WHERE serviceID = ?
    `;

    connection.query(sql, [serviceName, description || null, duration, price, status, req.params.serviceID], (error) => {
        if (error) {
            console.error('Update service error:', error.message);
            return res.status(500).send('Unable to update the service');
        }

        res.redirect(`/service-management/${req.params.serviceID}`);
    });
});

app.post('/service-management/:serviceID/delete', checkRole('Admin'), (req, res) => {
    const sql = 'DELETE FROM services WHERE serviceID = ?';

    connection.query(sql, [req.params.serviceID], (error) => {
        if (error) {
            console.error('Delete service error:', error.message);
            return res.status(500).send('Unable to delete the service');
        }

        res.redirect('/service-management?success=Service deleted successfully.');
    });
});

app.get('/service-management/:serviceID', checkRole('Admin'), (req, res) => {
    const sql = 'SELECT * FROM services WHERE serviceID = ?';

    connection.query(sql, [req.params.serviceID], (error, rows) => {
        if (error) {
            console.error('Service details query error:', error.message);
            return res.status(500).send('Unable to retrieve the service');
        }

        if (rows.length === 0) {
            return res.status(404).send('Service not found.');
        }

        res.render('serviceDetails', {
            service: rows[0],
            user: req.session.user
        });
    });
});

app.get('/reports/operational', checkRole('Admin'), (req, res) => {
    const statusSql = 'SELECT status, COUNT(*) AS total FROM appointments GROUP BY status ORDER BY status';
    const serviceSql = `
        SELECT s.serviceID, s.serviceName, COUNT(a.appointmentID) AS totalAppointments
        FROM services s
        LEFT JOIN appointments a ON s.serviceID = a.serviceID
        GROUP BY s.serviceID, s.serviceName
        ORDER BY totalAppointments DESC
    `;
    const feedbackSql = `
        SELECT COUNT(*) AS totalFeedback,
               COALESCE(AVG(rating), 0) AS averageRating,
               MIN(rating) AS lowestRating,
               MAX(rating) AS highestRating
        FROM feedback
    `;
    const monthlySql = `
        SELECT DATE_FORMAT(appointmentDate, '%Y-%m') AS reportMonth,
               COUNT(*) AS totalAppointments
        FROM appointments
        GROUP BY DATE_FORMAT(appointmentDate, '%Y-%m')
        ORDER BY reportMonth DESC
    `;

    connection.query(statusSql, (statusError, appointmentsByStatus) => {
        if (statusError) {
            console.error('Report status error:', statusError.message);
            return res.status(500).send('Unable to generate report');
        }

        connection.query(serviceSql, (serviceError, appointmentsByService) => {
            if (serviceError) {
                console.error('Report service error:', serviceError.message);
                return res.status(500).send('Unable to generate report');
            }

            connection.query(feedbackSql, (feedbackError, feedbackRows) => {
                if (feedbackError) {
                    console.error('Report feedback error:', feedbackError.message);
                    return res.status(500).send('Unable to generate report');
                }

                connection.query(monthlySql, (monthlyError, monthlyAppointments) => {
                    if (monthlyError) {
                        console.error('Report monthly error:', monthlyError.message);
                        return res.status(500).send('Unable to generate report');
                    }

                    res.render('reports/operationalReport', {
                        title: 'Operational Report',
                        appointmentsByStatus,
                        appointmentsByService,
                        feedbackSummary: feedbackRows[0],
                        monthlyAppointments,
                        user: req.session.user
                    });
                });
            });
        });
    });
});

app.get('/reports', (req, res) => res.redirect('/reports/operational'));

app.use((req, res) => {
    res.status(404).send('Page not found.');
});

app.listen(PORT, () => {
    console.log(`QueueEase is running at http://localhost:${PORT}`);
});
