const fileHandler = require("./fileHandler")

const CREATE_USERS = "users.create";
const CHANGE_USERS = "users.change";
const DELETE_USERS = "users.delete";
const CREATE_WORKSPACES = "workspaces.create";
const EDIT_WORKSPACES = "workspaces.edit";

const { 
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');

function getUUID() {
    let uuid = uuidv4();
    return uuid;
}

async function addSession(user, os, ip) {
    let newJson = await fileHandler.readJson("data/users.json");
    let uuid = getUUID();
    console.log(uuid);

    console.log(newJson[user]["sessions"]);
    let sessionObj = {"UUID": uuid, "OS": os, "IP": ip};
    newJson[user]["sessions"].push(sessionObj);
    
    if((await fileHandler.writeJson("data/users.json", newJson)) === true) {
        return uuid;
    } 
    return;
} 

async function getRole(roleID) {
    let roles = await fileHandler.readJson("data/roles.json");
    return roles[roleID];
}

module.exports = { addSession, getRole, getUUID, CREATE_USERS, CHANGE_USERS,
    DELETE_USERS, CREATE_WORKSPACES, EDIT_WORKSPACES };