const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
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
            "UPDATE your_table_name SET desc = $1 WHERE id = $2 RETURNING *",
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
})


PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`The server Runing in port ${PORT}`)
});