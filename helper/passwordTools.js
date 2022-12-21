const bcrypt = require("bcrypt")


const passwordTools = {
    generatePasswordHash: generatePasswordHash,
    comparePasswordHash: comparePasswordHash
}

function generatePasswordHash(password) {
    return bcrypt.hashSync(password, 10);
}

function comparePasswordHash(password, hash) {
    return bcrypt.compareSync(password, hash);
}

module.exports = passwordTools;