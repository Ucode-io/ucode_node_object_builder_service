const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const mongoPool = require('../../pkg/pool')
const tableVersion = require('../../helper/table_version');
const logger = require("../../config/logger");
const ObjectBuilder = require("../../models/object_builder");
const table = require("../../models/table");
let NAMESPACE = "storage.app";


let appStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id)

            const App = mongoConn.models['App']


            const app = new App(data);

            const response = await app.save();
            console.log("test 00000:");
            const appPermission = (await ObjectBuilder(true, data.project_id))["app_permission"]
            console.log("test 00001:");
            const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
            console.log("test 00002:");
            const roles = await roleTable.models.find()
            let appPermissions = []
            console.log("test aaaa:");
            for (const role of roles) {
                let permisson = {
                    role_id: role.guid,
                    app_id: response.id,
                    read: true,
                    create: true,
                    update: true,
                    delete: true,
                }
                console.log("test permission models before");
                const permissionModel = new appPermission.models(permisson)
                console.log("permisison::", permissionModel);
                appPermissions.push(permissionModel)
            }
            console.log("test bbbb:");
            await appPermission.models.insertMany(appPermissions);
            console.log("test cccc:");
            return response;
        } catch (err) {
            throw err
        }

    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)

            const App = mongoConn.models['App']
            const Table = mongoConn.models['Table']

            const app = await App.updateOne(
                {
                    id: data.id,
                },
                {
                    $set: data
                }
            )

            return app;
        } catch (err) {
            throw err
        }

    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id) // project_id: is resource_id

            const App = mongoConn.models['App']

            let query = {
                name: RegExp(data.search, "i"),
            }
            let payload = {}
            if (data.search) {
                payload.name = RegExp(data.search, "i")
            }
            const pipelines = [{
                '$match': payload
            },
            {
                '$lookup': {
                    'from': 'app_permissions',
                    'let': {
                        'appId': '$id',
                        'roleId': data.role_id
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$app_id', '$$appId'
                                            ]
                                        }, {
                                            '$eq': [
                                                '$role_id', '$$roleId'
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'permission'
                }
            }, {
                '$match': {
                    'permission': { '$ne': [] } // Filter out apps without matching permissions
                }
            }, {
                '$unwind': {
                    'path': '$permission',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$project': {
                    'deleted_at': 0,
                    '__v': 0,
                    '_id': 0,
                    'permission._id': 0,
                    'permission.__v': 0,
                    'permission.createdAt': 0,
                    'permission.updatedAt': 0
                }
            }, {
                '$sort': {
                    'created_at': -1
                }
            }
            ]

            const apps = await App.aggregate(pipelines)
            console.log("app:::", apps);
            const count = await App.countDocuments(query);
            return { apps, count };
        } catch (err) {
            throw err
        }

    }),
    getByID: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            console.log("Data::::", data);
            const App = mongoConn.models['App']
            const Table = mongoConn.models['Table']

            const app = await App.findOne({ id: data.id });
            let tables = []
            const recordPermission = (await ObjectBuilder(true, data.project_id))["record_permission"]
            if (app.tables) {
                for (const single_table of app.tables) {
                    // table = await Table.findOne({ id: single_table.table_id})
                    let table = await tableVersion(mongoConn, { id: single_table.table_id }, data.version_id, true)
                    if (table) {
                        let recordPermissions = await recordPermission.models.findOne(
                            {
                                role_id: data.role_id,
                                table_slug: table.slug
                            },
                            {
                                _id: 0,
                                __v: 0,
                                id: 0
                            }
                        )
                        console.log("recordPermissions::", recordPermissions);
                        table._doc['record_permissions'] = recordPermissions ? recordPermissions : {}
                        tables.push({
                            ...table._doc,
                            is_visible: single_table.is_visible,
                            is_own_table: single_table.is_own_table,
                        })
                    }
                }
            }
            app.tables = tables
            return app;
        } catch (err) {
            throw err
        }


    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)

            const App = mongoConn.models['App']

            const app = await App.deleteOne({ id: data.id });

            return app;
        } catch (err) {
            throw err
        }
    }),
};

module.exports = appStore;
