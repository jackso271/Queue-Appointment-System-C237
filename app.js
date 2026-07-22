require('dotenv').config();

const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = mysql.createConnection({
    host: 'c237-eaint-mysql.mysql.database.azure.com',
    user: 'c237_001',
    password: 'c237001@2026!',
    database: 'c237_001_teamaplus',
    //It tells your app to talk to the Azure database using SSL, which is required by Azure for secure connections.
    //Which Azure requires to use SSL for secure connections to the database. The rejectUnauthorized: true option ensures that the SSL certificate is verified.
    ssl: {
        rejectUnauthorized: true
    }
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
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
    res.locals.currentUser = req.session.user || null;
    res.locals.currentPath = req.path;
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

function normalizeRole(role) {
    if (!role) {
        return '';
    }

    const value = String(role).toLowerCase();

    if (value === 'admin') {
        return 'Admin';
    }

    if (value === 'staff') {
        return 'Staff';
    }

    if (value === 'customer' || value === 'user') {
        return 'Customer';
    }

    return String(role);
}

function checkRole(role) {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error', 'Please login to continue.');
            return res.redirect('/login');
        }

        if (normalizeRole(req.session.user.role) !== normalizeRole(role)) {
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

        if (!roles.map(normalizeRole).includes(normalizeRole(req.session.user.role))) {
            return res.status(403).send('You do not have permission to access this page.');
        }

        next();
    };
}

const requireLogin = isLoggedIn;
const requireStaff = checkRole('Staff');
const requireAdmin = checkRole('Admin');
const requireStaffOrAdmin = checkAnyRole(['Staff', 'Admin']);

function currentUserID(req) {
    return req.session.user ? (req.session.user.userID || req.session.user.id) : null;
}

function redirectAfterLogin(req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (normalizeRole(req.session.user.role) === 'Admin') {
        return res.redirect('/admin/dashboard');
    }

    if (normalizeRole(req.session.user.role) === 'Staff') {
        return res.redirect('/staff/dashboard');
    }

    return res.redirect('/login');
}

function isBcryptHash(value) {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

function logDatabaseError(area, error) {
    console.error(`${area} database error`);
    console.error('Code:', error.code);
    console.error('Errno:', error.errno);
    console.error('SQL State:', error.sqlState);
    console.error('Message:', error.sqlMessage || error.message);
}

const ADMIN_USER_ROLE_OPTIONS = ['Staff', 'Admin'];
const ADMIN_USER_STATUS_OPTIONS = ['Active', 'Inactive', 'Blocked'];
const PASSWORD_RULE_MESSAGE = 'Password must be at least 8 characters and include uppercase, lowercase, number and special character.';

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidContact(value) {
    return /^[0-9+\-\s()]{8,20}$/.test(value);
}

function isStrongPassword(value) {
    return typeof value === 'string'
        && value.length >= 8
        && /[A-Z]/.test(value)
        && /[a-z]/.test(value)
        && /\d/.test(value)
        && /[^A-Za-z0-9]/.test(value);
}

function renderCreateUserForm(req, res, statusCode, error, formData = {}) {
    return res.status(statusCode).render('admin/create-user', {
        user: req.session.user,
        error,
        success: res.locals.success,
        formData,
        roleOptions: ADMIN_USER_ROLE_OPTIONS,
        statusOptions: ADMIN_USER_STATUS_OPTIONS
    });
}

function formatQueueNumber(value) {
    return `Q${String(value || 0).padStart(3, '0')}`;
}

function formatDisplayDate(value) {
    if (!value) {
        return 'Not set';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString('en-SG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatDisplayTime(value) {
    if (!value) {
        return 'Not set';
    }

    const rawValue = String(value);
    const timeMatch = rawValue.match(/^(\d{1,2}):(\d{2})/);

    if (!timeMatch) {
        return rawValue;
    }

    const hours = Number(timeMatch[1]);
    const minutes = timeMatch[2];
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes} ${suffix}`;
}

function formatDateInput(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
}

function loadActiveAnnouncements(callback) {
    const sql = `
        SELECT announcementID, title, description, startDate, endDate
        FROM announcements
        WHERE status = 'Active'
        AND startDate <= CURDATE()
        AND endDate >= CURDATE()
        ORDER BY startDate DESC, createdAt DESC
    `;

    db.query(sql, (error, announcements) => {
        if (error) {
            logDatabaseError('Public announcements', error);
            return callback([]);
        }

        callback(announcements || []);
    });
}

function rememberPublicAppointment(req, appointmentID) {
    req.session.publicAppointments = req.session.publicAppointments || [];

    if (!req.session.publicAppointments.includes(Number(appointmentID))) {
        req.session.publicAppointments.push(Number(appointmentID));
    }
}

function canViewPublicAppointment(req, row) {
    if (req.session.user && ['Staff', 'Admin'].includes(normalizeRole(req.session.user.role))) {
        return true;
    }

    const knownAppointments = req.session.publicAppointments || [];
    if (knownAppointments.includes(Number(row.appointmentID))) {
        return true;
    }

    const submittedEmail = (req.query.email || (req.body && req.body.customerEmail) || '').trim().toLowerCase();
    return submittedEmail && submittedEmail === String(row.customerEmail || '').toLowerCase();
}

app.get('/', (req, res) => {
    loadActiveAnnouncements((announcements) => {
        res.render('home', {
            announcements,
            user: req.session.user || null
        });
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
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

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

    db.query(sql, [email], (error, results) => {
        if (error) {
            logDatabaseError('Login query', error);
            return res.status(500).send('Unable to login');
        }

        if (results.length === 0) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        const user = results[0];
        const role = normalizeRole(user.role);

        if (!['Staff', 'Admin'].includes(role)) {
            req.flash('error', 'Only staff and admin accounts can login.');
            return res.redirect('/login');
        }

        if (user.accountStatus !== 'Active') {
            return res.status(403).send('Your account is not active.');
        }

        if (!isBcryptHash(user.password)) {
            console.error('Login password format error: stored password is not a bcrypt hash for user ID:', user.id);
            req.flash('error', 'This account requires a password reset before login.');
            return res.redirect('/login');
        }

        bcrypt.compare(password, user.password, (compareError, passwordMatches) => {
            if (compareError) {
                console.error('Password comparison error:', compareError.message);
                return res.status(500).send('Unable to login');
            }

            if (!passwordMatches) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
            }

            req.session.user = {
                userID: user.id,
                id: user.id,
                name: user.username,
                username: user.username,
                email: user.email,
                role
            };

            return req.session.save((saveError) => {
                if (saveError) {
                    console.error('Session save error:', saveError.message);
                    return res.status(500).send('Unable to login');
                }

                return redirectAfterLogin(req, res);
            });
        });
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
        res.redirect('/login');
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

    db.query(sql, [currentUserID(req)], (error, rows) => {
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

    db.query(sql, [currentUserID(req)], (error, rows) => {
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

    db.query(sql, [username, address, contact, currentUserID(req)], (error) => {
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

    db.query(selectSql, [currentUserID(req)], (selectError, rows) => {
        if (selectError) {
            console.error('Password check error:', selectError.message);
            return res.status(500).send('Unable to update password');
        }

        if (rows.length === 0 || !isBcryptHash(rows[0].password)) {
            req.flash('error', 'Unable to verify the current password.');
            return res.redirect('/user/change-password');
        }

        bcrypt.compare(currentPassword, rows[0].password, (compareError, passwordMatches) => {
            if (compareError) {
                console.error('Password comparison error:', compareError.message);
                return res.status(500).send('Unable to update password');
            }

            if (!passwordMatches) {
                req.flash('error', 'Current password is incorrect.');
                return res.redirect('/user/change-password');
            }

            bcrypt.hash(newPassword, 10, (hashError, hashedPassword) => {
                if (hashError) {
                    console.error('Password hash error:', hashError.message);
                    return res.status(500).send('Unable to update password');
                }

                const updateSql = 'UPDATE users SET password = ? WHERE id = ?';

                db.query(updateSql, [hashedPassword, currentUserID(req)], (error) => {
                    if (error) {
                        console.error('Password update error:', error.message);
                        return res.status(500).send('Unable to update password');
                    }

                    req.flash('success', 'Password updated successfully.');
                    return res.redirect('/user/profile');
                });
            });
        });
    });
});

function renderAdminDashboard(req, res) {
    const statisticsSql = `
        SELECT
            (SELECT COUNT(*) FROM users) AS totalUsers,
            (SELECT COUNT(*) FROM staff) AS totalStaff,
            (SELECT COUNT(*) FROM staff WHERE availabilityStatus = 'Available') AS activeStaff,
            (SELECT COUNT(*) FROM services WHERE status = 'Available') AS availableServices,
            (SELECT COUNT(*) FROM appointments) AS totalAppointments,
            (SELECT COUNT(*) FROM appointments WHERE appointmentDate = CURDATE()) AS todayAppointments,
            (SELECT COUNT(*) FROM appointments WHERE status = 'Completed') AS completedAppointments,
            (SELECT COUNT(*) FROM \`queue\` WHERE queueStatus = 'Waiting') AS waitingCustomers,
            (SELECT COUNT(*) FROM feedback) AS totalFeedback,
            (SELECT COALESCE(AVG(rating), 0) FROM feedback) AS averageRating
    `;
    const statusSql = 'SELECT status, COUNT(*) AS total FROM appointments GROUP BY status ORDER BY status';
    const feedbackSql = `
        SELECT f.feedbackID, f.rating, f.comments, f.submittedDate,
               u.username AS customerName, s.serviceName
        FROM feedback f
        INNER JOIN appointments a ON f.appointmentID = a.appointmentID
        INNER JOIN users u ON a.userID = u.id
        INNER JOIN services s ON a.serviceID = s.serviceID
        ORDER BY f.submittedDate DESC
        LIMIT 5
    `;

    db.query(statisticsSql, (statisticsError, statisticsRows) => {
        if (statisticsError) {
            console.error('Admin statistics error:', statisticsError.message);
            return res.status(500).send('Unable to load admin dashboard');
        }

        db.query(statusSql, (statusError, appointmentStatuses) => {
            if (statusError) {
                console.error('Admin status error:', statusError.message);
                return res.status(500).send('Unable to load admin dashboard');
            }

            db.query(feedbackSql, (feedbackError, recentFeedback) => {
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
}

app.get('/admin', requireAdmin, (req, res) => res.redirect('/admin/dashboard'));
app.get('/admin/dashboard', requireAdmin, renderAdminDashboard);

const ANNOUNCEMENT_STATUS_OPTIONS = ['Active', 'Inactive'];
const ANNOUNCEMENT_TITLE_MAX_LENGTH = 150;

function normalizeAnnouncementForm(body) {
    return {
        title: String(body.title || '').trim(),
        description: String(body.description || '').trim(),
        startDate: String(body.startDate || '').trim(),
        endDate: String(body.endDate || '').trim(),
        status: String(body.status || 'Active').trim()
    };
}

function validateAnnouncement(formData) {
    if (!formData.title) {
        return 'Title is required.';
    }

    if (formData.title.length > ANNOUNCEMENT_TITLE_MAX_LENGTH) {
        return `Title must be ${ANNOUNCEMENT_TITLE_MAX_LENGTH} characters or fewer.`;
    }

    if (!formData.description) {
        return 'Description is required.';
    }

    if (!formData.startDate) {
        return 'Start date is required.';
    }

    if (!formData.endDate) {
        return 'End date is required.';
    }

    if (!ANNOUNCEMENT_STATUS_OPTIONS.includes(formData.status)) {
        return 'Announcement status is invalid.';
    }

    const startDate = new Date(`${formData.startDate}T00:00:00`);
    const endDate = new Date(`${formData.endDate}T00:00:00`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return 'Please enter valid announcement dates.';
    }

    if (endDate < startDate) {
        return 'End date cannot be earlier than start date.';
    }

    return null;
}

function renderAnnouncementForm(req, res, statusCode, mode, formData, error = null) {
    return res.status(statusCode).render('admin/announcement-form', {
        mode,
        formData,
        statusOptions: ANNOUNCEMENT_STATUS_OPTIONS,
        error,
        success: res.locals.success,
        user: req.session.user
    });
}

app.get('/admin/announcements', requireAdmin, (req, res) => {
    const sql = `
        SELECT announcementID, title, description, startDate, endDate,
               status, createdAt, updatedAt
        FROM announcements
        ORDER BY createdAt DESC, announcementID DESC
    `;

    db.query(sql, (error, announcements) => {
        if (error) {
            console.error('========== ADMIN ANNOUNCEMENTS ERROR ==========');
            console.error('Code:', error.code);
            console.error('Errno:', error.errno);
            console.error('SQL State:', error.sqlState);
            console.error('SQL Message:', error.sqlMessage || error.message);
            console.error('Stack:', error.stack);
            console.error('===============================================');
            return res.status(500).send('Unable to load announcements');
        }

        res.render('admin/announcements', {
            announcements,
            success: res.locals.success,
            error: res.locals.error,
            user: req.session.user
        });
    });
});

app.get('/admin/announcements/create', requireAdmin, (req, res) => {
    renderAnnouncementForm(req, res, 200, 'create', {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Active'
    });
});

app.post('/admin/announcements/create', requireAdmin, (req, res) => {
    const formData = normalizeAnnouncementForm(req.body);
    const validationError = validateAnnouncement(formData);

    if (validationError) {
        return renderAnnouncementForm(req, res, 400, 'create', formData, validationError);
    }

    const sql = `
        INSERT INTO announcements
            (title, description, startDate, endDate, status)
        VALUES
            (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [formData.title, formData.description, formData.startDate, formData.endDate, formData.status],
        (error) => {
            if (error) {
                logDatabaseError('Announcement create', error);
                return renderAnnouncementForm(req, res, 500, 'create', formData, 'Unable to save announcement.');
            }

            req.flash('success', 'Announcement created successfully.');
            return res.redirect('/admin/announcements');
        }
    );
});

app.get('/admin/announcements/:announcementID/edit', requireAdmin, (req, res) => {
    const sql = `
        SELECT announcementID, title, description, startDate, endDate, status
        FROM announcements
        WHERE announcementID = ?
        LIMIT 1
    `;

    db.query(sql, [req.params.announcementID], (error, rows) => {
        if (error) {
            logDatabaseError('Announcement edit lookup', error);
            return res.status(500).send('Unable to load announcement');
        }

        if (rows.length === 0) {
            req.flash('error', 'Announcement not found.');
            return res.redirect('/admin/announcements');
        }

        const announcement = rows[0];
        return renderAnnouncementForm(req, res, 200, 'edit', {
            announcementID: announcement.announcementID,
            title: announcement.title,
            description: announcement.description,
            startDate: formatDateInput(announcement.startDate),
            endDate: formatDateInput(announcement.endDate),
            status: announcement.status
        });
    });
});

app.post('/admin/announcements/:announcementID/edit', requireAdmin, (req, res) => {
    const formData = {
        announcementID: req.params.announcementID,
        ...normalizeAnnouncementForm(req.body)
    };
    const validationError = validateAnnouncement(formData);

    if (validationError) {
        return renderAnnouncementForm(req, res, 400, 'edit', formData, validationError);
    }

    const existsSql = 'SELECT announcementID FROM announcements WHERE announcementID = ? LIMIT 1';

    db.query(existsSql, [req.params.announcementID], (existsError, rows) => {
        if (existsError) {
            logDatabaseError('Announcement update lookup', existsError);
            return res.status(500).send('Unable to save announcement');
        }

        if (rows.length === 0) {
            req.flash('error', 'Announcement not found.');
            return res.redirect('/admin/announcements');
        }

        const updateSql = `
            UPDATE announcements
            SET title = ?, description = ?, startDate = ?, endDate = ?, status = ?
            WHERE announcementID = ?
        `;

        db.query(
            updateSql,
            [
                formData.title,
                formData.description,
                formData.startDate,
                formData.endDate,
                formData.status,
                req.params.announcementID
            ],
            (updateError) => {
                if (updateError) {
                    logDatabaseError('Announcement update', updateError);
                    return renderAnnouncementForm(req, res, 500, 'edit', formData, 'Unable to save announcement.');
                }

                req.flash('success', 'Announcement updated successfully.');
                return res.redirect('/admin/announcements');
            }
        );
    });
});

app.post('/admin/announcements/:announcementID/status', requireAdmin, (req, res) => {
    const status = String(req.body.status || '').trim();

    if (!ANNOUNCEMENT_STATUS_OPTIONS.includes(status)) {
        req.flash('error', 'Announcement status is invalid.');
        return res.redirect('/admin/announcements');
    }

    const sql = 'UPDATE announcements SET status = ? WHERE announcementID = ?';

    db.query(sql, [status, req.params.announcementID], (error, result) => {
        if (error) {
            logDatabaseError('Announcement status update', error);
            req.flash('error', 'Unable to save announcement.');
            return res.redirect('/admin/announcements');
        }

        if (result.affectedRows === 0) {
            req.flash('error', 'Announcement not found.');
            return res.redirect('/admin/announcements');
        }

        req.flash('success', 'Announcement updated successfully.');
        return res.redirect('/admin/announcements');
    });
});

app.post('/admin/announcements/:announcementID/delete', requireAdmin, (req, res) => {
    const existsSql = 'SELECT announcementID FROM announcements WHERE announcementID = ? LIMIT 1';

    db.query(existsSql, [req.params.announcementID], (existsError, rows) => {
        if (existsError) {
            logDatabaseError('Announcement delete lookup', existsError);
            req.flash('error', 'Unable to delete announcement.');
            return res.redirect('/admin/announcements');
        }

        if (rows.length === 0) {
            req.flash('error', 'Announcement not found.');
            return res.redirect('/admin/announcements');
        }

        const deleteSql = 'DELETE FROM announcements WHERE announcementID = ?';

        db.query(deleteSql, [req.params.announcementID], (deleteError) => {
            if (deleteError) {
                logDatabaseError('Announcement delete', deleteError);
                req.flash('error', 'Unable to delete announcement.');
                return res.redirect('/admin/announcements');
            }

            req.flash('success', 'Announcement deleted successfully.');
            return res.redirect('/admin/announcements');
        });
    });
});

app.get('/admin/users', checkRole('Admin'), (req, res) => {
    const sql = `
        SELECT id, username, email, address, contact, role, accountStatus
        FROM users
        ORDER BY username
    `;

    db.query(sql, (error, users) => {
        if (error) {
            console.error('Users query error:', error.message);
            return res.status(500).send('Unable to load users');
        }

        res.render('admin/users', {
            users: users.map(item => ({
                ...item,
                displayRole: normalizeRole(item.role)
            })),
            user: req.session.user,
            error: res.locals.error,
            success: res.locals.success,
            roleOptions: ADMIN_USER_ROLE_OPTIONS,
            statusOptions: ADMIN_USER_STATUS_OPTIONS
        });
    });
});

app.get('/admin/users/create', checkRole('Admin'), (req, res) => {
    renderCreateUserForm(req, res, 200, res.locals.error, {
        username: '',
        email: '',
        contact: '',
        address: '',
        role: 'Staff',
        accountStatus: 'Active'
    });
});

app.post('/admin/users/create', checkRole('Admin'), (req, res) => {
    const formData = {
        username: (req.body.username || '').trim(),
        email: (req.body.email || '').trim().toLowerCase(),
        contact: (req.body.contact || '').trim(),
        address: (req.body.address || '').trim(),
        role: (req.body.role || '').trim(),
        accountStatus: (req.body.accountStatus || '').trim()
    };
    const password = req.body.password || '';
    const confirmPassword = req.body.confirmPassword || '';

    if (!formData.username) {
        return renderCreateUserForm(req, res, 400, 'Username is required.', formData);
    }

    if (!formData.email || !isValidEmail(formData.email)) {
        return renderCreateUserForm(req, res, 400, 'Email address is invalid.', formData);
    }

    if (!formData.contact || !isValidContact(formData.contact)) {
        return renderCreateUserForm(req, res, 400, 'Contact number is invalid.', formData);
    }

    if (!formData.address) {
        return renderCreateUserForm(req, res, 400, 'Address is required.', formData);
    }

    if (!ADMIN_USER_ROLE_OPTIONS.includes(formData.role)) {
        return renderCreateUserForm(req, res, 400, 'Role is invalid.', formData);
    }

    if (!ADMIN_USER_STATUS_OPTIONS.includes(formData.accountStatus)) {
        return renderCreateUserForm(req, res, 400, 'Account status is invalid.', formData);
    }

    if (!password) {
        return renderCreateUserForm(req, res, 400, 'Password is required.', formData);
    }

    if (password !== confirmPassword) {
        return renderCreateUserForm(req, res, 400, 'Passwords do not match.', formData);
    }

    if (!isStrongPassword(password)) {
        return renderCreateUserForm(req, res, 400, PASSWORD_RULE_MESSAGE, formData);
    }

    const duplicateSql = 'SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1';

    db.query(duplicateSql, [formData.email], (duplicateError, rows) => {
        if (duplicateError) {
            logDatabaseError('Admin create user duplicate check', duplicateError);
            return renderCreateUserForm(req, res, 500, 'Unable to create user account.', formData);
        }

        if (rows.length > 0) {
            return renderCreateUserForm(req, res, 400, 'Email address already exists.', formData);
        }

        bcrypt.hash(password, 10, (hashError, hashedPassword) => {
            if (hashError) {
                console.error('Admin create user password hash error:', hashError.message);
                return renderCreateUserForm(req, res, 500, 'Unable to create user account.', formData);
            }

            const insertSql = `
                INSERT INTO users
                    (username, email, password, address, contact, role, accountStatus)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                formData.username,
                formData.email,
                hashedPassword,
                formData.address,
                formData.contact,
                formData.role,
                formData.accountStatus
            ];

            db.query(insertSql, values, (insertError) => {
                if (insertError) {
                    logDatabaseError('Admin create user insert', insertError);
                    return renderCreateUserForm(req, res, 500, 'Unable to create user account.', formData);
                }

                req.flash('success', 'User account created successfully.');
                return res.redirect('/admin/users');
            });
        });
    });
});

app.post('/admin/users/:id/update', checkRole('Admin'), (req, res) => {
    const role = (req.body.role || '').trim();
    const accountStatus = (req.body.accountStatus || '').trim();
    const targetUserID = Number(req.params.id);

    if (!ADMIN_USER_ROLE_OPTIONS.includes(role)) {
        req.flash('error', 'Role is invalid.');
        return res.redirect('/admin/users');
    }

    if (!ADMIN_USER_STATUS_OPTIONS.includes(accountStatus)) {
        req.flash('error', 'Account status is invalid.');
        return res.redirect('/admin/users');
    }

    if (targetUserID === Number(currentUserID(req)) && (role !== 'Admin' || accountStatus !== 'Active')) {
        req.flash('error', 'You cannot change your own admin role or active account status.');
        return res.redirect('/admin/users');
    }

    const safetySql = `
        SELECT
            (SELECT COUNT(*) FROM users WHERE LOWER(role) = 'admin' AND accountStatus = 'Active') AS activeAdminCount,
            role,
            accountStatus
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    db.query(safetySql, [targetUserID], (safetyError, rows) => {
        if (safetyError) {
            logDatabaseError('Admin user update safety check', safetyError);
            req.flash('error', 'Unable to update user account.');
            return res.redirect('/admin/users');
        }

        if (rows.length === 0) {
            req.flash('error', 'User account was not found.');
            return res.redirect('/admin/users');
        }

        const currentRole = normalizeRole(rows[0].role);
        const isTargetActiveAdmin = currentRole === 'Admin' && rows[0].accountStatus === 'Active';
        const willRemainActiveAdmin = role === 'Admin' && accountStatus === 'Active';

        if (isTargetActiveAdmin && !willRemainActiveAdmin && Number(rows[0].activeAdminCount) <= 1) {
            req.flash('error', 'You cannot remove or disable the last active Admin account.');
            return res.redirect('/admin/users');
        }

        const sql = 'UPDATE users SET role = ?, accountStatus = ? WHERE id = ?';

        db.query(sql, [role, accountStatus, targetUserID], (error) => {
            if (error) {
                logDatabaseError('Admin user update', error);
                req.flash('error', 'Unable to update user account.');
                return res.redirect('/admin/users');
            }

            req.flash('success', 'User account updated successfully.');
            res.redirect('/admin/users');
        });
    });
});

app.post('/admin/users/:id/delete', checkRole('Admin'), (req, res) => {
    const targetUserID = Number(req.params.id);

    if (targetUserID === Number(currentUserID(req))) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin/users');
    }

    const safetySql = `
        SELECT
            (SELECT COUNT(*) FROM users WHERE LOWER(role) = 'admin' AND accountStatus = 'Active') AS activeAdminCount,
            role,
            accountStatus
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    db.query(safetySql, [targetUserID], (safetyError, rows) => {
        if (safetyError) {
            logDatabaseError('Admin user delete safety check', safetyError);
            req.flash('error', 'Unable to delete user account.');
            return res.redirect('/admin/users');
        }

        if (rows.length === 0) {
            req.flash('error', 'User account was not found.');
            return res.redirect('/admin/users');
        }

        if (normalizeRole(rows[0].role) === 'Admin' && rows[0].accountStatus === 'Active' && Number(rows[0].activeAdminCount) <= 1) {
            req.flash('error', 'You cannot delete the last active Admin account.');
            return res.redirect('/admin/users');
        }

        const sql = 'DELETE FROM users WHERE id = ?';

        db.query(sql, [targetUserID], (error) => {
            if (error) {
                logDatabaseError('Admin user delete', error);
                req.flash('error', 'Unable to delete user. The user may have appointments or feedback.');
                return res.redirect('/admin/users');
            }

            req.flash('success', 'User account deleted successfully.');
            res.redirect('/admin/users');
        });
    });
});

function renderStaffDashboard(req, res) {
    const appointmentsSql = `
        SELECT a.appointmentID, a.appointmentDate, a.appointmentTime, a.status,
               u.username AS customerName, u.email AS customerEmail, u.contact AS customerPhone,
               s.serviceName, q.queueNumber, q.queueStatus
        FROM appointments a
        INNER JOIN users u ON a.userID = u.id
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN \`queue\` q ON a.appointmentID = q.appointmentID
        ORDER BY a.appointmentDate DESC, a.appointmentTime DESC
        LIMIT 10
    `;
    const waitingSql = "SELECT COUNT(*) AS waitingCount FROM `queue` WHERE queueStatus = 'Waiting'";
    db.query(appointmentsSql, (appointmentError, appointments) => {
        if (appointmentError) {
            console.error('Staff dashboard error:', appointmentError.message);
            return res.status(500).send('Unable to load staff dashboard');
        }

        db.query(waitingSql, (waitingError, waitingRows) => {
            if (waitingError) {
                console.error('Waiting queue count error:', waitingError.message);
                return res.status(500).send('Unable to load staff dashboard');
            }

            const completedByEmailSql = `
                SELECT COUNT(*) AS completedToday
                FROM appointments a
                WHERE a.status = 'Completed'
                AND a.appointmentDate = CURDATE()
            `;

            db.query(completedByEmailSql, (completedError, completedRows) => {
                if (completedError) {
                    console.error('Completed count error:', completedError.message);
                    return res.status(500).send('Unable to load staff dashboard');
                }

                res.render('staff/staffdashboard', {
                    assignedCount: appointments.length,
                    waitingCount: waitingRows[0].waitingCount || 0,
                    completedToday: completedRows[0].completedToday || 0,
                    appointments,
                    formatQueueNumber,
                    user: req.session.user
                });
            });
        });
    });
}

app.get('/staff', requireStaff, (req, res) => res.redirect('/staff/dashboard'));
app.get('/staff/dashboard', requireStaff, renderStaffDashboard);

app.get('/staff/personal-report', checkRole('Staff'), (req, res) => {
    const sql = `
        SELECT a.status, COUNT(*) AS total
        FROM appointments a
        INNER JOIN staff st ON a.staffID = st.staffID
        WHERE st.email = ?
        GROUP BY a.status
        ORDER BY a.status
    `;

    db.query(sql, [req.session.user.email], (error, rows) => {
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

    db.query(sql, values, (error, staff) => {
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

    db.query(checkSql, [email, email], (checkError, rows) => {
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

        db.query(sql, [fullName, email, phone || null, position, availabilityStatus], (error) => {
            if (error) {
                console.error('Create staff error:', error.message);
                return res.status(500).send('Unable to create staff');
            }

            bcrypt.hash(password, 10, (hashError, hashedPassword) => {
                if (hashError) {
                    console.error('Staff password hash error:', hashError.message);
                    return res.status(500).send('Staff was created, but the login account could not be created');
                }

                const userSql = `
                    INSERT INTO users
                        (username, email, password, address, contact, role, accountStatus)
                    VALUES
                        (?, ?, ?, 'Not provided', ?, 'Staff', 'Active')
                `;

                db.query(userSql, [fullName, email, hashedPassword, phone || 'N/A'], (userError) => {
                    if (userError) {
                        console.error('Create staff login error:', userError.message);
                        return res.status(500).send('Staff was created, but the login account could not be created');
                    }

                    return res.redirect('/admin/staff');
                });
            });
        });
    });
});

app.get('/admin/staff/:staffID', checkRole('Admin'), (req, res) => {
    const sql = 'SELECT * FROM staff WHERE staffID = ? LIMIT 1';

    db.query(sql, [req.params.staffID], (error, rows) => {
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

    db.query(sql, [req.params.staffID], (error, rows) => {
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

    db.query(checkSql, [email, req.params.staffID], (checkError, rows) => {
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

        db.query(oldStaffSql, [req.params.staffID], (oldError, oldRows) => {
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

            db.query(sql, [fullName, email, phone || null, position, availabilityStatus, req.params.staffID], (error) => {
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

                db.query(userSql, [fullName, email, phone || null, oldEmail], () => {
                    res.redirect('/admin/staff');
                });
            });
        });
    });
});

app.post('/admin/staff/:staffID/delete', checkRole('Admin'), (req, res) => {
    const oldStaffSql = 'SELECT email FROM staff WHERE staffID = ? LIMIT 1';

    db.query(oldStaffSql, [req.params.staffID], (oldError, oldRows) => {
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

        db.query(sql, [req.params.staffID], (error, result) => {
            if (error) {
                console.error('Delete staff error:', error.message);
                return res.status(500).send('Unable to delete staff');
            }

            if (result.affectedRows === 0 || !staffEmail) {
                return res.redirect('/admin/staff');
            }

            const userSql = "DELETE FROM users WHERE role = 'Staff' AND email = ?";

            db.query(userSql, [staffEmail], () => {
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
            u.username AS customer_name,
            u.email AS customer_email,
            u.contact AS customerPhone,
            s.serviceName,
            a.appointmentDate,
            a.appointmentTime,
            a.remarks,
            a.status,
            q.queueNumber,
            q.queueStatus
        FROM appointments a
        INNER JOIN users u ON a.userID = u.id
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN \`queue\` q ON a.appointmentID = q.appointmentID
        ORDER BY a.appointmentDate, a.appointmentTime
    `;

    db.query(sql, (error, appointments) => {
        if (error) {
            console.error('Appointments query error:', error.message);
            return res.status(500).send('Unable to retrieve appointments');
        }

        const formattedAppointments = appointments.map((appointment) => ({
            ...appointment,
            formattedDate: formatDisplayDate(appointment.appointmentDate),
            formattedTime: formatDisplayTime(appointment.appointmentTime)
        }));
        const appointmentSummary = {
            total: formattedAppointments.length,
            pending: formattedAppointments.filter((appointment) => appointment.status === 'Pending').length,
            approved: formattedAppointments.filter((appointment) => appointment.status === 'Approved').length,
            inQueue: formattedAppointments.filter((appointment) => ['Waiting', 'Serving'].includes(appointment.queueStatus)).length
        };

        res.render('appointments/index', {
            appointments: formattedAppointments,
            appointmentSummary,
            formatQueueNumber,
            user: req.session.user
        });
    });
});

app.get('/appointments/book', (req, res) => {
    const sql = 'SELECT serviceID, serviceName FROM services WHERE status = "Available" ORDER BY serviceName';

    db.query(sql, (error, services) => {
        if (error) {
            console.error('Services query error:', error.message);
            return res.status(500).send('Unable to load booking form');
        }

        loadActiveAnnouncements((announcements) => {
            res.render('appointments/book', {
                services,
                announcements,
                formData: {},
                error: null,
                user: req.session.user || null
            });
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

        return db.query(serviceSql, (serviceError, services) => {
            if (serviceError) {
                console.error('Services query error:', serviceError.message);
                return res.status(500).send('Unable to load booking form');
            }

            return loadActiveAnnouncements((announcements) => {
                return res.status(400).render('appointments/book', {
                    services,
                    announcements,
                    formData: req.body,
                    error: 'Please fill in all required booking fields.',
                    user: req.session.user || null
                });
            });
        });
    }

    const logBookingError = (area, error) => {
        console.error('Appointment booking database error');
        console.error('Area:', area);
        console.error('Code:', error.code);
        console.error('Errno:', error.errno);
        console.error('SQL State:', error.sqlState);
        console.error('Message:', error.sqlMessage || error.message);
    };

    const createAppointmentWithQueue = (userID) => {
        db.beginTransaction((transactionError) => {
            if (transactionError) {
                logBookingError('transaction start', transactionError);
                return res.status(500).send('Unable to save appointment. Please try again.');
            }

            const appointmentSql = `
                INSERT INTO appointments
                    (userID, serviceID, staffID, appointmentDate, appointmentTime, remarks, status)
                VALUES
                    (?, ?, NULL, ?, ?, ?, 'Pending')
            `;

            db.query(appointmentSql, [userID, serviceID, appointmentDate, appointmentTime, remarks || null], (appointmentError, appointmentResult) => {
                if (appointmentError) {
                    return db.rollback(() => {
                        logBookingError('appointments insert', appointmentError);
                        return res.status(500).send('Unable to save appointment. Please try again.');
                    });
                }

                const appointmentID = appointmentResult.insertId;
                const queueSql = `
                    INSERT INTO \`queue\`
                        (appointmentID, queueNumber, queueStatus, checkInTime)
                    VALUES
                        (?, 0, 'Waiting', NOW())
                `;

                db.query(queueSql, [appointmentID], (queueError, queueResult) => {
                    if (queueError) {
                        return db.rollback(() => {
                            logBookingError('queue insert', queueError);
                            return res.status(500).send('Unable to save appointment. Please try again.');
                        });
                    }

                    const queueID = queueResult.insertId;
                    const queueNumber = queueID;
                    const updateQueueSql = 'UPDATE `queue` SET queueNumber = ? WHERE queueID = ?';

                    db.query(updateQueueSql, [queueNumber, queueID], (updateQueueError) => {
                        if (updateQueueError) {
                            return db.rollback(() => {
                                logBookingError('queue number update', updateQueueError);
                                return res.status(500).send('Unable to save appointment. Please try again.');
                            });
                        }

                        db.commit((commitError) => {
                            if (commitError) {
                                return db.rollback(() => {
                                    logBookingError('transaction commit', commitError);
                                    return res.status(500).send('Unable to save appointment. Please try again.');
                                });
                            }

                            rememberPublicAppointment(req, appointmentID);

                            return res.render('appointments/success', {
                                title: 'Booking Successful',
                                appointment: {
                                    appointmentID,
                                    appointmentDate,
                                    appointmentTime,
                                    status: 'Pending'
                                },
                                queue: {
                                    queueID,
                                    queueNumber,
                                    formattedQueueNumber: formatQueueNumber(queueNumber)
                                },
                                user: req.session.user || null
                            });
                        });
                    });
                });
            });
        });
    };

    if (currentUserID(req)) {
        return createAppointmentWithQueue(currentUserID(req));
    }

    const userSql = 'SELECT id FROM users WHERE email = ? LIMIT 1';
    db.query(userSql, [customerEmail], (userError, users) => {
        if (userError) {
            logBookingError('customer lookup', userError);
            return res.status(500).send('Unable to save appointment. Please try again.');
        }

        if (users.length > 0) {
            return createAppointmentWithQueue(users[0].id);
        }

        const temporaryPassword = `booking-${Date.now()}-${Math.random()}`;
        const createUserSql = `
            INSERT INTO users
                (username, email, password, address, contact, role, accountStatus)
            VALUES
                (?, ?, ?, 'Not provided', ?, 'Customer', 'Active')
        `;
        const username = customerName.trim().slice(0, 20);
        const contact = customerPhone ? customerPhone.trim().slice(0, 10) : 'N/A';

        bcrypt.hash(temporaryPassword, 10, (hashError, hashedPassword) => {
            if (hashError) {
                console.error('Customer temporary password hash error:', hashError.message);
                return res.status(500).send('Unable to save appointment. Please try again.');
            }

            db.query(createUserSql, [username, customerEmail, hashedPassword, contact], (createUserError, result) => {
                if (createUserError) {
                    logBookingError('customer create', createUserError);
                    return res.status(500).send('Unable to save appointment. Please try again.');
                }

                return createAppointmentWithQueue(result.insertId);
            });
        });
    });
});

app.get('/booking-details', (req, res) => {
    res.render('appointments/check', {
        error: res.locals.error,
        user: req.session.user || null
    });
});

app.post('/booking-details', (req, res) => {
    const { appointmentID, customerEmail } = req.body;

    if (!appointmentID || !customerEmail) {
        req.flash('error', 'Please enter your booking ID and email address.');
        return res.redirect('/booking-details');
    }

    res.redirect(`/appointments/${appointmentID}?email=${encodeURIComponent(customerEmail.trim().toLowerCase())}`);
});

app.get('/appointments/:id', (req, res) => {
    const sql = `
        SELECT a.*, u.username AS customerName, u.email AS customerEmail,
               u.contact AS customerPhone, s.serviceName, st.fullName AS staffName,
               q.queueNumber, q.queueStatus
        FROM appointments a
        INNER JOIN users u ON a.userID = u.id
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN staff st ON a.staffID = st.staffID
        LEFT JOIN \`queue\` q ON a.appointmentID = q.appointmentID
        WHERE a.appointmentID = ?
        LIMIT 1
    `;

    db.query(sql, [req.params.id], (error, rows) => {
        if (error) {
            console.error('Booking details query error:', error.message);
            return res.status(500).send('Unable to load booking details');
        }

        if (rows.length === 0) {
            return res.status(404).send('Booking not found.');
        }

        if (!canViewPublicAppointment(req, rows[0])) {
            return res.status(403).send('Please verify this booking with the email address used to book it.');
        }

        rememberPublicAppointment(req, rows[0].appointmentID);

        res.render('appointments/details', {
            appointment: rows[0],
            customerEmail: req.query.email || '',
            user: req.session.user || null
        });
    });
});

app.get('/appointments/edit/:id', checkAnyRole(['Staff', 'Admin']), (req, res) => {
    const appointmentSql = 'SELECT * FROM appointments WHERE appointmentID = ?';
    const servicesSql = 'SELECT serviceID, serviceName FROM services ORDER BY serviceName';

    db.query(appointmentSql, [req.params.id], (appointmentError, rows) => {
        if (appointmentError) {
            console.error('Appointment edit query error:', appointmentError.message);
            return res.status(500).send('Unable to load appointment');
        }

        if (rows.length === 0) {
            return res.status(404).send('Appointment not found');
        }

        db.query(servicesSql, (servicesError, services) => {
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

    db.query(selectSql, [req.params.id], (selectError, rows) => {
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

        db.query(sql, [serviceID, appointmentDate, appointmentTime, remarks || null, nextStatus, req.params.id], (error) => {
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

    db.query(selectSql, [req.params.id], (selectError, rows) => {
        if (selectError) {
            console.error('Cancel appointment query error:', selectError.message);
            return res.status(500).send('Error cancelling appointment');
        }

        if (rows.length === 0) {
            return res.status(404).send('Appointment not found');
        }

        const sql = "UPDATE appointments SET status = 'Cancelled' WHERE appointmentID = ?";

        db.query(sql, [req.params.id], (error) => {
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

    db.query(sql, [req.params.id], (error) => {
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

    db.query(appointmentSql, [req.params.appointmentID], (appointmentError, appointmentRows) => {
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

        db.query(existingSql, [req.params.appointmentID], (existingError, existingRows) => {
            if (existingError) {
                console.error('Existing queue query error:', existingError.message);
                return res.status(500).send('Unable to check in');
            }

            if (existingRows.length > 0) {
                return res.redirect(`/queue/status/${req.params.appointmentID}`);
            }

            const nextSql = 'SELECT COALESCE(MAX(queueNumber), 0) + 1 AS nextQueueNumber FROM `queue`';

            db.query(nextSql, (nextError, nextRows) => {
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

                db.query(insertSql, [req.params.appointmentID, nextRows[0].nextQueueNumber], (insertError) => {
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
    const { appointmentID, customerEmail } = req.body;

    if (!appointmentID || !customerEmail) {
        req.flash('error', 'Please enter your booking ID and email address.');
        return res.redirect('/queue/status');
    }

    res.redirect(`/queue/status/${appointmentID}?email=${encodeURIComponent(customerEmail.trim().toLowerCase())}`);
});

app.get('/queue/status/:appointmentID', (req, res) => {
    const sql = `
        SELECT q.*, a.userID, a.appointmentDate, a.appointmentTime,
               a.appointmentID, a.status AS appointmentStatus, u.username AS customerName,
               u.email AS customerEmail,
               s.serviceName, st.fullName AS staffName
        FROM \`queue\` q
        INNER JOIN appointments a ON q.appointmentID = a.appointmentID
        INNER JOIN users u ON a.userID = u.id
        LEFT JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN staff st ON a.staffID = st.staffID
        WHERE q.appointmentID = ?
        LIMIT 1
    `;

    db.query(sql, [req.params.appointmentID], (error, rows) => {
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

        if (!canViewPublicAppointment(req, rows[0])) {
            return res.status(403).send('Please verify this queue status with the email address used to book it.');
        }

        const countSql = `
            SELECT COUNT(*) AS customersAhead
            FROM \`queue\`
            WHERE queueStatus IN ('Waiting', 'Serving')
            AND queueNumber < ?
        `;

        db.query(countSql, [rows[0].queueNumber], (countError, countRows) => {
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
               u.username AS customerName, s.serviceName, st.fullName AS staffName
        FROM \`queue\` q
        INNER JOIN appointments a ON q.appointmentID = a.appointmentID
        INNER JOIN users u ON a.userID = u.id
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

    db.query(sql, (error, queueEntries) => {
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

    db.query(sql, [req.params.queueID], (error) => {
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

    db.query(sql, [req.params.queueID], (error) => {
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

    db.query(sql, [req.params.queueID], (error) => {
        if (error) {
            console.error('Cancel queue error:', error.message);
            return res.status(500).send('Unable to update queue');
        }

        res.redirect('/queue/admin');
    });
});

const FEEDBACK_COMMENT_MAX_LENGTH = 500;

function getFeedbackEmail(req) {
    return (req.query.email || req.body.customerEmail || '').trim().toLowerCase();
}

function feedbackAccessQuery(req) {
    const email = getFeedbackEmail(req);
    return email ? `?email=${encodeURIComponent(email)}` : '';
}

function canAccessCustomerFeedback(req, row) {
    if (!row) {
        return false;
    }

    if (req.session.user && normalizeRole(req.session.user.role) === 'Customer') {
        return Number(currentUserID(req)) === Number(row.appointmentUserID);
    }

    if (req.session.user) {
        return false;
    }

    const knownAppointments = req.session.publicAppointments || [];
    if (knownAppointments.includes(Number(row.appointmentID))) {
        return true;
    }

    const email = getFeedbackEmail(req);
    return Boolean(email && email === String(row.customerEmail || '').toLowerCase());
}

function isFeedbackEligible(row) {
    if (!row) {
        return false;
    }

    const appointmentStatus = String(row.appointmentStatus || '');
    const queueStatus = String(row.queueStatus || '');

    if (['Pending', 'Rejected', 'Cancelled'].includes(appointmentStatus)) {
        return false;
    }

    if (queueStatus === 'Cancelled') {
        return false;
    }

    return appointmentStatus === 'Completed'
        || (appointmentStatus === 'Approved' && queueStatus === 'Completed');
}

function validateFeedbackInput(ratingValue, commentsValue) {
    const rating = Number(ratingValue);
    const comments = String(commentsValue || '').trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return {
            error: 'Please choose a rating between 1 and 5.',
            rating,
            comments
        };
    }

    if (!comments) {
        return {
            error: 'Please enter your comments.',
            rating,
            comments
        };
    }

    if (comments.length > FEEDBACK_COMMENT_MAX_LENGTH) {
        return {
            error: `Comments must be ${FEEDBACK_COMMENT_MAX_LENGTH} characters or fewer.`,
            rating,
            comments
        };
    }

    return {
        error: null,
        rating,
        comments
    };
}

function renderFeedbackForm(req, res, statusCode, appointment, error, formData = {}) {
    return res.status(statusCode).render('feedback/addFeedback', {
        appointment,
        error,
        formData,
        customerEmail: getFeedbackEmail(req),
        user: req.session.user || null
    });
}

const feedbackAppointmentSql = `
    SELECT a.appointmentID, a.userID AS appointmentUserID,
           a.status AS appointmentStatus, a.appointmentDate,
           a.appointmentTime, u.username AS customerName,
           u.email AS customerEmail, s.serviceName, q.queueNumber,
           q.queueStatus, f.feedbackID
    FROM appointments a
    INNER JOIN users u ON a.userID = u.id
    INNER JOIN services s ON a.serviceID = s.serviceID
    LEFT JOIN \`queue\` q ON a.appointmentID = q.appointmentID
    LEFT JOIN feedback f ON a.appointmentID = f.appointmentID
    WHERE a.appointmentID = ?
    LIMIT 1
`;

const feedbackDetailsSql = `
    SELECT f.feedbackID, f.appointmentID, f.userID, f.rating, f.comments,
           f.submittedDate, a.userID AS appointmentUserID,
           a.status AS appointmentStatus, a.appointmentDate,
           a.appointmentTime, u.username AS customerName,
           u.email AS customerEmail, s.serviceName, q.queueNumber,
           q.queueStatus
    FROM feedback f
    INNER JOIN appointments a ON f.appointmentID = a.appointmentID
    INNER JOIN users u ON a.userID = u.id
    INNER JOIN services s ON a.serviceID = s.serviceID
    LEFT JOIN \`queue\` q ON a.appointmentID = q.appointmentID
    WHERE f.feedbackID = ?
    LIMIT 1
`;

app.get('/feedback', checkRole('Admin'), (req, res) => {
    const sql = `
        SELECT f.feedbackID, f.appointmentID, f.userID, f.rating, f.comments,
               f.submittedDate, u.username AS customerName,
               u.email AS customerEmail, s.serviceName,
               a.appointmentDate, a.appointmentTime, q.queueNumber,
               q.queueStatus
        FROM feedback f
        INNER JOIN appointments a ON f.appointmentID = a.appointmentID
        INNER JOIN users u ON a.userID = u.id
        INNER JOIN services s ON a.serviceID = s.serviceID
        LEFT JOIN \`queue\` q ON a.appointmentID = q.appointmentID
        ORDER BY f.submittedDate DESC
    `;

    db.query(sql, (error, feedback) => {
        if (error) {
            logDatabaseError('Feedback list', error);
            return res.status(500).send('Unable to retrieve feedback');
        }

        res.render('feedback/feedbackList', {
            feedback,
            success: res.locals.success,
            error: res.locals.error,
            user: req.session.user
        });
    });
});

app.get('/feedback/add/:appointmentID', (req, res) => {
    db.query(feedbackAppointmentSql, [req.params.appointmentID], (error, rows) => {
        if (error) {
            logDatabaseError('Feedback appointment lookup', error);
            return res.status(500).send('Unable to load feedback page');
        }

        if (rows.length === 0) {
            req.flash('error', 'Appointment not found.');
            return res.redirect('/booking-details');
        }

        const appointment = rows[0];

        if (!canAccessCustomerFeedback(req, appointment)) {
            req.flash('error', 'You are not authorised to submit feedback for this appointment.');
            return res.redirect('/booking-details');
        }

        rememberPublicAppointment(req, appointment.appointmentID);

        if (!isFeedbackEligible(appointment)) {
            return renderFeedbackForm(
                req,
                res,
                400,
                appointment,
                'This appointment is not eligible for feedback yet. Feedback can be submitted after the appointment is completed.'
            );
        }

        if (appointment.feedbackID) {
            req.flash('error', 'Feedback already submitted.');
            return res.redirect(`/feedback/${appointment.feedbackID}${feedbackAccessQuery(req)}`);
        }

        return renderFeedbackForm(req, res, 200, appointment, null);
    });
});

app.post('/feedback/add/:appointmentID', (req, res) => {
    db.query(feedbackAppointmentSql, [req.params.appointmentID], (lookupError, rows) => {
        if (lookupError) {
            logDatabaseError('Feedback appointment lookup', lookupError);
            return res.status(500).send('Unable to submit feedback');
        }

        if (rows.length === 0) {
            req.flash('error', 'Appointment not found.');
            return res.redirect('/booking-details');
        }

        const appointment = rows[0];

        if (!canAccessCustomerFeedback(req, appointment)) {
            req.flash('error', 'You are not authorised to submit feedback for this appointment.');
            return res.redirect('/booking-details');
        }

        rememberPublicAppointment(req, appointment.appointmentID);

        if (!isFeedbackEligible(appointment)) {
            return renderFeedbackForm(
                req,
                res,
                400,
                appointment,
                'This appointment is not eligible for feedback yet. Feedback can be submitted after the appointment is completed.',
                req.body
            );
        }

        if (appointment.feedbackID) {
            req.flash('error', 'Feedback already submitted.');
            return res.redirect(`/feedback/${appointment.feedbackID}${feedbackAccessQuery(req)}`);
        }

        const validation = validateFeedbackInput(req.body.rating, req.body.comments);

        if (validation.error) {
            return renderFeedbackForm(req, res, 400, appointment, validation.error, req.body);
        }

        const duplicateSql = 'SELECT feedbackID FROM feedback WHERE appointmentID = ? LIMIT 1';

        db.query(duplicateSql, [appointment.appointmentID], (duplicateError, duplicateRows) => {
            if (duplicateError) {
                logDatabaseError('Feedback duplicate check', duplicateError);
                return res.status(500).send('Unable to submit feedback');
            }

            if (duplicateRows.length > 0) {
                req.flash('error', 'Feedback already submitted.');
                return res.redirect(`/feedback/${duplicateRows[0].feedbackID}${feedbackAccessQuery(req)}`);
            }

            const insertSql = `
                INSERT INTO feedback (appointmentID, userID, rating, comments, submittedDate)
                VALUES (?, ?, ?, ?, NOW())
            `;

            db.query(
                insertSql,
                [appointment.appointmentID, appointment.appointmentUserID, validation.rating, validation.comments],
                (insertError, result) => {
                    if (insertError) {
                        logDatabaseError('Feedback create', insertError);
                        return renderFeedbackForm(
                            req,
                            res,
                            500,
                            appointment,
                            'Unable to save feedback.',
                            req.body
                        );
                    }

                    req.flash('success', 'Thank you for your feedback.');
                    return res.redirect(`/feedback/${result.insertId}${feedbackAccessQuery(req)}`);
                }
            );
        });
    });
});

app.get('/feedback/edit/:feedbackID', checkRole('Admin'), (req, res) => {
    db.query(feedbackDetailsSql, [req.params.feedbackID], (error, rows) => {
        if (error) {
            logDatabaseError('Feedback edit lookup', error);
            return res.status(500).send('Unable to load feedback');
        }

        if (rows.length === 0) {
            return res.status(404).send('Feedback not found.');
        }

        res.render('feedback/editFeedback', {
            feedback: rows[0],
            error: null,
            formData: rows[0],
            customerEmail: '',
            backUrl: '/feedback',
            user: req.session.user
        });
    });
});

app.post('/feedback/edit/:feedbackID', checkRole('Admin'), (req, res) => {
    const validation = validateFeedbackInput(req.body.rating, req.body.comments);

    if (validation.error) {
        return db.query(feedbackDetailsSql, [req.params.feedbackID], (lookupError, rows) => {
            if (lookupError) {
                logDatabaseError('Feedback edit lookup', lookupError);
                return res.status(500).send('Unable to load feedback');
            }

            if (rows.length === 0) {
                return res.status(404).send('Feedback not found.');
            }

            return res.status(400).render('feedback/editFeedback', {
                feedback: rows[0],
                error: validation.error,
                formData: req.body,
                customerEmail: '',
                backUrl: '/feedback',
                user: req.session.user
            });
        });
    }

    const sql = `
        UPDATE feedback
        SET rating = ?, comments = ?
        WHERE feedbackID = ?
    `;
    const values = [validation.rating, validation.comments, req.params.feedbackID];

    db.query(sql, values, (error) => {
        if (error) {
            logDatabaseError('Feedback update', error);
            return res.status(500).send('Unable to update feedback');
        }

        req.flash('success', 'Feedback updated successfully.');
        res.redirect('/feedback');
    });
});

app.post('/feedback/delete/:feedbackID', checkRole('Admin'), (req, res) => {
    const sql = `
        DELETE FROM feedback
        WHERE feedbackID = ?
    `;
    const values = [req.params.feedbackID];

    db.query(sql, values, (error) => {
        if (error) {
            logDatabaseError('Feedback admin delete', error);
            return res.status(500).send('Unable to delete feedback');
        }

        req.flash('success', 'Feedback deleted successfully.');
        res.redirect('/feedback');
    });
});

app.get('/feedback/:feedbackID/edit', (req, res) => {
    if (req.session.user && normalizeRole(req.session.user.role) === 'Admin') {
        return res.redirect(`/feedback/edit/${req.params.feedbackID}`);
    }

    db.query(feedbackDetailsSql, [req.params.feedbackID], (error, rows) => {
        if (error) {
            logDatabaseError('Feedback customer edit lookup', error);
            return res.status(500).send('Unable to load feedback');
        }

        if (rows.length === 0) {
            return res.status(404).send('Feedback not found.');
        }

        const feedback = rows[0];

        if (!canAccessCustomerFeedback(req, feedback)) {
            req.flash('error', 'You are not authorised to edit this feedback.');
            return res.redirect('/booking-details');
        }

        return res.render('feedback/editFeedback', {
            feedback,
            error: null,
            formData: feedback,
            customerEmail: getFeedbackEmail(req),
            backUrl: `/feedback/${feedback.feedbackID}${feedbackAccessQuery(req)}`,
            user: req.session.user || null
        });
    });
});

app.post('/feedback/:feedbackID/edit', (req, res) => {
    if (req.session.user && normalizeRole(req.session.user.role) === 'Admin') {
        return res.redirect(307, `/feedback/edit/${req.params.feedbackID}`);
    }

    db.query(feedbackDetailsSql, [req.params.feedbackID], (lookupError, rows) => {
        if (lookupError) {
            logDatabaseError('Feedback customer edit lookup', lookupError);
            return res.status(500).send('Unable to update feedback');
        }

        if (rows.length === 0) {
            return res.status(404).send('Feedback not found.');
        }

        const feedback = rows[0];

        if (!canAccessCustomerFeedback(req, feedback)) {
            req.flash('error', 'You are not authorised to edit this feedback.');
            return res.redirect('/booking-details');
        }

        const validation = validateFeedbackInput(req.body.rating, req.body.comments);

        if (validation.error) {
            return res.status(400).render('feedback/editFeedback', {
                feedback,
                error: validation.error,
                formData: req.body,
                customerEmail: getFeedbackEmail(req),
                backUrl: `/feedback/${feedback.feedbackID}${feedbackAccessQuery(req)}`,
                user: req.session.user || null
            });
        }

        const sql = `
            UPDATE feedback
            SET rating = ?, comments = ?
            WHERE feedbackID = ?
            AND userID = ?
        `;

        db.query(
            sql,
            [validation.rating, validation.comments, feedback.feedbackID, feedback.appointmentUserID],
            (updateError) => {
                if (updateError) {
                    logDatabaseError('Feedback customer update', updateError);
                    return res.status(500).send('Unable to update feedback');
                }

                req.flash('success', 'Feedback updated successfully.');
                return res.redirect(`/feedback/${feedback.feedbackID}${feedbackAccessQuery(req)}`);
            }
        );
    });
});

app.post('/feedback/:feedbackID/delete', (req, res) => {
    if (req.session.user && normalizeRole(req.session.user.role) === 'Admin') {
        return res.redirect(307, `/feedback/delete/${req.params.feedbackID}`);
    }

    if (req.session.user && normalizeRole(req.session.user.role) === 'Staff') {
        return res.status(403).send('You do not have permission to delete feedback.');
    }

    db.query(feedbackDetailsSql, [req.params.feedbackID], (lookupError, rows) => {
        if (lookupError) {
            logDatabaseError('Feedback customer delete lookup', lookupError);
            return res.status(500).send('Unable to delete feedback');
        }

        if (rows.length === 0) {
            return res.status(404).send('Feedback not found.');
        }

        const feedback = rows[0];

        if (!canAccessCustomerFeedback(req, feedback)) {
            req.flash('error', 'You are not authorised to delete this feedback.');
            return res.redirect('/booking-details');
        }

        const sql = `
            DELETE FROM feedback
            WHERE feedbackID = ?
            AND userID = ?
        `;

        db.query(sql, [feedback.feedbackID, feedback.appointmentUserID], (deleteError) => {
            if (deleteError) {
                logDatabaseError('Feedback customer delete', deleteError);
                return res.status(500).send('Unable to delete feedback');
            }

            req.flash('success', 'Feedback deleted successfully.');
            return res.redirect(`/appointments/${feedback.appointmentID}${feedbackAccessQuery(req)}`);
        });
    });
});

app.get('/feedback/:feedbackID', (req, res) => {
    db.query(feedbackDetailsSql, [req.params.feedbackID], (error, rows) => {
        if (error) {
            logDatabaseError('Feedback details lookup', error);
            return res.status(500).send('Unable to load feedback');
        }

        if (rows.length === 0) {
            return res.status(404).send('Feedback not found.');
        }

        const feedback = rows[0];
        const role = req.session.user ? normalizeRole(req.session.user.role) : '';

        if (role !== 'Admin' && !canAccessCustomerFeedback(req, feedback)) {
            req.flash('error', 'You are not authorised to view this feedback.');
            return res.redirect('/booking-details');
        }

        res.render('feedback/feedbackDetails', {
            feedback,
            success: res.locals.success,
            error: res.locals.error,
            customerEmail: getFeedbackEmail(req),
            isAdminView: role === 'Admin',
            user: req.session.user || null
        });
    });
});

app.get('/service-management', checkRole('Admin'), (req, res) => {
    const sql = `
        SELECT serviceID, serviceName, description, duration, price, status, createdAt
        FROM services
        ORDER BY serviceName ASC
    `;

    db.query(sql, (error, services) => {
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

    db.query(sql, [serviceName, description || null, duration, price, status], (error) => {
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

    db.query(sql, [req.params.serviceID], (error, rows) => {
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

    db.query(sql, [serviceName, description || null, duration, price, status, req.params.serviceID], (error) => {
        if (error) {
            console.error('Update service error:', error.message);
            return res.status(500).send('Unable to update the service');
        }

        res.redirect(`/service-management/${req.params.serviceID}`);
    });
});

app.post('/service-management/:serviceID/delete', checkRole('Admin'), (req, res) => {
    const sql = 'DELETE FROM services WHERE serviceID = ?';

    db.query(sql, [req.params.serviceID], (error) => {
        if (error) {
            console.error('Delete service error:', error.message);
            return res.status(500).send('Unable to delete the service');
        }

        res.redirect('/service-management?success=Service deleted successfully.');
    });
});

app.get('/service-management/:serviceID', checkRole('Admin'), (req, res) => {
    const sql = 'SELECT * FROM services WHERE serviceID = ?';

    db.query(sql, [req.params.serviceID], (error, rows) => {
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

    db.query(statusSql, (statusError, appointmentsByStatus) => {
        if (statusError) {
            console.error('Report status error:', statusError.message);
            return res.status(500).send('Unable to generate report');
        }

        db.query(serviceSql, (serviceError, appointmentsByService) => {
            if (serviceError) {
                console.error('Report service error:', serviceError.message);
                return res.status(500).send('Unable to generate report');
            }

            db.query(feedbackSql, (feedbackError, feedbackRows) => {
                if (feedbackError) {
                    console.error('Report feedback error:', feedbackError.message);
                    return res.status(500).send('Unable to generate report');
                }

                db.query(monthlySql, (monthlyError, monthlyAppointments) => {
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
