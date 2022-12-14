const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
const port = 3000;

const util = require("./util/variables");
const fileHandler = require("./util/fileHandler");
const loaders = require("./util/loaders");
const auth = require("./util/auth");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));
app.use('/assets', express.static("assets"));
app.use(bodyParser.urlencoded({ extended: true , limit: '20mb'}));
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
    let userKey = await auth.getKey(authCookie, usersConfig);
    if(util.isEmptyOrUndefined(userKey)) {
        return res.render("login", {});
    }

    let orgs = await fileHandler.readJson("data/orgs.json");

    let workspacesIDS = orgs[usersConfig[userKey]["org"]]["workspaces"].split(";");
    let workspacesInfo = await loaders.workspacesInfo(workspacesIDS);

    let rolesIDS = usersConfig[userKey]["roles"].split(";");
    let perms = await loaders.roles(rolesIDS);

    return res.render("dashboard", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms
    });
});

app.listen(port, () => {
    console.log(`[+] Server Running at Port ${port}`)
});