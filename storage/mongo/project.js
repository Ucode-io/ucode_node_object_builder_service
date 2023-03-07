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

            console.log('data-->', data)
            if (!data.user_id) {
                throw new Error('Error user_id is required')
            }
            if (!data.project_id) {
                throw new Error('Error project_id is required')
            }

            // shouldCompileModels=false since we have to list
            // existing collections in mongodb before running migrations
            const mongoDBConn = await newMongoDBConn({
                mongoHost: data.credentials.host,
                mongoPort: data.credentials.port,
                mongoDatabase: data.credentials.database,
                mongoUser: data.credentials.username,
                mongoPassword: data.credentials.password
            }, false)

            mongoDBConn.once("open", async function () {
                console.log("Connected to the database");

                await insertCollections(mongoDBConn, data.user_id, data.project_id)

                // compiling models after running migrations
                mongoDBConn.model('App', require('../../schemas/app'))
                mongoDBConn.model('CustomEvent', require('../../schemas/custom_event'))
                mongoDBConn.model('Dashboard', require('../../schemas/dashboard'))
                mongoDBConn.model('Document', require('../../schemas/document'))
                mongoDBConn.model('EventLog', require('../../schemas/event_log'))
                mongoDBConn.model('Event', require('../../schemas/event'))
                mongoDBConn.model('Field', require('../../schemas/field'))
                mongoDBConn.model('Function', require('../../schemas/function'))
                mongoDBConn.model('HtmlTemplate', require('../../schemas/html_template'))
                mongoDBConn.model('Panel', require('../../schemas/panel'))
                mongoDBConn.model('QueryFolder', require('../../schemas/query_folder'))
                mongoDBConn.model('Query', require('../../schemas/query'))
                mongoDBConn.model('Relation', require('../../schemas/relation'))
                mongoDBConn.model('Section', require('../../schemas/section'))
                mongoDBConn.model('Table', require('../../schemas/table'))
                mongoDBConn.model('Variable', require('../../schemas/variable'))
                mongoDBConn.model('ViewRelation', require('../../schemas/view_relation'))
                mongoDBConn.model('View', require('../../schemas/view'))
                mongoDBConn.model('WebPage', require('../../schemas/web_pages'))

                await pool.add(data.project_id, mongoDBConn)
                await objectBuilder(false, data.project_id)

                console.log("Object builder has successfully runned for", data.project_id);
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


            await new Promise((resolve, reject) => {
                try {
                    mongoDBConn.once("open", async function () {
                        console.log("Connected to the database, building models for", data.project_id);
                        await objectBuilder(false, data.project_id)
                        console.log("Object builder has successfully runned for", data.project_id);
                        resolve()
                    });

                    mongoDBConn.on('error', async function (err) {
                        logger.error("mongo connection error", err)
                        reject(err)
                    })
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

            // shouldCompileModels=false since we have to list
            // existing collections in mongodb before running migrations
            console.log("--->Mongo->Credentials--->", {
                mongoHost: data.credentials.host,
                mongoPort: data.credentials.port,
                mongoDatabase: data.credentials.database,
                mongoUser: data.credentials.username,
                mongoPassword: data.credentials.password
            })

            const mongoDBConn = await newMongoDBConn({
                mongoHost: data.credentials.host,
                mongoPort: data.credentials.port,
                mongoDatabase: data.credentials.database,
                mongoUser: data.credentials.username,
                mongoPassword: data.credentials.password
            }, false)

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
        // console.log("TEST:::::::::::::::::::")
        if (!config.k8s_namespace) { throw new Error("k8s_namespace is required to get project") };

        let reconnect_data = await client.autoConn(config.k8s_namespace);
        console.log("PROJECT-CRED::::::::", reconnect_data.res.length, reconnect_data.res)
        for (let it of reconnect_data.res) {
            console.log("credentials:::", it)
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


