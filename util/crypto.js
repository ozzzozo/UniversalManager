const crypto = require('crypto');

function hashFile(buffer) {
    let hashsum = crypto.createHash("sha256");
    hashsum.update(buffer);

    return hashsum.digest("hex");
}

module.exports = { hashFile };