const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors({
    origin: 'https://todo-application-beryl.vercel.app/'
}));
app.options('*', cors());
app.use(express.json());

// Middleware to verify JWT token and get user ID
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(403).json({ error: "Access denied, no token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Get Data
app.get("/", authenticateToken, async (req, res) => {
    try {
        const response = await pool.query(
            "SELECT * FROM records WHERE user_id = $1",
            [req.userId]
        );
        res.json(response.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Insert the Data
app.post("/", authenticateToken, async (req, res) => {
    const { desc } = req.body;
    try {
        const response = await pool.query(
            "INSERT INTO records (todo_desc, status, user_id) VALUES ($1, 'pending', $2) RETURNING *",
            [desc, req.userId]
        );
        res.json(response.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to insert record" });
    }
});

// Delete the Data
app.delete("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const response = await pool.query(
            "DELETE FROM records WHERE todo_id = $1 AND user_id = $2 RETURNING *",
            [id, req.userId]
        );
        if (response.rows.length === 0) {
            return res.status(404).json({ error: "Record not found or you're not authorized" });
        }
        res.json({ message: "Deleted Successfully!" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to delete record" });
    }
});

// Register Users
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        const response = await pool.query(
            "INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashPassword]
        );
        res.json(response.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to register user" });
    }
});

// Login Users
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const response = await pool.query("SELECT * FROM users WHERE user_email=$1", [email]);
        if (response.rows.length === 0) {
            return res.status(400).json({ error: "The Email does not exist" });
        }
        const validPassword = await bcrypt.compare(password, response.rows[0].user_password);
        if (!validPassword) {
            return res.status(400).json({ error: "Password Invalid" });
        }
        const token = jwt.sign({ userId: response.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1hr' });
        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to login" });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});
