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
            const appPermission = (await ObjectBuilder(true, data.project_id))["app_permission"]
            const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
            const roles = await roleTable.models.find()
            let appPermissions = []
            for (const role of roles) {
                let permisson = {
                    role_id: role.guid,
                    app_id: response.id,
                    read: true,
                    create: true,
                    update: true,
                    delete: true,
                }
                const permissionModel = new appPermission.models(permisson)
                appPermissions.push(permissionModel)
            }
            await appPermission.models.insertMany(appPermissions);
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

            const appBeforeUpdate = await App.findOne({id: data.id})
            if(!appBeforeUpdate) {
                throw Error("App not found")
            }

            if(appBeforeUpdate.is_system) {
                throw Error("This app is system app, you can't change system app")
            }

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
            const pipelines = [
                {
                    '$match': payload
                }, {
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
                    '$unwind': {
                        'path': '$permission',
                        'preserveNullAndEmptyArrays': true
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
            apps.forEach(app => {
                if (!app.permission || !Object.keys(app.permission)) {
                    app.permission = {
                        create: false,
                        read: false,
                        update: false,
                        delete: false,
                        role_id: data.role_id,
                        app_id: app.id,
                        guid: ""
                    }
                }
            })
            const count = await App.countDocuments(query);
            return { apps, count };
        } catch (err) {
            throw err
        }

    }),
    getByID: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const App = mongoConn.models['App']
            const Table = mongoConn.models['Table']

            const app = await App.findOne({ id: data.id });
            let tables = []
            const recordPermission = (await ObjectBuilder(true, data.project_id))["record_permission"]
            if (app.tables) {
                for (const single_table of app.tables) {
                    // let table = await Table.findOne({ id: single_table.table_id})
                    let table = await tableVersion(mongoConn, { id: single_table.table_id, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, data.version_id, true)
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

            const appBeforeDelete = await App.findOne({ id: data.id })
            if(!appBeforeDelete) {
                throw Error("App not found")
            }

            if(appBeforeUpdate.is_system) {
                throw Error("This app is system app, you can't change system app")
            }

            const app = await App.deleteOne({ id: data.id });

            return app;
        } catch (err) {
            throw err
        }
    }),
};

module.exports = appStore;
