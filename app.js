const express = require("express")
const mysql = require("mysql2")
const ejs = require("ejs")

const host = "127.0.0.1"
const port = process.env.port || 3200
const usern = "root"
const passw = ""
const database = "garama_prenotazioni"

const sessions = {}
const SessionId = () => {
    let h 
    do
    {
        h = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15)
    }while(sessions[h] != null)
    return h
}
const auth = (req, res, next) => {
    const cookie = req.headers.cookie;
    if (!cookie)
    {
        res.locals.logged = null
    }
    else
    {
        const sessionId = cookie.split('=')[1];
        if (sessions[sessionId]) 
        {
            res.locals.logged = sessions[sessionId];
        }
        else 
        {
            res.locals.logged = null;
        }
    }
    next();
}

const app = express()
app.locals.baseUrl = "http://" + host + ":" + port + "/"
const data = mysql.createConnection({
    host : host,
    user : usern,
    password : passw,
    database : database
})
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended : true}))
app.use(express.json())

data.connect((erha) => {
    erha != null?console.log("Shaw!!!"):console.log("GIT GUD!!")
})

app.get("/", auth, (req, res) => {
    try
    {
        data.query("SELECT * FROM mete", (dats,lio) => {
            if(dats) throw dats
            res.render("index",{luoghi : lio})
        })
    }
    catch
    {
        res.render("error",{error : "Errore con il database"})
    }
})

app.post("/loginer",(res,req)=>{
    try
    {
        const usern = res.body.username
        const pass = res.body.password
        data.query("SELECT * from utenti where password = PASSWORD(?) and username = ?",[pass,usern],(dat,lio) => {
            if(lio.length != 0)
            {
                const sesid = SessionId()
                sessions[sesid] = usern
                req.setHeader("Set-Cookie","sessionId=" + sesid,"HttpOnly")
                req.redirect("/")
            }
            else
            {
                req.locals.error = "Username o password errati"
                req.redirect("/login?error=404")
            }
        })
    }    
    catch
    {
        res.render("error",{error : "Errore con il database"})
    }
})
app.post("/register",(res,req)=>{
    try
    {
        const usern = res.body.username
        const pass = res.body.password
        const nome = res.body.nome
        const cogn = res.body.cogn
        if(usern==""||pass == ""||nome==""||cogn=="")
        {
            req.redirect("/regist")
        }
        data.query("SELECT * from utenti WHERE username = ?",[usern],(err,sd) => {
            if(err) throw err
            if(sd.length == 0)
            {
                data.query("INSERT INTO utenti (username, password, nome, cognome) VALUES (?,PASSWORD(?),?,?)",[usern,pass,nome,cogn],(dat,lio) => {
                    if(dat) throw dat
                    req.redirect("/login")
                })
            }
            else
            {
                req.redirect("/regist")
            }
        })
    }    
    catch
    {
        res.render("error",{error : "Errore con il database"})
    }
})
app.get("/login",auth,(req,res)=>{
    if(!res.locals.logged)
    {
        let m
        if(req.query.error == 404)
            m = "Username o password errati"
        else
            m = null
        res.render("login",{error : m})
        return
    }
    res.redirect("/")
})
app.get("/regist",auth,(req,res)=>{
    if(!res.locals.logged)
    {
        res.render("register")
        return
    }
    res.redirect("/")
})

app.get("/meta/:id",auth,(req,res)=>{
    try
    {
        const id = parseInt(req.params.id)
        data.query("SELECT * FROM mete where id='" + id + "'", (dats,lio) => {
            if(dats) throw dats 
            data.query("SELECT * from prenotazioni where id_meta = ?",[id],(err,resu) => {
                if(err) throw err
                let tot = 0
                resu.forEach(pren => {
                    tot += pren.num_persone
                })
                res.render("meta",{luogo:lio[0],disponibili: lio[0].posti_totali-tot})
            })
        })
    }
    catch
    {
        res.render("error",{error : "Errore con il database"})
    }
})

