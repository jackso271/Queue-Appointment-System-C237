require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const queueRoutes = require('./routes/queueRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/', queueRoutes);

app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect(req.session.role === 'Admin' ? '/queue/admin' : '/user/profile');
    }
    return res.redirect('/auth/register');
});

app.listen(PORT, () => {
    console.log(`QueueEase server is running on http://localhost:${PORT}`);
});

