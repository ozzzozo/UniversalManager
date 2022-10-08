const fileHandler = require("./fileHandler")

const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');

function newLogin() {
    let uuid = uuidv4();
    return uuid;
}

async function addSession(user, os, ip) {
    let newJson = await fileHandler.readJson("data/users.json");
    let uuid = newLogin();
    console.log(uuid);

    console.log(newJson[user]["sessions"]);
    let sessionObj = {"UUID": uuid, "OS": os, "IP": ip};
    newJson[user]["sessions"].push(sessionObj);
    
    if((await fileHandler.writeJson("data/users.json", newJson)) === true) {
        return uuid;
    } 
    return;
} 

module.exports = { addSession };