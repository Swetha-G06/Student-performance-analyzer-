const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const path = require('path');

// This line tells the server to look for your HTML file in the current folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'student-analyzer.html'));
});

const dbUrl = process.env.DATABASE_URL || {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_db'
};

const connection = mysql.createConnection(dbUrl);

db.connect(err => {
    if (err) {
        console.error('❌ MySQL Connection Failed: ' + err.stack);
        return;
    }
    console.log('✅ Connected to MySQL Database!');
});

// 2. Handle the Data
app.post('/result', (req, res) => {
    console.log("Received data for:",req.body.name);

    const { name, mark1, mark2, mark3 } = req.body;
    
    const total = mark1 + mark2 + mark3;
    const average = (total / 3).toFixed(2);
    let grade = (average >= 50) ? "Pass" : "Fail";

    // 3. SQL Query to save data
    const sql = "INSERT INTO students (name, mark1, mark2, mark3, total, average, grade) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [name, mark1, mark2, mark3, total, average, grade], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: "Database Error" });
        } else {
            res.json({
                student: name,
                total: total,
                average: average,
                grade: grade,
                message: "Saved to SQL Database Successfully!"
            });
        }
    });
});

const PORT = process.env.PORT || 3000; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});