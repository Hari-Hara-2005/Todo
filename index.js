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

app.delete("/:id",async(res,req)=>{
    const{id}=req.params;
    try {
        await pool.query("DELETE FROM records WHERE todo_id=$1",[id]);
        res.json("Deleted Successfully..!");
    } catch (error) {
        console.error(error.mesage);
    }
})


PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT;
app.listen(PORT, () => {
    console.log(`The server Runing in port ${PORT}`)
});