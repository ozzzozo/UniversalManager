/*
    all of the Functions that load data into variables
*/


const fileHandler = require("../util/fileHandler")
const util = require("../util/variables");

async function workspacesInfo(workspacesIDS) {
    let workspacesInfo = [];

    for(let i = 0; i < workspacesIDS.length; i++) {

        if(util.isEmptyOrUndefined(workspacesIDS[i])) {
            continue;
        }

        let path =  `data/workspaces/${workspacesIDS[i]}/`;
        let workspace = await fileHandler.readJson(path + "workspace.json");

        workspace["ID"] = workspacesIDS[i];
        workspace["ReportsCount"] = fileHandler.countFiles(path + "reports");

        workspacesInfo.push({workspace: workspace});
    }

    return workspacesInfo;
}

async function roles(rolesIDS) {
    let roles = await fileHandler.readJson(`data/roles.json`); 
    let perms = [];

    for(let i = 0; i < rolesIDS.length; i++) {
        if(util.isEmptyOrUndefined(rolesIDS[i])) {
            continue;
        }

        let rolePerms = roles[rolesIDS[i]];
        perms = perms.concat(rolePerms["perms"]);
    }

    return perms;
}

async function reports(workspaceID) {
    let path =  `data/workspaces/${workspaceID}/reports/`;
    let filenames = await fileHandler.readFolder(path);
    let reports = [];

    filenames.forEach(filename => {
        fileHandler.readJson(path + filename).then((json) => {
            reports.push(json)
        })
    });

    return reports;
}

module.exports = { workspacesInfo, roles, reports }