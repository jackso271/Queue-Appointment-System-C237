require('dotenv').config();

const express = require('express');
const path = require('path');

const queueRoutes = require('./routes/queueRoutes');
const serviceManagementRoutes =
    require('./routes/serviceManagementRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', queueRoutes);

app.use(
    '/service-management',
    serviceManagementRoutes
);

app.use('/', appointmentRoutes);

app.get('/', (req, res) => {
    res.redirect('/service-management');
});

app.use((req, res) => {
    res.status(404).send('Page not found.');
});

app.get('/', (req, res) => {
    res.render('index'); 
});

app.listen(PORT, () => {
    console.log(
        `QueueEase is running at http://localhost:${PORT}`
    );
});

