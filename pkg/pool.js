const config = require('../config/index');
let pool = new Map();
const projectStorage = require("../storage/mongo/project")
const client = require("../services/grpc/client")
const newMongoDBConn = require('../config/mongoConn')

const ErrProjectNotExists = new Error("db conn with given projectId does not exist")
const ErrProjectExists = new Error("db conn with given projectId already exists")

async function get(projectId) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    if (!pool.has(projectId)) {
        throw ErrProjectNotExists
    }

    conn = pool.get(projectId)

    return conn
}

async function add(projectId, dbConn) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    if (pool.has(projectId)) {
        throw ErrProjectExists
    }

    pool.set(projectId, dbConn)
}

async function remove(projectId) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    pool.delete(projectId)
}

async function override(projectId, dbConn) {
    if (!projectId) {
        console.warn('WARNING:: Using default project id in pool...')
    }

    if (pool.has(projectId)) {
        console.warn('WARNING:: Overriding project in pool... ->', projectId)
    }

    pool.set(projectId, dbConn)
}

module.exports = { get, add, remove, override }
