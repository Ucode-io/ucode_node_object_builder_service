const pool = require("../../pkg/pool")
const catchWrapDb = require("../../helper/catchWrapDb");
const insertCollections = require("../../helper/initialDatabaseSetup");
const newMongoDBConn = require('../../config/mongoConn')
const config = require('../../config/index')
const client = require('../../services/grpc/client');
const objectBuilder = require("../../models/object_builder");
const buildSlimModels = require("../../models/object_slim_builder");
const logger = require("../../config/logger");
const isSystemChecker = require("../../helper/is_system")
const initialMenu = require("../../helper/initialMenu");
const defaultPage = require("../../helper/addFieldForDefaultPage");
const addFields = require("../../helper/addFields");
const is_static = require("../../helper/is_static");
const add_permission_field = require("../../helper/add_record_permission");
const personTable = require("../../helper/personTableSetups");

let NAMESPACE = "storage.project";

let projectStore = {
    register: catchWrapDb(`${NAMESPACE}.register`, async (data) => {
        try {
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

                await insertCollections(mongoDBConn, data.user_id, data.project_id, data.client_type_id, data.role_id)

                // compiling models after running migrations
                mongoDBConn.model('App', require('../../schemas/app'))
                mongoDBConn.model('CustomEvent', require('../../schemas/custom_event'))
                mongoDBConn.model('Dashboard', require('../../schemas/dashboard'))
                mongoDBConn.model('Document', require('../../schemas/document'))
                mongoDBConn.model('EventLog', require('../../schemas/event_log'))
                mongoDBConn.model('Event', require('../../schemas/event'))
                mongoDBConn.model('Field', require('../../schemas/field'))
                mongoDBConn.model('Function', require('../../schemas/function'))
                mongoDBConn.model('function_service.function', require('../../schemas/function_service_function'))
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
                mongoDBConn.model('CustomErrorMessage', require('../../schemas/custom_error_message'))
                mongoDBConn.model('object_builder_service.menu.settings', require('../../schemas/menu_settings'))
                mongoDBConn.model('object_builder_service.menu.templates', require('../../schemas/menu_template'))
                mongoDBConn.model('CustomErrorMessage', require('../../schemas/custom_error_message'))
                mongoDBConn.model('PivotTemplate', require('../../schemas/report_setting').PivotTemplateSettingSchema)
                mongoDBConn.model('ReportSetting', require('../../schemas/report_setting').ReportSettingSchema)
                mongoDBConn.model('IncrementSeq', require('../../schemas/increment'))
                mongoDBConn.model("Language", require('../../schemas/language'))

                await pool.add( data.project_id , mongoDBConn )
                await objectBuilder(false, data.project_id)
                await personTable( { project_id: data.project_id } )
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
                        await isSystemChecker(mongoDBConn)
                        mongoDBConn.model('Table.folder', require('../../schemas/table_folder'))
                        mongoDBConn.model('Table.history', require('../../schemas/table_history'))
                        mongoDBConn.model('Table.version', require('../../schemas/table_version'))
                        mongoDBConn.model('Tab', require('../../schemas/tab'))
                        mongoDBConn.model('Layout', require('../../schemas/layouts'))
                        mongoDBConn.model('App', require('../../schemas/app'))
                        mongoDBConn.model('object_builder_service.menu', require('../../schemas/menu'))
                        mongoDBConn.model('CustomErrorMessage', require('../../schemas/custom_error_message'))
                        mongoDBConn.model('object_builder_service.menu.settings', require('../../schemas/menu_settings'))
                        mongoDBConn.model('object_builder_service.menu.templates', require('../../schemas/menu_template'))
                        mongoDBConn.model('PivotTemplate', require('../../schemas/report_setting').PivotTemplateSettingSchema)
                        mongoDBConn.model('ReportSetting', require('../../schemas/report_setting').ReportSettingSchema)
                        mongoDBConn.model('Language', require('../../schemas/language'))
                        await objectBuilder(false, data.project_id)
                        await initialMenu({ project_id: data.project_id })
                        await defaultPage({ project_id: data.project_id })
                        await addFields({ project_id: data.project_id })
                        await is_static({ project_id: data.project_id, mongoDBConn: mongoDBConn })
                        await add_permission_field( { project_id: data.project_id } )
                        await personTable({ project_id: data.project_id })
                        resolve()
                    });

                    mongoDBConn.on('error', async function (err) {
                        logger.error("mongo connection error", err)
                        reject(err)
                    })
                } catch (err) {
                    console.log("ERRRRRR_>", err)
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

                await objectBuilder(false, data?.project_id).then(res => {
                    logger.info("Object builder has successfully runned for", data?.project_id);
                })
            });

            return {}

        } catch (err) {
            throw err
        }
    }),
    autoConnect: catchWrapDb(`${NAMESPACE}.autoConnect`, async (args) => {
        if (!config.k8s_namespace) { throw new Error("k8s_namespace is required to get project") };

        let reconnect_data = await client.autoConn(config.k8s_namespace, config.nodeType);
        for (let it of reconnect_data.res) {
            if (it.resource_type !== "MONGODB") continue
            try {
                await projectStore.reconnect(it)
            } catch (err) {
                logger.info(`auto connecting to resources failed: ${err}`);
            }
        }

        return {}
    })
};

module.exports = projectStore;
 

