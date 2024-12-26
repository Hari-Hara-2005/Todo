const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
//middleware

app.use(cors());
app.use(express.json());



app.get("/", async (req, res) => {
    try {
        const response = await pool.query("SELECT * FROM records");
        res.json(response.rows);
    } catch (error) {
        console.error(error.mesage);
    }
});

app.post("/",async(req,res)=>{
    const{desc}=req.body;
    try {
        const response = await pool.query("INSERT INTO records (todo_desc) values($1) RETURNING*",[desc]);
        res.json(response.rows[0])
    } catch (error) {
        console.error(error.mesage);
    }
})


PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`The server Runing in port ${PORT}`)
});