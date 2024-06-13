
const express = require('express');
const mysql = require('mysql');

const cors = require('cors');
const cookieParser=require('cookie-parser');
const session=require('express-session');
const bodyParser=require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors({

    origin:["http://localhost:3000"],
    methods:["POST","GET"],
    credentials:true

}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized: false,
    cookie:{
        secure:false,
        maxAge: 1000 * 60 * 60 * 24
    }

}))



// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'react'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to the MySQL Server.');
});

let loginid=null;


app.post('/signup', (req, res) => {
    const { username, password, income } = req.body;
    const sql = 'INSERT INTO login (username, password, userid) VALUES (?, ?, ?);';

    const user = [username, password, income]; // Create an array of values

    db.query(sql, user, (err, result) => { // Pass the array of values to the query
        if (err) {
            console.error('Failed to insert user:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to insert user due to server error',
                error: err.code
            });
        }
        console.log('User record inserted:', result);
        res.status(201).json({
            success: true,
            message: 'User record successfully inserted',
            data: {
                id: result.insertId,
                username,
                income
            }
        });
    });
});

app.get('/login/get', (req, res) => {
    const { username, password } = req.query;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }
const sql = "SELECT * FROM login WHERE username = ? AND password = ?;";

db.query(sql, [username, password], (err, results) => {
    if (err) {
        console.error('Failed to retrieve login information:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve login information due to server error',
            error: err.code
        });
    }

    if (results.length === 0) {
        // No user found with the provided credentials
        return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }

    // Extract userid from the first row
    const userid = results[0].userid;
    loginid=results[0].userid;
    console.log(userid);

    // User found, send the user data including userid
    res.json({
        success: true,
        message: 'Login successful',
        userid: userid // Send userid to frontend
    });
});

// Route to handle POST request for user insertion
app.post('/users', (req, res) => {
    const { category, description, amount, date } = req.body;
    const sql = 'INSERT INTO expenses (userid, category, description, amount, date) VALUES (?, ?, ?, ?, ?);';
    
    const expense = [loginid, category, description, amount, date]; // Create an array of values

    db.query(sql, expense, (err, result) => { // Pass the array of values to the query
        if (err) {
            console.error('Failed to insert expense:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to insert expense due to server error',
                error: err.code
            });
        }
        console.log('Expense record inserted:', result);
        res.status(201).json({
            success: true,
            message: 'Expense record successfully inserted',
            data: {
                id: result.insertId,
                category,
                description,
                amount,
                date
            }
        });
    });
});



app.get('/test/get', (req, res) => {
    const { username } = req.query; // Use 'username' instead of 'id'
    console.log('Username received in backend:', username);
    console.log("loginnnid",loginid);
    // Handle the request
});
// Route to handle GET request for user retrieval
app.get('/users/get', (req, res) => {
    const { idx } = req.query; // Extract username from query parameters
  console.log(idx);
    const sql = "SELECT * FROM expenses WHERE userid = ?;";
    
    // Correct SQL query with placeholder for username
    db.query(sql, [loginid], (err, results) => { // Pass username as a parameter
        if (err) {
            console.error('Failed to retrieve expenses:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve expenses due to server error',
                error: err.code
            });
        }
        console.log('Expenses retrieved:', results);
        console.log(idx);
        res.json({
            success: true,
            message: 'Expenses retrieved successfully',
            data: results
        });
        console.log("loginnnid",loginid);
    });
});

    
   
        // Extract userid from the first row
      
      
        // User found, send the user data including userid
    
});

app.get('/resdata/get', (req, res) => {
    const { idx } = req.query; // Extract username from query parameters
  console.log(idx);
    const sql = " SELECT  description, SUM(amount) AS total_amount FROM expenses WHERE userid =? GROUP BY description;";
   
    // Correct SQL query with placeholder for username
    db.query(sql, [loginid], (err, results) => { // Pass username as a parameter
        if (err) {
            console.error('Failed to retrieve expenses:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve expenses due to server error',
                error: err.code
            });
        }
        console.log('Expenses retrieved:', results);
        console.log(idx);
        res.json({
            success: true,
            message: 'Expenses retrieved successfully',
            data: results
        });
        console.log("loginnnid",loginid);
    });
});

app.get('/inside/get', (req, res) => {
    const { idx } = req.query; // Extract username from query parameters
  console.log(idx);
    const sql = "SELECT SUM(e.amount) AS total_expenses, COUNT(e.amount) AS expense_count, AVG(e.amount) AS average_expense, (SELECT amount FROM incomes WHERE userid = 'ayush') AS income_amount FROM expenses e WHERE e.userid = ?;";

    // Correct SQL query with placeholder for username
    db.query(sql, [loginid,loginid], (err, results) => { // Pass username as a parameter
        if (err) {
            console.error('Failed to retrieve expenses:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve expenses due to server error',
                error: err.code
            });
        }
        console.log('Expenses retrieved:', results);
        console.log(idx);
        res.json({
            success: true,
            message: 'Expenses retrieved successfully',
            data: results
        });
        console.log("loginnnid",loginid);
    });
});


  


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
