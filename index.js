// Load libraries
const express = require('express');
const hbs = require('express-handlebars');
require('dotenv').config();
const route = require('./routes/route').router;
const pool = require('./routes/route').pool;

// Configure Port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

// Create an instance of an application
const app = express();
const http = require('http').createServer(app);

// Configure handlebars
app.engine('hbs', hbs({ defaultLayout: 'default.hbs'}));
app.set('view engine', 'hbs');

// Configure routes
app.use('/', route);

const startApp = async (app, pool) => {
    try {
        // Get a connection from the connection pool
        const conn = await pool.getConnection();

        console.info('Pinging database');
        await conn.ping();

        // Release the connection
        conn.release();

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server has started on ${PORT} at ${new Date()}.`);
        });

    } catch (e) {
        console.error('Cannot ping the database: ', e);
    }
};

startApp(http, pool);

// Start the server
// http.listen(PORT, () => {
//     console.log(`Server has started on ${PORT} at ${new Date()}.`);
// });