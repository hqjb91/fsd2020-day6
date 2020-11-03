const express = require('express');
const router = express.Router();
// Get the mysql driver with promise support
const mysql = require('mysql2/promise');

// Set page limit
const pageLimit = 3;

// SQL
const SQL_FIND_BY_NAME = 'select * from apps where name like ? limit ? offset ?';

// Creating connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'playstore',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 4,
    timezone: '+08:00',
    queueLimit: 0,
    multipleStatements: false
});

router.get('/', (req, res) => {
    const pageNumber = 1;
    res.status(200);
    res.type('text/html');
    res.render('index', {pageNumber});
});

router.get('/search', async (req, res) => {

    const { searchQuery } = req.query;
    let pageNumber = parseInt(req.query.pageNumber);
    let pageNumberUp = parseInt(req.query.pageNumberUp);
    let pageNumberDown = parseInt(req.query.pageNumberDown);

    if (pageNumberUp) {
        pageNumber = pageNumberUp + 1;
    };
    if (pageNumberDown) {
        pageNumber = pageNumberDown - 1;
    }

    const pageOffset = pageLimit * (pageNumber-1);

    console.log("Page Limit: " + pageLimit + " and Page Offset: " + pageOffset);

    // Acquire a connection from the pool
    const conn = await pool.getConnection();

    try {
        // Perform the query
        const [ records, metadata ] = await conn.query(SQL_FIND_BY_NAME, [`% ${searchQuery} %`, pageLimit, pageOffset]); // Will return an array of two elements : 1st is an array of record, 2nd is metadata of the records
    
        res.status(200);
        res.type('text/html');
        res.render('index', {records, pageNumber, searchQuery});
    
    } catch (e) {
        console.error('Error', e);
    } finally {
        conn.release();
    }

});

module.exports = {router, pool};