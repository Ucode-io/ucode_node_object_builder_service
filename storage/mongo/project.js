const { get, add, remove } = require("../../pkg/pool")
const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const newMongoDBConn = require('../../config/mongoConn')
const config = require('../../config/index')

let NAMESPACE = "storage.project";

let projectStore = {
    register: catchWrapDb(`${NAMESPACE}.register`, async (data) => {
        try {
            const mongoDBConn = await newMongoDBConn({
                mongoHost: 'localhost',
                mongoPort: 27017,
                mongoDatabase: 'object_builder_service',
                mongoUser: 'admin',
                mongoPassword: 'admin1234'
            })

            await add(data?.project_id || config.ucodeDefaultProjectID, mongoDBConn)
            return {}

        } catch(err) {
            throw err
        }
    }),

    deregister: catchWrapDb(`${NAMESPACE}.deregister`, async (data) => {
        try {
            await remove(data?.project_id || config.ucodeDefaultProjectID)
            return {}

        } catch(err) {
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
            const mongoConn = await get(data?.project_id || config.ucodeDefaultProjectID)
            return mongoConn
            
        } catch(err) {
            throw err
        }
    }),

};

module.exports = projectStore;
