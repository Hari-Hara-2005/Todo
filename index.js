const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt')
//middleware

app.use(cors());
app.use(express.json());


//Get The Data;
app.get("/", async (req, res) => {
    try {
        const response = await pool.query("SELECT * FROM records");
        res.json(response.rows);
    } catch (error) {
        console.error(error.mesage);
    }
});


//Insert  The Data;
app.post("/", async (req, res) => {
    const { desc } = req.body;
    try {
        const response = await pool.query("INSERT INTO records (todo_desc) values($1) RETURNING*", [desc]);
        res.json(response.rows[0])
    } catch (error) {
        console.error(error.mesage);
    }
})

//Updated The Data;
app.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { desc } = req.body;
    try {
        await pool.query(
            "UPDATE records SET todo_desc = $1 WHERE todo_id = $2",
            [desc, id]
        );
        res.json("Updated Successfully..!")

    } catch (error) {
        console.error(error.mesage);
    }
})

//Delete The Data; 
app.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM records WHERE todo_id=$1", [id]);
        res.json("Deleted Successfully..!");
    } catch (error) {
        console.error(error.mesage);
    }
});


//Register Users;
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        const response = await pool.query("INSERT INTO users (user_name,user_email,user_password) VALUES($1,$2,$3) RETURNING *", [name, email, hashPassword]);
        res.json(response.rows[0]);
    } catch (error) {
        console.error(error.mesage);
    }
});

//Login Users;
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const response = await pool.query("SELECT * FROM users WHERE user_email=$1", [email]);
        if (response.rows.length === 0)
            return res.json("The Email Not Exist");
        const validPassword = await bcrypt.compare(password, response.rows[0].user_password);
        if (!validPassword)
            return res.json("Password Invalid");
        res.json("Login Successfully..!");
    } catch (error) {
        console.error(error.mesage);
    }
})

PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`The server Runing in port ${PORT}`)
});