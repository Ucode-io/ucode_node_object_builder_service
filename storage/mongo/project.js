const pool = require("../../pkg/pool")
const catchWrapDb = require("../../helper/catchWrapDb");
const insertCollections = require("../../helper/initialDatabaseSetup");
const newMongoDBConn = require('../../config/mongoConn')
const config = require('../../config/index')
const client = require('../../services/grpc/client');
const { k8s_namespace } = require("../../config/index");
const objectBuilder = require("../../models/object_builder");
const logger = require("../../config/logger");
const initialMenu = require("../../helper/initialMenu");
const initialTableFolder = require("../../helper/initialTableFolder")
const isSystemChecker = require("../../helper/is_system")
const initialCustomMessage = require("../../helper/initialCustomMessage")
const createIndexPermissionTables = require("../../helper/createIndexPermissionTables");
const initialUserLoginTable = require("../../helper/initialUserLoginTable");
const initialMenuPermission = require("../../helper/initialMenuPermission");
const initialGlobalPermission = require("../../helper/initialCustomPermission");
const initialViewPermission = require("../../helper/initialViewPermission");
const addFields = require("../../helper/addFields");
const fieldPermissionIndexChecker = require("../../helper/fieldPermissionIndexChecker")
const ceckPermissionScript = require("../../helper/checkPermissionScript")
const initialDefaultPivot = require("../../helper/initialDefaultPivot");


let NAMESPACE = "storage.project";

let projectStore = {
    register: catchWrapDb(`${NAMESPACE}.register`, async (data) => {
        try {

            // console.log('data-->', data)
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
                mongoDBConn.model('Table.folder', require('../../schemas/table_folder'))
                mongoDBConn.model('Table.history', require('../../schemas/table_history'))
                mongoDBConn.model('Table.version', require('../../schemas/table_version'))
                mongoDBConn.model('Variable', require('../../schemas/variable'))
                mongoDBConn.model('ViewRelation', require('../../schemas/view_relation'))
                mongoDBConn.model('View', require('../../schemas/view'))
                mongoDBConn.model('WebPage', require('../../schemas/web_pages'))
                mongoDBConn.model('Setting.Languages', require('../../schemas/setting_language'))
                mongoDBConn.model('Setting.Currencies', require('../../schemas/setting_currency'))
                mongoDBConn.model('Setting.Timezones', require('../../schemas/setting_timezone'))
                mongoDBConn.model('object_builder_service.menu', require('../../schemas/menu'))
                mongoDBConn.model('object_builder_service.menu.settings', require('../../schemas/menu_settings'))
                mongoDBConn.model('object_builder_service.menu.templates', require('../../schemas/menu_template'))
                mongoDBConn.model('CustomErrorMessage', require('../../schemas/custom_error_message'))
                mongoDBConn.model('PivotTemplate', require('../../schemas/report_setting').PivotTemplateSettingSchema)
                mongoDBConn.model('ReportSetting', require('../../schemas/report_setting').ReportSettingSchema)

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
                        // await insertCollectioinitialTableFolders(mongoDBConn, "", data.project_id)
                        console.log("Connected to the database, building models for", data.project_id);
                        mongoDBConn.model('Field', require('../../schemas/field'))
                        await isSystemChecker(mongoDBConn)
                        mongoDBConn.model('Table.folder', require('../../schemas/table_folder'))
                        mongoDBConn.model('Table.history', require('../../schemas/table_history'))
                        mongoDBConn.model('Table.version', require('../../schemas/table_version'))
                        mongoDBConn.model('Tab', require('../../schemas/tab'))
                        mongoDBConn.model('Layout', require('../../schemas/layouts'))
                        mongoDBConn.model('object_builder_service.menu', require('../../schemas/menu'))
                        mongoDBConn.model('CustomErrorMessage', require('../../schemas/custom_error_message'))
                        mongoDBConn.model('PivotTemplate', require('../../schemas/report_setting').PivotTemplateSettingSchema)
                        mongoDBConn.model('ReportSetting', require('../../schemas/report_setting').ReportSettingSchema)
                        await objectBuilder(false, data.project_id)
                        console.log(">>>>>>>> ")
                        // await initialTableFolder({ project_id: data.project_id })
                        await initialMenu({ project_id: data.project_id })
                        await addFields({ project_id: data.project_id })
                        // await initialCustomMessage({ project_id: data.project_id })
                        // await initialMenuPermission({ project_id: data.project_id })
                        // await initialGlobalPermission({ project_id: data.project_id })
                        // await initialViewPermission({ project_id: data.project_id })
                        // await createIndexPermissionTables({ project_id: data.project_id })
                        // await fieldPermissionIndexChecker(mongoDBConn)
                        // await addFields({ project_id: data.project_id })
                        // await ceckPermissionScript({ project_id: data.project_id })
                        // await initialDefaultPivot({ project_id: data.project_id })
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
            // console.log("pool::::::::::::", pool.get(data?.project_id))
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
        console.log("TEST::::::::::::::::::: 1")
        if (!config.k8s_namespace) { throw new Error("k8s_namespace is required to get project") };

        let reconnect_data = await client.autoConn(config.k8s_namespace);
        console.log("TEST::::::::::::::::::: 2")
        // console.log("PROJECT-CRED >> ", reconnect_data.res.length, reconnect_data.res)
        for (let it of reconnect_data.res) {
            // console.log("credentials:::", it.resource_type)
            if (it.resource_type !== "MONGODB") continue
            // if (it.credentials.database != "facebook_facebook_object_builder_service") continue 
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


