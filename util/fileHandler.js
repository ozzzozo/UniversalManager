const { readFileSync, writeFileSync } = require('fs');

//todo: error handling
async function readJson(path) {
    let data = readFileSync(path);

    return JSON.parse(data);
}

async function writeJson(path, data) {
    try {
        writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = { readJson, writeJson }