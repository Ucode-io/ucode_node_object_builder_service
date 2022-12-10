let pool = new Map()

function get(projectId) {
    if (!pool.has(projectId)) {
        throw ErrProjectNotExists
    }

    return pool.get(projectId)
}

function add(projectId, dbConn) {
    if (pool.has(projectId)) {
        throw ErrProjectExists
    }

    pool.set(project, dbConn)
}

function remove(projectId) {
    pool.delete(projectId)
}

const ErrProjectNotExists = new Error("db conn with given projectId does not exist")
const ErrProjectExists = new Error("db conn with given projectId already exists")

module.exports = {get, add, remove}

