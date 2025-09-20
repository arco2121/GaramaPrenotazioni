const express = require("express")
const mysql = require("mysql2")
const ejs = require("ejs")

const host = "127.0.0.1"
const port = process.env.port || 3200
const app = express()
app.locals.baseUrl = "http://" + host + ":" + port + "/"
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
        res.render("index",{logged : false,luoghi : lio})
    })
})

app.post("/loginer",(res,req)=>{
    const usern = res.body.username
    const pass = res.body.password
    data.query("SELECT * from utenti where pasword = PASSWORD(?) and username = ?",[pass,usern],(dat,lio) => {
        {
            const sesid = createSession()
            sessions[sesid] = user
            req.setHeader("Set-Cookie","sessionId=" + sesid,"HttpOnly")
        }
    })
})

app.get("/meta/:id",(req,res)=>{
    const id = parseInt(req.params.id)
    data.query("SELECT * FROM mete where id='" + id + "'", (dats,lio) => {
        if(dats) throw dats 
        res.render("meta",{logged : false,luogo:lio[0],disponibili: 300})
    })
})

app.listen(port, host, () => {
    console.log(`Server attivo su http://${host}:${port}`)
})