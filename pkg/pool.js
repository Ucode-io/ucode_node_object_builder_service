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
    console.log("get pooling project");

    if (!pool.has(projectId)) {
        try {
            const reconnect_data = await client.reConn(config.k8s_namespace, projectId)

            if(!reconnect_data) {
                throw ErrProjectNotExists
            }

            if(reconnect_data?.res?.resource_type == "MONGODB") {
                
                const mongoDBConn = await newMongoDBConn({
                    mongoHost: reconnect_data?.res?.credentials.host,
                    mongoPort: reconnect_data?.res?.credentials.port,
                    mongoDatabase: reconnect_data?.res?.credentials.database,
                    mongoUser: reconnect_data?.res?.credentials.username,
                    mongoPassword: reconnect_data?.res?.credentials.password
                })

                await override(reconnect_data?.res?.id, mongoDBConn)

                return mongoDBConn
            } else {
                throw Error("Resource doesn't MONGODB type")
            }
        } catch (err) {
            throw ErrProjectNotExists
        }
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
        console.warn('WARNING:: Overriding project in pool...', projectId)
    }

    pool.set(projectId, dbConn)
}

module.exports = { get, add, remove, override }
