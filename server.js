const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
const port = 3000

const util = require("./util/variables");
const fileHandler = require("./util/fileHandler")
const loaders = require("./util/loaders")

const app = express();
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, 'views'));
app.use('/assets', express.static("assets"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const usersHandler = require("./routers/users")
const workspacesHandler = require("./routers/workspaces")

app.use("/api", usersHandler);
app.use("/workspaces", workspacesHandler);

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
                let workspacesInfo = await loaders.workspacesInfo(workspacesIDS);

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