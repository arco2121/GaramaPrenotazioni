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
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended : true}))
app.use(express.json())


data.connect((erha) => {
    erha != null?console.log("Shaw!!!"):console.log("GIT GUD!!")
})

app.get("/", (req, res) => {
    try
    {
        data.query("SELECT * FROM mete", (dats,lio) => {
            if(dats) throw dats
            res.render("index",{logged : null,luoghi : lio})
        })
    }
    catch
    {
        res.render("error",{error : "Errore di connessione al database"})
    }
})

app.post("/loginer",(res,req)=>{
    const usern = res.body.username
    const pass = res.body.password
    data.query("SELECT * from utenti where pasword = PASSWORD(?) and username = ?",[pass,usern],(dat,lio) => {
        {
            const sesid = createSession()
            sessions[sesid] = usern
            req.setHeader("Set-Cookie","sessionId=" + sesid,"HttpOnly")
        }
    })
})

app.get("/meta/:id",(req,res)=>{
    const id = parseInt(req.params.id)
    data.query("SELECT * FROM mete where id='" + id + "'", (dats,lio) => {
        if(dats) throw dats 
        res.render("meta",{logged : null,luogo:lio[0],disponibili: 300})
    })
})

app.listen(port, host, () => {
    console.log(`Server attivo su http://${host}:${port}`)
})