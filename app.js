require('dotenv').config();

const express = require('express');
const path = require('path');
const queueRoutes = require('./routes/queueRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);
app.use('/auth', authRoutes);
app.use('/', queueRoutes);

app.get('/', (req, res) => {
    res.redirect('/queue/admin');
});

app.listen(PORT, () => {
    console.log(`QueueEase server is running on http://localhost:${PORT}`);
});

