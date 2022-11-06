const fileHandler = require("./fileHandler")
const permission = require("./permission")

async function login(user, pass) {
    users = await fileHandler.readJson("data/users.json")

    if(user in users) {
        if(users[user]["password"] === pass) {
            return true;
        }
        return false;
    } else {
        return false;
    }
}

async function getKey(authCookie, usersConfig) {
    for(var key in usersConfig) {
        let sessions = usersConfig[key]["sessions"];
        
        for(let i = 0; i < sessions.length; i++) {
            if(authCookie === sessions[i]["UUID"]) {
                return key;
            }
        }
    }    

    return undefined;
}

module.exports = { login, getKey }