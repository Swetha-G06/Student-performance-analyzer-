const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // This was likely missing!

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection (Cloud + Local)
const dbUrl = process.env.DATABASE_URL || {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_db'
};

const db = mysql.createConnection(dbUrl);

db.connect(err => {
    if (err) {
        console.error('❌ MySQL Connection Failed: ' + err.stack);
        return;
    }
    console.log('✅ Connected to Database');
});

// 2. SERVE THE HTML FILE (This fixes the "Cannot GET /" error)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'student-analyzer.html'));
});

// 3. Handle the Data Saving
app.post('/result', (req, res) => {
    const { name, mark1, mark2, mark3 } = req.body;
    const total = mark1 + mark2 + mark3;
    const average = (total / 3).toFixed(2);
    let grade = (average >= 50) ? "Pass" : "Fail";

    const sql = "INSERT INTO students (name, mark1, mark2, mark3, total, average, grade) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, mark1, mark2, mark3, total, average, grade], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: "Database Error" });
        } else {
            res.send({ message: "Success", total, average, grade });
        }
    });
});

// 4. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});