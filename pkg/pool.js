const config = require('../config/index');
let pool = {};

// const interval = setInterval(() => {
    // for (projectID of pool.keys()) {
    //     console.log()
    //     console.log("Pool Project IDs", projectID)
    //     console.log()
    // }

// }, 15000);


const ErrProjectNotExists = new Error("db conn with given projectId does not exist")
const ErrProjectExists = new Error("db conn with given projectId already exists")

async function get(projectId) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    // if (!pool.has(projectId)) {
    //     throw ErrProjectNotExists
    // }

    // conn = pool.get(projectId)
    conn = pool[projectId]
    console.log('POOL GET METHOD PROJECTID', projectId)
    console.log('POOL GET METHOD CONNECTION', conn)
    return conn
}

async function add(projectId, dbConn) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    // if (pool.has(projectId)) {
    //     throw ErrProjectExists
    // }

    // pool.set(projectId, dbConn)
    pool[projectId] = dbConn
}

async function remove(projectId) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    // pool.delete(projectId)

    delete pool[projectId]
}

async function override(projectId, dbConn) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    // if (pool.has(projectId)) {
    //     console.warn('WARNING:: Overriding project in pool...', projectId)
    // }

    pool[projectId] = dbConn
}

module.exports = {get, add, remove, override}