app.get("/prenotaposto/:id",auth,(req,res)=>{
    try
    {
        if(!res.locals.logged)
        {
            res.redirect("/")
            return
        }
        const id = req.params.id
        data.query("SELECT * FROM mete where id='" + id + "'", (dats,lio) => {
            if(dats) throw dats 
            res.render("prenotaposto",{luogo:lio[0]})
        })
    }
    catch
    {
        res.render("error",{error : "Errore con il database"})
    }
})
app.post("/prenotaposto",auth,(req,res) => {
    try
    {
        if(!res.locals.logged)
            return
        const id = parseInt(req.body.luogo)
        const num = parseInt(req.body.numero)
        const date = req.body.data
        const dataRicevuta = new Date(date);
        const oggi = new Date();
        oggi.setHours(0,0,0,0)
        if(num<=0||dataRicevuta<oggi)
        {
            res.redirect("/prenotaposto/" + id)
            return
        }
        data.query("SELECT * from utenti where username = ?",[res.locals.logged],(err,resu) => {
            if(err) throw err
            data.query("SELECT * from mete WHERE id = ?",[id],(io,hj) => {
                if(io) throw io
                 data.query("SELECT * from prenotazioni where id_meta = ?",[id],(err,resua) => {
                    if(err) throw err
                    let tot = 0
                    resua.forEach(pren => {
                        tot += pren.num_persone
                    })
                    if(num>(hj[0].posti_totali-tot))
                    {
                        res.redirect("/prenotaposto/" + id)
                        return
                    }
                    else
                    {
                        data.query("INSERT INTO prenotazioni (id_utente,id_meta,data_prenotazione,num_persone) VALUES (?,?,?,?)",[resu[0].id,id,date,num],(dats,lio) => {
                            if(dats) throw dats 
                            res.redirect("/meta/" + id)
                        })
                    }
                })
            })
        })
    }
    catch
    {
        res.render("error",{error : "Errore con il database"})
    }
})

app.get("/dash",auth,(req,res) => {
    try
    {
        if(!res.locals.logged)
        {
            res.redirect("/")
            return
        }
        data.query("SELECT * from utenti where username = ?",[res.locals.logged],(err,resu) => {
            if(err) throw err
            const query = "SELECT prenotazioni.data_prenotazione AS data, prenotazioni.num_persone AS persone, prenotazioni.id AS id, mete.nome AS nome, mete.foto_url AS foto FROM prenotazioni JOIN utenti ON prenotazioni.id_utente = utenti.id JOIN mete ON mete.id = prenotazioni.id_meta WHERE utenti.id = ?"
            data.query(query,[resu[0].id],(dats,lio) => {
                if(dats) throw dats 
                res.render("dash",{prenotazioni : lio, utente : resu[0]})
            })
        })
    }
    catch
    {
        res.render("error",{error : "Errore con il database"})
    }
})

app.post("/delete_pren",auth,(req,res) => {
    try
    {
        if(!res.locals.logged)
        {
            res.redirect("/")
            return
        }
        data.query("SELECT id AS id FROM utenti WHERE username = ?",[res.locals.logged],(et,resu) => {
            if(et) throw et
            data.query("DELETE FROM prenotazioni where id_utente = ? AND id = ?",[resu[0].id,parseInt(req.body.id_pren)],(err,resu) => {
                if(err) throw err
                res.redirect("/dash")
            })
        })
    }
    catch
    {
        res.render("error",{error : "Errore con il database"})
    }
})
app.post("/delete_acc",auth,(req,res) => {
    try
    {
        if(!res.locals.logged)
        {
            res.redirect("/")
            return
        }
        data.query("DELETE FROM utenti where username = ?",[res.locals.logged],(err,resu) => {
            if(err) throw err
            res.redirect("/logout")
        })
    }
    catch
    {
        res.render("error",{error : "Errore con il database"})
    }
})

app.get("/logout",auth,(req,res) => {
    if(!res.locals.logged)
    {
        res.redirect("/")
        return
    }
    const sessionId = req.headers.cookie.split('=')[1]
    delete sessions[sessionId]
    res.setHeader('Set-Cookie', 'sessionId=')
    res.redirect("/")
})

app.use((req,res) => {
    res.redirect("/")
})

app.listen(port, host, () => {
    console.log(`Server : http://${host}:${port}`)
})