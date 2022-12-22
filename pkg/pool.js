const config = require('../config/index');
let pool = new Map();
const client = require('../services/project')

const interval = setInterval(() => {
    for (projectID of pool.keys()) {
        console.log()
        console.log("Pool Project IDs", projectID)
        console.log()
    }

}, 15000);


const ErrProjectNotExists = new Error("db conn with given projectId does not exist")
const ErrProjectExists = new Error("db conn with given projectId already exists")

async function get(projectId=config.ucodeDefaultProjectID) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    if (!pool.has(projectId)) {
        throw ErrProjectNotExists
    }

    return pool.get(projectId)
}

async function add(projectId=config.ucodeDefaultProjectID, dbConn) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    if (pool.has(projectId)) {
        throw ErrProjectExists
    }

    pool.set(projectId, dbConn)
}

async function remove(projectId=config.ucodeDefaultProjectID) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    pool.delete(projectId)
}

async function override(projectId=config.ucodeDefaultProjectID, dbConn) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    if (pool.has(projectId)) {
        console.warn('WARNING:: Overriding project in pool...', projectId)
    }

    pool.set(projectId, dbConn)
}

module.exports = {get, add, remove, override}

