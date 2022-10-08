const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
const port = 3000

const crypto = require('crypto');
const util = require("./util/variables");
const fileHandler = require("./util/fileHandler")
const permission = require("./util/permission")

const app = express();
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, 'views'));
app.use('/assets', express.static("assets"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/api/auth", async (req, res) => {
    
    if(req.body === undefined) {
        res.send(400);
    }
    
    let username = req.body.username;
    let password = req.body.password;

    if(util.isEmptyOrUndefined(username) || util.isEmptyOrUndefined(password)) {
        res.json({"error": "field error"});
    }

    password = crypto.createHash('sha256').update(password).digest('base64');
    users = await fileHandler.readJson("data/users.json")

    if(username in users) {
        if(users[username]["password"] === password) {
            let os = req.headers['user-agent'].match(/(?<=\().*?(?=;)/)[0];
            let uuid = await permission.addSession(username, os, req.socket.remoteAddress);

            if(uuid !== undefined) {
                res.cookie('UUID', uuid);
                res.redirect("/");
            } else {
                res.render("login.ejs", {error: "Something went wrong."})
            }

        } else {
            res.render("login", {error: "Username and Password Combination Unknown!"});
        }
    } else {
        res.render("login", {error: "Username and Password Combination Unknown!"});
    }
});

app.get("/", (req, res) => {
    res.render("login", {});
});

// app.get("/*", (req, res) => {
//     res.render("404", {"error": "not found"});
// });

app.listen(port, () => {
    console.log(`[+] Server Running at Port ${port}`)
});