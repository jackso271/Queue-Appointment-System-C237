const express = require('express');
const path = require('path');
require('dotenv').config();

const serviceManagementRoutes =
    require('./routes/serviceManagementRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/service-management');
});

app.use(
    '/service-management',
    serviceManagementRoutes
);

app.use((req, res) => {
    res.status(404).send('Page not found.');
});

app.listen(PORT, () => {
    console.log(
        `QueueEase is running at http://localhost:${PORT}`
    );
});


const serviceDatabase =
    require('./config/serviceDatabase');

serviceDatabase.query('SELECT 1 AS test', (error, results) => {
    if (error) {
        console.error('Database test failed:', error);
    } else {
        console.log('Database test succeeded:', results);
    }
});