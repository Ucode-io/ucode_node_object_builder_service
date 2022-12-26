const pool = require("../../pkg/pool")
const catchWrapDb = require("../../helper/catchWrapDb");
const insertCollections = require("../../helper/initialDatabaseSetup");
const newMongoDBConn = require('../../config/mongoConn')


let NAMESPACE = "storage.project";

let projectStore = {
    register: catchWrapDb(`${NAMESPACE}.register`, async (data) => {
        try {
            const mongoDBConn = await newMongoDBConn({
                mongoHost: data.credentials.host,
                mongoPort: data.credentials.port,
                mongoDatabase: data.credentials.database,
                mongoUser: data.credentials.username,
                mongoPassword: data.credentials.password
            })

            await pool.add(data?.project_id, mongoDBConn)

            return {}

        } catch (err) {
            throw err
        }
    }),

    deregister: catchWrapDb(`${NAMESPACE}.deregister`, async (data) => {
        try {
            await pool.remove(data?.project_id)
            return {}

        } catch (err) {
            throw err
        }
    }),

    registerMany: catchWrapDb(`${NAMESPACE}.registerMany`, async (data) => {
        throw new Error("not implemented yett")
    }),

    deregisterMany: catchWrapDb(`${NAMESPACE}.deregisterMany`, async (data) => {
        throw new Error("not implemented yett")
    }),

    getByID: catchWrapDb(`${NAMESPACE}.getByID`, async (data) => {
        try {
            const mongoConn = await pool.get(data?.project_id)
            return mongoConn

        } catch (err) {
            throw err
        }
    }),

    reconnect: catchWrapDb(`${NAMESPACE}.reconnect`, async (data) => {
        try {
            const mongoDBConn = await newMongoDBConn({
                mongoHost: data.credentials.host,
                mongoPort: data.credentials.port,
                mongoDatabase: data.credentials.database,
                mongoUser: data.credentials.username,
                mongoPassword: data.credentials.password
            })

            await pool.override(data?.project_id, mongoDBConn)
            return {}

        } catch (err) {
            throw err
        }
    }),

    registerProjects: catchWrapDb(`${NAMESPACE}.register`, async (data) => {
        try {
            const mongoDBConn = await newMongoDBConn({
                mongoHost: data.credentials.host,
                mongoPort: data.credentials.port,
                mongoDatabase: data.credentials.database,
                mongoUser: data.credentials.username,
                mongoPassword: data.credentials.password
            })

            await insertCollections(mongoDBConn)

            await pool.add(data?.project_id, mongoDBConn)

            return {}

        } catch (err) {
            throw err
        }
    }),

};

module.exports = projectStore;


