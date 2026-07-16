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
});x