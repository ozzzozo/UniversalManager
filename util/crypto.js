const crypto = require('crypto');

function hashFile(buffer) {
    let hashsum = crypto.createHash("sha256");
    hashsum.update(buffer);

    return hashsum.digest("hex");
}

function hashString(string) {
    let hash = crypto.createHash('sha256').update(string).digest('hex');
    return hash;
}

module.exports = { hashFile, hashString };