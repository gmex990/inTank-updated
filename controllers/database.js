const mysql = require('mysql2');

// Database connection
const connection = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_athery',
    password: '&7Xk$K%286%Z9kZ',
    database: 'freedb_intank',
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});




// Export the functionality
module.exports = { connection };
