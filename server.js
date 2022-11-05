const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
const port = 3000

const crypto = require('crypto');
const util = require("./util/variables");
const fileHandler = require("./util/fileHandler")
const permission = require("./util/permission")

const auth = require("./util/auth")

const app = express();
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, 'views'));
app.use('/assets', express.static("assets"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/api/users/auth", async (req, res) => {
    
    if(req.body === undefined) {
        res.send(400);
    }
    
    let username = req.body.username;
    let password = req.body.password;

    if(util.isEmptyOrUndefined(username) || util.isEmptyOrUndefined(password)) {
        res.json({"error": "field error"});
    }

    password = crypto.createHash('sha256').update(password).digest('base64');

    if((await auth.login(username, password)) === true) {
        let os = req.headers['user-agent']; //.match(/(?<=\().*?(?=;)/)[0]; // possible xss if displayed?
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
});

app.get("/", async (req, res) => {
    let authCookie = req.cookies.UUID;

    if(util.isEmptyOrUndefined(authCookie)) {
        return res.render("login", {});
    }

    let usersConfig = await fileHandler.readJson("data/users.json");

    for(var key in usersConfig) {
        let sessions = usersConfig[key]["sessions"];
        
        for(let i = 0; i < sessions.length; i++) {
            if(authCookie === sessions[i]["UUID"]) {
                let workspacesIDS = usersConfig[key]["workspaces"].split(";");
                let workspacesInfo = [];

                for(let i = 0; i < workspacesIDS.length; i++) {

                    if(util.isEmptyOrUndefined(workspacesIDS[i])) {
                        continue;
                    }

                    let path =  `data/workspaces/${workspacesIDS[i]}/`;
                    let workspace = await fileHandler.readJson(path + "workspace.json");

                    workspace["ID"] = workspacesIDS[i];
                    workspace["ReportsCount"] = workspace["reports"].split(";").length - 1;

                    workspacesInfo.push({workspace: workspace});
                }

                console.log(workspacesInfo);

                return res.render("dashboard", {pfp: usersConfig[key]["pfp"], 
                fname: usersConfig[key]["fname"], lname: usersConfig[key]["lname"],
                workspaces: workspacesInfo
                });
            }
        }
    }    
    res.render("login");
});

app.listen(port, () => {
    console.log(`[+] Server Running at Port ${port}`)
});