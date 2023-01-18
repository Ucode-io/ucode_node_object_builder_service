const pool = require("../../pkg/pool")
const catchWrapDb = require("../../helper/catchWrapDb");
const insertCollections = require("../../helper/initialDatabaseSetup");
const newMongoDBConn = require('../../config/mongoConn')
const config = require('../../config/index')
const client = require('../../services/grpc/client');
const { k8s_namespace } = require("../../config/index");
const objectBuilder = require("../../models/object_builder");
const logger = require("../../config/logger");



let NAMESPACE = "storage.project";

let projectStore = {
    register: catchWrapDb(`${NAMESPACE}.register`, async (data) => {
        try {

            console.log('data-->',data)
            if (!data.user_id) {
                throw new Error('Error user_id is required')
            }
            if (!data.project_id) {
                throw new Error('Error project_id is required')
            }

            if (!data.resource_id) {
                throw new Error('Error resource_id is required')
            }

            const mongoDBConn = await newMongoDBConn({
                mongoHost: data.credentials.host,
                mongoPort: data.credentials.port,
                mongoDatabase: data.credentials.database,
                mongoUser: data.credentials.username,
                mongoPassword: data.credentials.password
            })

            await insertCollections(mongoDBConn, data.user_id, data.project_id)

            await pool.add(data.resource_id, mongoDBConn)

            mongoDBConn.once("open", async function () {
                console.log("Connected to the database, building models");
                await objectBuilder(false, data.resource_id)
                console.log("Object builder has successfully runned for", data.resource_id);
            });

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


            await new Promise( (resolve, reject) => {
                try {
                    mongoDBConn.once("open", async function () {
                        console.log("Connected to the database, building models for", data.project_id);
                        await objectBuilder(false, data.project_id)
                        console.log("Object builder has successfully runned for", data.project_id);
                        resolve()
                    });
                } catch (err) {
                    reject(err)
                }
               
            })

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

            await insertCollections(mongoDBConn, data.user_id, data.project_id)

            await pool.add(data?.project_id, mongoDBConn)

            mongoDBConn.once("open", async function () {
                console.log("Connected to the database, building models");

                await objectBuilder(false, data?.project_id).then(res => {
                    console.log("Object builder has successfully runned for", data?.project_id);
                })
            });

            return {}

        } catch (err) {
            throw err
        }
    }),
    autoConnect: catchWrapDb(`${NAMESPACE}.autoConnect`, async (args) => {

        if (!config.k8s_namespace) { throw new Error("k8s_namespace is required to get project") };

        let reconnect_data = await client.autoConn(config.k8s_namespace);

        for (let it of reconnect_data.data) {
            // console.log("credentials::::::", it)
            try {
                await projectStore.reconnect(it)
            } catch (err) {
                logger.info(`autoconnecting to resources failed: ${err}`);
            }
        }

        return {}
    })
};

module.exports = projectStore;


