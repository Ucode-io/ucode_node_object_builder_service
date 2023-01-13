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
            mongoDBConn.model('App', require('../schemas/app'))
            mongoDBConn.model('CustomEvent', require('../schemas/custom_event'))
            mongoDBConn.model('Dashboard', require('../schemas/dashboard'))
            mongoDBConn.model('Document', require('../schemas/document'))
            mongoDBConn.model('EventLog', require('../schemas/event_log'))
            mongoDBConn.model('Event', require('../schemas/event'))
            mongoDBConn.model('Field', require('../schemas/field'))
            mongoDBConn.model('Function', require('../schemas/function'))
            mongoDBConn.model('HtmlTemplate', require('../schemas/html_template'))
            mongoDBConn.model('Panel', require('../schemas/panel'))
            mongoDBConn.model('QueryFolder', require('../schemas/query_folder'))
            mongoDBConn.model('Query', require('../schemas/query'))
            mongoDBConn.model('Relation', require('../schemas/relation'))
            mongoDBConn.model('Section', require('../schemas/section'))
            mongoDBConn.model('Table', require('../schemas/table'))
            mongoDBConn.model('Variable', require('../schemas/variable'))
            mongoDBConn.model('ViewRelation', require('../schemas/view_relation'))
            mongoDBConn.model('View', require('../schemas/view'))
            mongoDBConn.model('WebPage', require('../schemas/web_pages'))

            await objectBuilder(false, data.project_id)
            await pool.add(data.project_id, mongoDBConn)
            
            console.log("Object builder has successfully runned for", data.project_id);
        });

        return {}
    }),

    deregister: catchWrapDb(`${NAMESPACE}.deregister`, async (data) => {

        await pool.remove(data?.project_id)
        return {}

    }),

    registerMany: catchWrapDb(`${NAMESPACE}.registerMany`, async (data) => {
        throw new Error("not implemented yett")
    }),

    deregisterMany: catchWrapDb(`${NAMESPACE}.deregisterMany`, async (data) => {
        throw new Error("not implemented yett")
    }),

    getByID: catchWrapDb(`${NAMESPACE}.getByID`, async (data) => {

        const mongoConn = await pool.get(data?.project_id)
        return mongoConn

    }),

    reconnect: catchWrapDb(`${NAMESPACE}.reconnect`, async (data) => {
        if (data?.project_id !== "caf1dfc0-3f77-4ee4-beec-fef5467b645c") {
            throw new Error("lalalallalal")
        }

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
                    const mongoConn = await pool.get(data.project_id)

                    const App = mongoConn.models['App']

                    const apps = await App.find().limit(1);
                    console.log('apps-->', JSON.stringify(apps, null, 2))

                    const clientTypeTable = (await objectBuilder(true, data.project_id))["client_type"]
                    const clientType = await clientTypeTable.models.find()

                    console.log('clientType-->', JSON.stringify(clientType, null, 2))

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
    }),

    registerProjects: catchWrapDb(`${NAMESPACE}.register`, async (data) => {

        // shouldCompileModels=false since we have to list 
        // existing collections in mongodb before running migrations
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

        console.log("pool::::::::::", [...pool.entries()])

        return {}
    })
};

module.exports = projectStore;


