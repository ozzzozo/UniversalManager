const express = require('express');
const multer = require('multer');
const fs = require("fs");

var identifyBuffer = require('buffer-signature').identify;


const router = express.Router();
const util = require("../util/variables");
const auth = require("../util/auth");
const fileHandler = require("../util/fileHandler");
const crypto = require("../util/crypto");
const permission = require("../util/permission");
const loaders = require("../util/loaders");

router.get("/", async (req, res) => {
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

    return res.render("workspaces/workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms
    });
});

router.get("/create", async (req, res) => {
    let authCookie = req.cookies.UUID;
    if(util.isEmptyOrUndefined(authCookie)) {
        return res.render("login", {});
    }

    let usersConfig = await fileHandler.readJson("data/users.json");
    let userKey = await auth.getKey(authCookie, usersConfig);
    if(util.isEmptyOrUndefined(userKey)) {
        return res.render("login", {});
    }

    let rolesIDS = usersConfig[userKey]["roles"].split(";");
    let perms = await loaders.roles(rolesIDS);

    let orgs = await fileHandler.readJson("data/orgs.json");

    let workspacesIDS = orgs[usersConfig[userKey]["org"]]["workspaces"].split(";");
    let workspacesInfo = await loaders.workspacesInfo(workspacesIDS);

    if(perms.includes(permission.CREATE_WORKSPACES)) {
        res.render("workspaces\\create", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms});
    } else {
        res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 101});
    }
});

router.post("/create", multer().single('image'), async (req, res) => {
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

    if(!perms.includes(permission.CREATE_WORKSPACES)) {
        res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 251});
    }

    try {
        let imageFile = req.file;
        let size = util.returnSize(imageFile.buffer.length).split(" ");
        let type = identifyBuffer(imageFile.buffer);

        if(!util.imageTypes.includes(type.mimeType)) {
            res.render("workspaces\\create",  {pfp: usersConfig[userKey]["pfp"], 
            fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
            workspaces: workspacesInfo, perms: perms, error: 253});
        }

        if(size[1] === "MB" && parseFloat(size[0]) > 2.0) {
            res.render("workspaces\\create",  {pfp: usersConfig[userKey]["pfp"], 
            fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
            workspaces: workspacesInfo, perms: perms, error: 252});
        }

        let name = util.sanatize(req.body.name);
        let desc = util.sanatize(req.body.description);
        type = type.extensions[0];
        let filename = crypto.hashFile(imageFile.buffer);

        fs.writeFileSync('./assets/images/workspaces/logos/' + filename + "." + type, imageFile.buffer);
        
        let workspaceUUID = permission.getUUID();

        let workspaceObject = {
            "banner": filename + "." + type,
            "name": name,
            "description": desc
        };

        let baseDir = "./data/workspaces/" + workspaceUUID + "/";

        if (!fs.existsSync(baseDir)){
            fs.mkdirSync(baseDir);
        }

        if (!fs.existsSync(baseDir + "reports")){
            fs.mkdirSync(baseDir + "reports");
        }

        fileHandler.writeJson(baseDir + "workspace.json", workspaceObject);
        fileHandler.writeJson(baseDir + "reports.json", {});

        orgs[usersConfig[userKey]["org"]]["workspaces"] = orgs[usersConfig[userKey]["org"]]["workspaces"] + workspaceUUID + ";";

        fileHandler.writeJson("./data/orgs.json", orgs);

        res.redirect("/workspaces/");
    } catch (err) {
        console.log("error?");
        console.log(err);
        res.render("itworks", {error: 254});
    } 
});

router.get("/:workspaceID", async (req, res) => {
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

    let workspaceID = req.params.workspaceID;

    if(workspacesIDS.includes(workspaceID)) {
        workspacesInfo.forEach(element => {
            if(element["workspace"]["ID"] === workspaceID) {
                workspace = element["workspace"];
            }
        });

        let reports = await loaders.reports(workspaceID);

        res.render("workspaces\\workspace", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspace: workspace, perms: perms, error: 255, reports: reports});
    } else {
        res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 255});
    }
});

router.get("/:workspaceID/create", async(req, res) => {
    
}); 

module.exports = router