const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection using environment variables for security
const pool = new Pool({
    user: process.env.PGUSER || 'your_pg_user',
    host: process.env.PGHOST || 'your_pg_host',
    database: process.env.PGDATABASE || 'your_database_name',
    password: process.env.PGPASSWORD || 'your_pg_password',
    port: process.env.PGPORT || 5432,
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Create the table if it doesn't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        timestamp BIGINT NOT NULL,
        is_active BOOLEAN NOT NULL
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table created or verified successfully.');
    }
});

// Endpoint to receive data from the app
app.post('/endpoint', async (req, res) => {
    const { userId, timestamp, isActive } = req.body;
    if (!userId || timestamp === undefined || isActive === undefined) {
        return res.status(400).send('Invalid data format.');
    }

    try {
        const query = 'INSERT INTO activity_logs (user_id, timestamp, is_active) VALUES ($1, $2, $3)';
        await pool.query(query, [userId, timestamp, isActive]);
        console.log(`Data received from userId: ${userId}, timestamp: ${timestamp}, isActive: ${isActive}`);
        res.status(200).send('Data received and stored.');
    } catch (error) {
        console.error('Error storing data:', error);
        res.status(500).send('Server error.');
    }
});

// Endpoint to view stored data (optional, for debugging)
app.get('/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send('Server error.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
