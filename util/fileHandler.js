const { readFileSync, writeFileSync, readdirSync } = require('fs');

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

async function countFiles(path) {
    readdirSync(path, (err, files) => {
        return files.length;
    });
    return 0;
}

async function readFolder(path) {
    return await readdirSync(path);
}

module.exports = { readJson, writeJson, countFiles, readFolder }