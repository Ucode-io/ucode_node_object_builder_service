let pool = new Map()

async function get(projectId) {
    if (!pool.has(projectId)) {
        throw ErrProjectNotExists
    }

    return pool.get(projectId)
}

async function add(projectId, dbConn) {
    if (pool.has(projectId)) {
        throw ErrProjectExists
    }

    pool.set(projectId, dbConn)
}

async function remove(projectId) {
    pool.delete(projectId)
}

const ErrProjectNotExists = new Error("db conn with given projectId does not exist")
const ErrProjectExists = new Error("db conn with given projectId already exists")

module.exports = {get, add, remove}

