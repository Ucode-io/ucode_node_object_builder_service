const pool = require("../../pkg/pool")
const catchWrapDb = require("../../helper/catchWrapDb");
const insertCollections = require("../../helper/initialDatabaseSetup");
const newMongoDBConn = require('../../config/mongoConn')
const config = require('../../config/index')
const client = require('../../services/grpc/client');
const { k8s_namespace } = require("../../config/index");



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
    autoConnect : catchWrapDb(`${NAMESPACE}.autoConnect`, async (args) => {
        if (!config.k8s_namespace) { throw new Error("k8s_namespace is required to get project") };
        console.log("args ==> ",args)
        let projects = await client.autoConn(config.k8s_namespace)
        console.log('projects', projects)
        return projects;
    })
}; 


// async function AutoConn(args){
    
//     if (!config.k8s_namespace) { throw new Error("k8s_spaceName is REQUIRED") };
//     let query = {
//         // query
//         _id: config.k8s_namespace
//     }

//     let resConn = await client.ProjectService.AutoConnect(query);
    
//     return resConn
// }
// module.exports = {AutoConn};

module.exports = projectStore;


