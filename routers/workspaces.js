const express = require('express')

const router = express.Router()
const util = require("../util/variables");
const auth = require("../util/auth");
const fileHandler = require("../util/fileHandler")
const loaders = require("../util/loaders")

router.get("/", async (req, res) => {
    let authCookie = req.cookies.UUID;

    if(util.isEmptyOrUndefined(authCookie)) {
        return res.render("login", {});
    }

    let usersConfig = await fileHandler.readJson("data/users.json");

    for(var key in usersConfig) {
        let sessions = usersConfig[key]["sessions"];
        
        for(let i = 0; i < sessions.length; i++) {
            if(authCookie === sessions[i]["UUID"]) {
                let orgs = await fileHandler.readJson("data/orgs.json");

                let workspacesIDS = orgs[usersConfig[key]["org"]]["workspaces"].split(";");
                let workspacesInfo = await loaders.workspacesInfo(workspacesIDS);

                let rolesIDS = usersConfig[key]["roles"].split(";");
                let perms = await loaders.roles(rolesIDS);

                return res.render("workspaces/workspacesPage", {pfp: usersConfig[key]["pfp"], 
                    fname: usersConfig[key]["fname"], lname: usersConfig[key]["lname"],
                    workspaces: workspacesInfo, perms: perms
                });
            }
        }
    }    
    res.render("login");
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

    if(perms.includes("workspaces.create")) {
        res.render("workspaces\\create", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms});
    } else {
        res.render("workspaces\\workspacesPage", {pfp: usersConfig[userKey]["pfp"], 
        fname: usersConfig[userKey]["fname"], lname: usersConfig[userKey]["lname"],
        workspaces: workspacesInfo, perms: perms, error: 101});
    }
});

module.exports = router