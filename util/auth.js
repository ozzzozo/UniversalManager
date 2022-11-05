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

module.exports = { login }