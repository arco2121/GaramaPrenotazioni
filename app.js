const express = require("express")
const mysql = require("mysql2")
const ejs = require("ejs")

const host = "127.0.0.1"
const port = process.env.port || 3200
const app = express()
const data = mysql.createConnection({
    host : host,
    user : "root",
    password : "",
    database : "utenti_pren"
})

data.connect((erha) => {
    erha != null?console.log("Shaw!!!"):console.log("Creato")
})

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended : true}))
app.use(express.json())

app.get("/", (req, res) => {
    data.query("SELECT * FROM mete", (dats,lio) => {
        if(dats) throw dats
        console.log(lio)
        res.render("index",{luoghi : lio})
    })
})

app.listen(port, host, () => {
    console.log(`Server attivo su http://${host}:${port}`)
})