const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Middleware
app.use(cors());
app.use(express.json());

// Get the Data
app.get("/", async (req, res) => {
    try {
        const response = await pool.query("SELECT * FROM records");
        res.json(response.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Insert the Data
app.post("/", async (req, res) => {
    const { desc } = req.body;
    try {
        const response = await pool.query("INSERT INTO records (todo_desc, status) VALUES ($1, 'pending') RETURNING *", [desc]);
        res.json(response.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to insert record" });
    }
});

// Update the Data (including the status)
app.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { desc, status } = req.body;  // Now status is passed from the frontend
    try {
        const response = await pool.query(
            "UPDATE records SET todo_desc = $1, status = $2 WHERE todo_id = $3 RETURNING *",
            [desc, status, id]
        );
        res.json({ message: "Updated Successfully!", data: response.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to update record" });
    }
});

// Delete the Data
app.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM records WHERE todo_id=$1", [id]);
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
        res.json({ message: "Login Successfully!" });
        const token = jwt.sign({ userId: response.rows[0].user_id }, process.env.JWT_SCERET, { expiresIn: '1hr' });
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
