const express = require('express');
const multer = require('multer');
const fs = require("fs");
var querystring = require("querystring");

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
        workspace: workspace, perms: perms, reports: reports});
    } else {
        res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 255});
    }
});

router.get("/:workspaceID/create", async(req, res) => {
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

    if(!perms.includes(permission.CREATE_REPORTS)) {
        return res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 256});
    }

    if(workspacesIDS.includes(workspaceID)) {
        res.render("workspaces\\createReport", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms});
    } else {
        res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 255});
    }
}); 

router.post("/:workspaceID/create", async(req, res) => {
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

    if(!perms.includes(permission.CREATE_REPORTS)) {
        return res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 256});
    }

    if(workspacesIDS.includes(workspaceID)) {
        let name = util.sanatize(req.body.name);
        let client = util.sanatize(req.body.client);

        let uuid = permission.getUUID();
        let baseDir = "./data/workspaces/" + workspaceID + "/reports/";

        if (!fs.existsSync(baseDir)){
            fs.mkdirSync(baseDir);
        }

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();

        today = dd + '/' + mm + '/' + yyyy;

        jobject = {
            "name": name,
            "client": client,
            "createdAt": today,
            "findings": 0,
            "status": "active",
            "MD": ""
        }

        fileHandler.writeJson(`${baseDir}/${uuid}.json`, jobject);

        res.redirect(`/workspaces/${workspaceID}/`);
    } else {
        res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 255});
    }
}); 

router.get("/:workspaceID/:reportID", async(req, res) => {
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
        let reportID = util.sanatize(req.params.reportID);

        let filePath = "./data/workspaces/" + workspaceID + "/reports/" + reportID + ".json";
        fileHandler.readJson(filePath).then((report) => {
            res.render("reports\\report", {pfp: usersConfig[userKey]["pfp"], 
            fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
            workspaces: workspacesInfo, perms: perms, reportMD: report["MD"]});
        });
    } else {
        res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 255});
    }
});

router.post("/:workspaceID/:reportID/save", async(req, res) => { 
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

    let workspaceID = req.params.workspaceID;

    if(workspacesIDS.includes(workspaceID)) {
        let reportID = util.sanatize(req.params.reportID);
        let md = util.sanatize(req.body.reportContent);

        let filePath = "./data/workspaces/" + workspaceID + "/reports/" + reportID + ".json";

        fileHandler.readJson(filePath).then((report) => {
            report["MD"] = md;
            fileHandler.writeJson(filePath, report);
            res.json({"code": "ok"})
        });
    } else {
        res.json({"error": "Invalid workspace"});
    }
});

router.post("/:workspaceID/:reportID/saveImage", async(req, res) => { 
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

    let workspaceID = req.params.workspaceID;

    if(workspacesIDS.includes(workspaceID)) {
        let imageData = util.sanatize(req.body.data);
        imageData = querystring.unescape(imageData);

        let filePath = "./assets/images/reports/";

        imageData = imageData.split(",")[1];
        const hash = crypto.hashString(imageData);

        fs.writeFileSync(filePath + hash + ".png", imageData, {encoding: 'base64'});

        res.json({"url": filePath.replace(".", "") + hash + ".png"});
    } else {
        res.json({"error": "Invalid workspace"});
    }
});

module.exports = router