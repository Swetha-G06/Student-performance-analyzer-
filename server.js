const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Smart Database Connection
const connection = mysql.createConnection(process.env.DATABASE_URL || {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_db'
});

connection.connect(err => {
    if (err) {
        console.error('❌ Database Connection Failed: ' + err.stack);
        return;
    }
    console.log('✅ Connected to Database');

    // AUTOMATIC TABLE CREATION - No need for Aiven Dashboard!
    const createTable = `
    CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        mark1 INT, mark2 INT, mark3 INT,
        total INT, average FLOAT, grade VARCHAR(10)
    )`;
    connection.query(createTable, (err) => {
        if (err) console.log("Table exists or error:", err.message);
        else console.log("✅ Database Table Ready!");
    });
});

// Serve your HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'student-analyzer.html'));
});

// Handle Data Saving
app.post('/result', (req, res) => {
    const { name, mark1, mark2, mark3 } = req.body;
    const total = mark1 + mark2 + mark3;
    const average = (total / 3).toFixed(2);
    let grade = (average >= 50) ? "Pass" : "Fail";

    const sql = "INSERT INTO students (name, mark1, mark2, mark3, total, average, grade) VALUES (?, ?, ?, ?, ?, ?, ?)";
    connection.query(sql, [name, mark1, mark2, mark3, total, average, grade], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: "Database Error" });
        } else {
            res.send({ message: "Success", total, average, grade });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
