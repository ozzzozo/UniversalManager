const express = require('express')

const router = express.Router()
const util = require("../util/variables");
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
                let workspacesIDS = usersConfig[key]["workspaces"].split(";");
                let workspacesInfo = await loaders.workspacesInfo(workspacesIDS);

                console.log(workspacesIDS)

                let rolesIDS = usersConfig[key]["roles"].split(";");
                let perms = await loaders.roles(rolesIDS);

                console.log(perms);
                return res.render("workspaces/workspaces", {pfp: usersConfig[key]["pfp"], 
                    fname: usersConfig[key]["fname"], lname: usersConfig[key]["lname"],
                    workspaces: workspacesInfo, perms: perms
                });
            }
        }
    }    
    res.render("login");
});

module.exports = router