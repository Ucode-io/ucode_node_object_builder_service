const ObjectBuilder = require("../../models/object_builder");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
let NAMESPACE = "storage.object_builder";
const { struct } = require('pb-util');
const { v4 } = require("uuid");
const con = require("../../config/kafkaTopics");

const sendMessageToTopic = require("../../config/kafka");
const converter = require("../../helper/converter");
const tableVersion = require('../../helper/table_version');
const mongoPool = require('../../pkg/pool');


let permission = {
    upsertPermissionsByAppId: catchWrapDbObjectBuilder(`${NAMESPACE}.upsertPermissionsByAppId`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Section = mongoConn.models['Section']
            const App = mongoConn.models['App']
            const View = mongoConn.models['View']
            const Relation = mongoConn.models['Relation']
            const ViewRelation = mongoConn.models['ViewRelation']

            const data = struct.decode(req.data)


            const app = await App.findOne({ id: req.app_id })
            let response = []
            if (app) {
                if (app.tables.length) {
                    for (const tableFromApp of app.tables) {
                        // const tableInfo = await table.findOne({ id: tableFromApp.table_id })
                        const tableInfo = await tableVersion(mongoConn, { id: tableFromApp.table_id }, data.version_id, true)
                        let res;
                        if (tableInfo) {
                            const permissionTable = (await ObjectBuilder(true, req.project_id))["record_permission"]
                            const permission = await permissionTable.models.findOne({
                                $and: [
                                    {
                                        table_slug: tableInfo.slug
                                    },
                                    {
                                        role_id: data.role_id
                                    }
                                ]
                            })

                            data["table_slug"] = tableInfo.slug
                            if (permission) {
                                res = await permissionTable.models.updateOne(
                                    {
                                        $and: [
                                            {
                                                table_slug: tableInfo.slug
                                            },
                                            {
                                                role_id: data.role_id
                                            }
                                        ]
                                    },
                                    {
                                        $set: data
                                    }
                                )
                                let event = {}
                                let field_types = {}
                                event.payload = {}
                                event.payload.data = data
                                event.payload.table_slug = "record_permission"

                                for (const field of permissionTable.fields) {
                                    let type = converter(field.type);
                                    field_types[field.slug] = type
                                }
                                field_types.guid = "String"
                                event.payload.field_types = field_types
                                event.project_id = req.project_id

                                await sendMessageToTopic(con.TopicObjectUpdateV1, event)
                            } else {
                                let methods = ["read", "write", "delete", "update"]
                                let keys = Object.keys(data)
                                for (const method of methods) {
                                    let exists = keys.includes(method)
                                    if (!exists) {
                                        data[method] = "Yes"
                                    }
                                }
                                data["is_have_condition"] = false
                                let payload = new permissionTable.models(data);
                                res = await payload.save();
                                let event = {}
                                let field_types = {}
                                event.payload = {}
                                event.payload.data = data
                                event.payload.table_slug = "record_permission"

                                for (const field of permissionTable.fields) {
                                    let type = converter(field.type);
                                    field_types[field.slug] = type
                                }
                                field_types.guid = "String"
                                event.payload.field_types = field_types
                                event.project_id = req.project_id

                                await sendMessageToTopic(con.TopicObjectCreateV1, event)
                            }
                        }
                        response.push(res)
                    }
                }
            }
            return { app: app.name, data: response }
        } catch (err) {
            throw err
        }
    }),
    getAllPermissionsByRoleId: catchWrapDbObjectBuilder(`${NAMESPACE}.getAllPermissionsByRoleId`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const table = mongoConn.models['Table']


            // const tables = await table.find({
            //     deleted_at: "1970-01-01T18:00:00.000+00:00",
            // })
            const tables = await tableVersion(mongoConn, { delete_at: "1970-01-01T18:00:00.000+00:00" }, req.version_id, false)
            let tableSlugs = []
            let noPermissions = []
            tables.forEach(table => {
                tableSlugs.push(table.slug)
            })
            const permissionTable = (await ObjectBuilder(true, req.project_id))["record_permission"]
            let permissions = await permissionTable.models.find({
                role_id: req.role_id,
                table_slug: { $in: tableSlugs }
            },
                {
                    _id: 0,
                    __v: 0
                }
            )
            let permissionTableSlugs = []
            permissions.forEach(permission => {
                permissionTableSlugs.push(permission.table_slug)
            })
            let noPermissionTableSlugs = tableSlugs.filter(val => !permissionTableSlugs.includes(val))
            for (const tableSlug of noPermissionTableSlugs) {
                let permission = {
                    table_slug: tableSlug,
                    role_id: req.role_id,
                    read: "Yes",
                    write: "Yes",
                    delete: "Yes",
                    update: "Yes",
                    is_have_condition: false
                }
                noPermissions.push(permission)
                permissions = permissions.concat(noPermissions)

                let docPermissions = []
                for (const permission of permissions) {
                    if (permission._doc) {
                        docPermissions.push(permission._doc)
                    } else {
                        docPermissions.push(permission)
                    }
                }
                const response = struct.encode({
                    permissions: docPermissions
                })
                return { table_slug: "record_permission", data: response }
            }
        } catch (err) {
            throw err
        }
    }),
    getFieldPermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.getFieldPermissions`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            // const Section = mongoConn.models['Section']
            // const App = mongoConn.models['App']
            // const View = mongoConn.models['View']
            // const Relation = mongoConn.models['Relation']
            // const ViewRelation = mongoConn.models['ViewRelation']

            // const tableInfo = await table.findOne({
            //     slug: req.table_slug,
            //     deleted_at: "1970-01-01T18:00:00.000+00:00",
            // }).lean()
            const tableInfo = await tableVersion(mongoConn, { slug: req.table_slug }, req.version_id, true)
            const fields = await Field.find({
                table_id: tableInfo.id
            })
            let fieldIdAndLabels = []
            fields.forEach(field => {
                fieldIdAndLabels.push({ field_id: field.id, label: field.label })
            })
            const permissionTable = (await ObjectBuilder(true, req.project_id))["field_permission"]
            let fieldPermissions = await permissionTable.models.find({
                role_id: req.role_id,
                table_slug: req.table_slug
            },
                {
                    _id: 0,
                    __v: 0
                }
            )
            let permissionFieldIds = []
            fieldPermissions.forEach(fieldPermission => {
                permissionFieldIds.push(fieldPermission.field_id)
            })
            let docFieldPermissions = []
            let noFieldPermissions = fieldIdAndLabels.filter(val => !permissionFieldIds.includes(val.field_id))
            fieldPermissions = fieldPermissions.concat(noFieldPermissions)
            for (const fieldPermission of fieldPermissions) {
                if (!fieldPermission.guid) {
                    fieldPermission.role_id = req.role_id
                    fieldPermission.table_slug = req.table_slug
                    fieldPermission.view_permission = false
                    fieldPermission.edit_permission = false
                    docFieldPermissions.push(fieldPermission)
                } else {
                    let field = fields.find(obj => obj.id === fieldPermission.field_id)
                    fieldPermission._doc.label = field?.label
                    docFieldPermissions.push(fieldPermission._doc)
                }

            }

            const response = struct.encode({
                field_permissions: docFieldPermissions
            })
            return { table_slug: "field_permission", data: response }
        } catch (err) {
            throw err
        }
    }),
    getListWithAppTablePermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.getListWithAppTablePermissions`, async (req) => {

    }),
    getListWithRoleAppTablePermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.getListWithRoleAppTablePermissions`, async (req) => {
        let start = new Date()
        console.log(">>>>> permission with role ", new Date())
        const mongoConn = await mongoPool.get(req.project_id)
        const App = mongoConn.models['App']
        const Role = (await ObjectBuilder(true, req.project_id))['role'].models
        const AutomaticFilter = (await ObjectBuilder(true, req.project_id))['automatic_filter'].models
        // const AppPermission = (await ObjectBuilder(true, req.project_id))['app_permission'].models
        const Field = mongoConn.models['Field']
        const FieldPermission = mongoConn.models['field_permission']
        const ViewRelation = mongoConn.models['ViewRelation']
        const Tab = mongoConn.models['Tab']
        const CustomEvent = mongoConn.models['CustomEvent']
        const Table = mongoConn.models['Table']
        const CustomPermission = mongoConn.models['global_permission']
        const View = mongoConn.models['View']



        const role = await Role.findOne(
            { guid: req.role_id },
            null,
            { sort: { createdAt: -1 } }
        )
        console.log(">>>>>>>> test #1 ", new Date(), role) 
        if (!role) {
            console.log('WARNING role not found')
            throw new Error('Error role not found')
        }

        let roleCopy = {
            ...role._doc
        }

        const tablePipeline = [
            {
              $match: {
                deleted_at: { $eq: new Date('1970-01-01T18:00:00.000+00:00') }
              }
            },
            {
              $project: {
                __v: 0,
                _id: 0,
                created_at: 0,
                updated_at: 0
              }
            },
            {
              $lookup: {
                from: 'record_permissions', 
                let: { tableSlug: '$slug' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$table_slug', '$$tableSlug'] },
                          { $eq: ['$role_id', role.guid] }
                        ]
                      }
                    }
                  },
                  {
                    $limit: 1
                  }
                ],
                as: 'record_permissions'
              }
            },
            {
              $project: {
                id: "$id",
                slug: '$slug',
                label: "$label",
                show_in_menu: "$show_in_menu",
                is_changed: "$is_cached",
                icon: "$icon",
                is_changed: "$is_cached",
                is_system: "$is_system",
                record_permissions: { $arrayElemAt: ['$record_permissions', 0] }
              }
            }
        ]
        
        const tables = await Table.aggregate(tablePipeline)

        console.log(">>>>>>>> test #2 ", new Date())

        if (!tables || !tables.length) {
            console.log('WARNING apps not found')
            return roleCopy
        }    

        const fieldPipeline = [
            {
              $project: {
                __v: 0,
                _id: 0,
                created_at: 0,
                updated_at: 0
              }
            },
            {
              $lookup: {
                from: 'field_permissions', 
                let: { fieldID: '$id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$field_id', '$$fieldID'] },
                          { $eq: ['$role_id', role.guid] }
                        ]
                      }
                    }
                  },
                  {
                    $limit: 1
                  }
                ],
                as: 'field_permissions'
              }
            },
            {
              $project: {
                label: "$label",
                id: "$id",
                table_id: "$table_id",
                field_permissions: { $arrayElemAt: ['$field_permissions', 0] }
              }
            }
        ]
        const getListViewRelationPermissions = [{
            '$lookup': {
                'from': 'view_relation_permissions',
                'localField': 'relations.relation_id',
                'foreignField': 'relation_id',
                'as': 'view_permissions'
            }
        }, {
            '$addFields': {
                'view_permissions': {
                    '$filter': {
                        'input': '$view_permissions',
                        'as': 'view_permission',
                        'cond': {
                            '$eq': [
                                '$$view_permission.role_id', req.role_id
                            ]
                        }
                    }
                }
            }
        }, {
            '$group': {
                '_id': null,
                'view_permission': {
                    '$push': {
                        'k': '$table_slug',
                        'v': '$view_permissions'
                    }
                }
            }
        }, {
            '$replaceRoot': {
                'newRoot': {
                    '$arrayToObject': '$view_permission'
                }
            }
        }]
        const getListActionPermissions = [
            {
                '$lookup': {
                    'from': 'action_permissions',
                    'localField': 'id',
                    'foreignField': 'custom_event_id',
                    'as': 'action_permissions'
                }
            }, {
                '$addFields': {
                    'action_permissions': {
                        '$filter': {
                            'input': '$action_permissions',
                            'as': 'action_permission',
                            'cond': {
                                '$eq': [
                                    '$$action_permission.role_id', req.role_id
                                ]
                            }
                        }
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'action_permission': {
                        '$push': {
                            'k': '$table_slug',
                            'v': '$action_permissions'
                        }
                    }
                }
            }, {
                '$replaceRoot': {
                    'newRoot': {
                        '$arrayToObject': '$action_permission'
                    }
                }
            }
        ]
        const getAutoFilters = [
            {
                '$match': { role_id: req.role_id }
            },
            {
                '$group': {
                    '_id': '$table_slug',
                    'read': {
                        '$push': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$method', 'read'
                                    ]
                                },
                                'then': '$$ROOT',
                                'else': ''
                            }
                        }
                    },
                    'write': {
                        '$push': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$method', 'write'
                                    ]
                                },
                                'then': '$$ROOT',
                                'else': ''
                            }
                        }
                    },
                    'update': {
                        '$push': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$method', 'update'
                                    ]
                                },
                                'then': '$$ROOT',
                                'else': ''
                            }
                        }
                    },
                    'delete': {
                        '$push': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$method', 'delete'
                                    ]
                                },
                                'then': '$$ROOT',
                                'else': ''
                            }
                        }
                    }
                }
            }, {
                '$project': {
                    'automatic_filters': {
                        'read': {
                            '$filter': {
                                'input': '$read',
                                'cond': {
                                    '$ne': [
                                        '$$this', ''
                                    ]
                                }
                            }
                        },
                        'write': {
                            '$filter': {
                                'input': '$write',
                                'cond': {
                                    '$ne': [
                                        '$$this', ''
                                    ]
                                }
                            }
                        },
                        'update': {
                            '$filter': {
                                'input': '$update',
                                'cond': {
                                    '$ne': [
                                        '$$this', ''
                                    ]
                                }
                            }
                        },
                        'delete': {
                            '$filter': {
                                'input': '$delete',
                                'cond': {
                                    '$ne': [
                                        '$$this', ''
                                    ]
                                }
                            }
                        }
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'automatic_filter': {
                        '$push': {
                            'k': '$_id',
                            'v': '$automatic_filters'
                        }
                    }
                }
            }, {
                '$replaceRoot': {
                    'newRoot': {
                        '$arrayToObject': '$automatic_filter'
                    }
                }
            }
        ] 
        const tabPipeline = [
            {
                $project: {
                  __v: 0,
                  _id: 0,
                  created_at: 0,
                  updated_at: 0
                }
            },
            {
                $match: {
                    type: 'relation'
                }
            },
            {
                $lookup: {
                  from: 'view_relation_permissions', 
                  let: { relationID: '$relation_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$relation_id', '$$relationID'] },
                            { $eq: ['$role_id', role.guid] }
                          ]
                        }
                      }
                    },
                    {
                      $limit: 1
                    }
                  ],
                  as: 'view_permissions'
                }
              },
              {
                $project: {
                  label: "$label",
                  id: "$id",
                  table_slug: "$table_slug",
                  layout_id: "$layout_id",
                  view_permissions: { $arrayElemAt: ['$view_permissions', 0] }
                }
              }
        ]
        const viewPipeline = [
            {
              $project: {
                __v: 0,
                _id: 0,
                created_at: 0,
                updated_at: 0
              }
            },
            {
              $lookup: {
                from: 'view_permissions', 
                let: { viewID: '$id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$view_id', '$$viewID'] },
                          { $eq: ['$role_id', role.guid] }
                        ]
                      }
                    }
                  },
                  {
                    $limit: 1
                  }
                ],
                as: 'view_permissions'
              }
            },
            {
              $project: {
                name: "$name",
                id: "$id",
                table_slug: "$table_slug",
                view_permissions: { $arrayElemAt: ['$view_permissions', 0] }
              }
            }
        ]

        let testFieldResp = await Field.aggregate(fieldPipeline)
        let fields = {}
        testFieldResp.forEach(el => {
            if (!fields[el.table_id]) {
                fields[el.table_id] = [el]
            } else {
                fields[el.table_id].push(el)
            }
        })

        let tableViewPermissions = await View.aggregate(viewPipeline)
        let tableViewPermission = {}
        tableViewPermissions.forEach(el => {
            if (!tableViewPermission[el.table_slug]) {
                tableViewPermission[el.table_slug] = [el]
            } else {
                tableViewPermission[el.table_slug].push(el)
            }
        })

        console.log(">>>>>>>> test #3 ", new Date())
        let viewPermissions = await Tab.aggregate(tabPipeline)
        let viewPermission = {}
        viewPermissions.forEach(el => {
            if (!viewPermission[el.table_slug]) {
                viewPermission[el.table_slug] = [el]
            } else {
                viewPermission[el.table_slug].push(el)
            }
        })
        console.log(">>>>>>>> test #4 ", new Date())
        let actionPermissions = await CustomEvent.aggregate(getListActionPermissions)
        let actionPermission = actionPermissions[0]
        console.log(">>>>>>>> test #5 ", new Date())
        let automaticFilters = await AutomaticFilter.aggregate(getAutoFilters)
        let automaticFilter = automaticFilters[0]
        console.log(">>>>>>>> test #6", new Date())

        let tablesList = []
        for (let table of tables) {
            let tableCopy = {
                ...table,
                record_permissions: table.record_permissions || null,
                custom_permission: {
                    view_create: table?.record_permissions?.view_create || "No",
                    share_modal: table?.record_permissions?.share_modal || "No",
                    settings: table?.record_permissions?.settings || "No",
                    automation: table?.record_permissions?.automation || "No",
                    language_btn: table?.record_permissions?.language_btn || "No"
                }
            }
            if (!tableCopy.record_permissions) {
                console.log('WARNING record_permissions not found')
                tableCopy.record_permissions = {
                    table_slug: table.slug,
                    role_id: req.role_id,
                    read: "No",
                    write: "No",
                    delete: "No",
                    update: "No",
                    is_have_condition: false,
                    is_public: false
                }
            }
            console.log(table.record_permissions)
            let tableFields = fields[table.id]
            tableCopy.field_permissions = []
            tableFields && tableFields.length && tableFields.forEach(field => {
                if (field.field_permissions) {
                    const temp = field.field_permissions
                    tableCopy.field_permissions.push({
                        field_id: temp.field_id,
                        table_slug: table.slug,
                        view_permission: temp.view_permission,
                        edit_permission: temp.edit_permission,
                        role_id: req.role_id,
                        label: field.label,
                    })
                } else {
                    tableCopy.field_permissions.push({
                        field_id: field.id,
                        table_slug: table.slug,
                        view_permission: false,
                        edit_permission: false,
                        role_id: req.role_id,
                        label: field.label,
                        guid: ""
                    })
                }
            })

            let tableRelationViews = viewPermission[table.slug]
            tableCopy.view_permissions = []
            tableRelationViews && tableRelationViews.length && tableRelationViews.forEach(el => {
                if (el.view_permissions) {
                    const temp = el.view_permissions
                    tableCopy.view_permissions.push({
                        guid: temp.guid,
                        relation_id: temp.relation_id,
                        table_slug: temp.table_slug,
                        view_permission: temp.view_permission,
                        edit_permission: temp.edit_permission,
                        create_permission: temp.create_permission,
                        delete_permission: temp.delete_permission,
                        label: el.label,
                    })
                } else {
                    tableCopy.view_permissions.push({
                        guid: "",
                        relation_id: "",
                        table_slug: "",
                        view_permission: false,
                        edit_permission: false,
                        create_permission: false,
                        delete_permission: false,
                        label: el.label,
                    })
                }
            })

            let tableViews = tableViewPermission[table.slug]
            tableCopy.table_view_permissions = []
            tableViews && tableViews.length && tableViews.forEach(el => {
                if (el.view_permissions) {
                    const temp = el.view_permissions
                    tableCopy.table_view_permissions.push({
                        guid: temp.guid,
                        view: temp.view,
                        edit: temp.edit,
                        delete: temp.delete,
                        name: el.name,
                        view_id: temp.view_id
                    })
                } else {
                    tableCopy.table_view_permissions.push({
                        guid: "",
                        view_permission: false,
                        edit_permission: false,
                        create_permission: false,
                        delete_permission: false,
                        name: el.name,
                        view_id: ""
                    })
                }
            })

            if (actionPermission && actionPermission[table.slug]) {
                tableCopy.action_permissions = actionPermission[table.slug]
            } else {
                tableCopy.action_permissions = []
            }
            if (automaticFilter && automaticFilter[table.slug]) {
                tableCopy.automatic_filters = automaticFilter[table.slug]
            }
            tablesList.push(tableCopy)
        }
        console.log(">>>>>>>> test #7 ", new Date())
        // appCopy.tables = tablesList
        // appsList.push(appCopy)
        let end =  new Date()
        console.log("tablesList length:::", tablesList.length);
        roleCopy.tables = tablesList
        roleCopy.global_permission = await CustomPermission?.findOne({role_id: roleCopy.guid}) || {}
        console.log("\n\n time ", start, "\n", end, "\n", end - start)
        return { project_id: req.project_id, data: roleCopy }

    }),
    updateRoleAppTablePermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.updateRoleAppTablePermissions`, async (req) => {
        const ErrRoleNotFound = new Error('role_id is required')
        const ErrWhileUpdate = new Error('error while updating')

        const roleId = req?.data?.guid || ''
        if (!roleId) {
            throw ErrRoleNotFound
        }

        const mongoConn = await mongoPool.get(req.project_id)
        const Table = mongoConn.models['Table']
        const App = mongoConn.models['App']
        const Role = (await ObjectBuilder(true, req.project_id))['role'].models
        const RecordPermission = (await ObjectBuilder(true, req.project_id))['record_permission'].models
        const FieldPermission = (await ObjectBuilder(true, req.project_id))['field_permission'].models
        const ViewPermission = (await ObjectBuilder(true, req.project_id))['view_relation_permission'].models
        const AutomaticFilter = (await ObjectBuilder(true, req.project_id))['automatic_filter'].models
        const ActionPermission = (await ObjectBuilder(true, req.project_id))['action_permission'].models
        // const AppPermission = (await ObjectBuilder(true, req.project_id))['app_permission'].models

        let role = await Role.findOneAndUpdate(
            {
                guid: req.data.guid
            },
            {
                $set: {
                    name: req.data.name
                }
            },
            {
                upsert: false
            }
        )

        if (!role) {
            throw ErrRoleNotFound
        }

        let automaticFilters = []
        let actionPermissions = []
        for (let app of req?.data?.apps) {
            // if (app?.permission?.guid) {
            //     await AppPermission.findOneAndUpdate(
            //         {
            //             guid: app.permission.guid
            //         },
            //         {
            //             $set: {
            //                 read: app.permission.read,
            //                 create: app.permission.create,
            //                 update: app.permission.update,
            //                 delete: app.permission.delete,
            //                 role_id: app.permission.role_id,
            //                 app_id: app.permission.app_id
            //             }
            //         },
            //         {
            //             upsert: false,
            //         }
            //     )

            // } else {
            //     await AppPermission.create(
            //         {
            //             read: app.permission.read,
            //             create: app.permission.create,
            //             update: app.permission.update,
            //             delete: app.permission.delete,
            //             guid: v4(),
            //             role_id: roleId,
            //             app_id: app.id
            //         }
            //     )
            // }
            for (let table of app?.tables) {
                let isHaveCondition = false
                let lengthKeys = Object.keys(table.automatic_filters) ? Object.keys(table.automatic_filters).length : false
                if (lengthKeys) {
                    isHaveCondition = true
                }
                if (table?.record_permissions?.guid) {
                    await RecordPermission.findOneAndUpdate(
                        {
                            guid: table.record_permissions.guid
                        },
                        {
                            $set: {
                                read: table.record_permissions.read,
                                write: table.record_permissions.write,
                                update: table.record_permissions.update,
                                delete: table.record_permissions.delete,
                                is_have_condition: isHaveCondition,
                                is_public: table.record_permissions.is_public
                            }
                        },
                        {
                            upsert: false,
                        }
                    )

                } else {
                    await RecordPermission.create(
                        {
                            read: table.record_permissions.read,
                            write: table.record_permissions.write,
                            update: table.record_permissions.update,
                            delete: table.record_permissions.delete,
                            guid: v4(),
                            role_id: roleId,
                            table_slug: table.slug,
                            is_have_condition: isHaveCondition,
                            is_public: table.record_permissions.is_public
                        }
                    )
                }

                for (let field_permission of (table.field_permissions || [])) {

                    if (field_permission?.guid) {
                        await FieldPermission.findOneAndUpdate(
                            {
                                guid: field_permission.guid,
                            },
                            {
                                $set: {
                                    view_permission: field_permission.view_permission,
                                    edit_permission: field_permission.edit_permission,
                                }
                            },
                            {
                                upsert: false
                            }
                        )
                    } else {
                        await FieldPermission.create(
                            {
                                view_permission: field_permission.view_permission,
                                edit_permission: field_permission.edit_permission,
                                field_id: field_permission.field_id,
                                table_slug: table.slug,
                                role_id: roleId,
                                label: field_permission.label,
                                guid: v4()
                            }
                        )
                    }
                }

                for (let view_permission of (table.view_permissions || [])) {
                    if (view_permission?.guid) {
                        await ViewPermission.findOneAndUpdate(
                            {
                                guid: view_permission.guid,
                            },
                            {
                                $set: {
                                    view_permission: view_permission.view_permission
                                }
                            },
                            {
                                upsert: false
                            }
                        )
                    } else {
                        await ViewPermission.create(
                            {
                                guid: v4(),
                                label: view_permission.label,
                                relation_id: view_permission.relation_id,
                                role_id: roleId,
                                table_slug: table.slug,
                                view_permission: view_permission.view_permission,
                            }
                        )
                    }
                }
                let query = {
                    table_slug: table.slug,
                    role_id: req.data.guid
                }
                const count = await AutomaticFilter.countDocuments(query)
                if (count) {
                    await AutomaticFilter.deleteMany(query)
                }
                let readFilters = table?.automatic_filters?.read || []
                let writeFilters = table?.automatic_filters?.write || []
                let updateFilters = table?.automatic_filters?.update || []
                let deleteFilters = table?.automatic_filters?.delete || []
                for (let af of readFilters) {
                    let payload = new AutomaticFilter(af)
                    payload.guid = v4()
                    payload.role_id = roleId
                    payload.table_slug = table.slug
                    payload.method = "read"
                    automaticFilters.push(payload)
                }
                for (let af of writeFilters) {
                    let payload = new AutomaticFilter(af)
                    payload.guid = v4()
                    payload.role_id = roleId
                    payload.table_slug = table.slug
                    payload.method = "write"
                    automaticFilters.push(payload)
                }
                for (let af of updateFilters) {
                    let payload = new AutomaticFilter(af)
                    payload.guid = v4()
                    payload.role_id = roleId
                    payload.table_slug = table.slug
                    payload.method = "update"
                    automaticFilters.push(payload)
                }
                for (let af of deleteFilters) {
                    let payload = new AutomaticFilter(af)
                    payload.guid = v4()
                    payload.role_id = roleId
                    payload.table_slug = table.slug
                    payload.method = "delete"
                    automaticFilters.push(payload)
                }

                // test new logic update action permission
                const countActionPermission = await ActionPermission.countDocuments(query)
                if (countActionPermission) {
                    await ActionPermission.deleteMany(query)
                }
                table.action_permissions.forEach(el => {
                    el.table_slug = table.slug
                    el.role_id = req.data.guid
                    let payload = new ActionPermission(el)
                    actionPermissions.push(payload)
                })
                // let permissioncustomEventIds = []
                // actionPermissions.forEach(actionPermission => {
                //     permissioncustomEventIds.push(actionPermission.custom_event_id)
                // })
                // let docPermissions = []
                // let noActionPermissions = customEventIdAndLabels.filter(val => !permissioncustomEventIds.includes(val.custom_event_id))
                // actionPermissions = actionPermissions.concat(noActionPermissions)
                // for (const actionPermission of actionPermissions) {
                //     if (!actionPermission.guid) {
                //         actionPermission.permission = false
                //         actionPermission.g
                //         docPermissions.push(actionPermission)
                //     // } else {
                //         let customEvent = customEvents.find(obj => obj.id === actionPermission.custom_event_id)
                //         actionPermission._doc.label = customEvent?.label
                //         docPermissions.push(actionPermission._doc)
                //     }
                // }



            }
        }
        await AutomaticFilter.insertMany(automaticFilters)
        await ActionPermission.insertMany(actionPermissions)

        return {}

    }),
    updateRoleAppTablePermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.updateRoleAppTablePermissions`, async (req) => {
        const start = new Date()
        console.log(">>>>>>>>>>>>>> test #1 ",  new Date())
        const ErrRoleNotFound = new Error('role_id is required')
        const ErrWhileUpdate = new Error('error while updating')

        const roleId = req?.data?.guid || ''
        if (!roleId) {
            throw ErrRoleNotFound
        }

        const mongoConn = await mongoPool.get(req.project_id)
        const Table = mongoConn.models['Table']
        const App = mongoConn.models['App']
        // const projectModels = await ObjectBuilder(true, req.project_id)
        const Role = mongoConn.models['role']
        const RecordPermission = mongoConn.models['record_permission']
        const FieldPermission = mongoConn.models['field_permission']
        const ViewPermission = mongoConn.models['view_relation_permission']
        const AutomaticFilter = mongoConn.models['automatic_filter']
        const ActionPermission = mongoConn.models['action_permission']
        const CustomPermission = mongoConn.models['global_permission']
        const TableViewPermission = mongoConn.models['view_permission']
        console.log(">>>>>>>>>>>>>> test #2 ",  new Date())

        let role = await Role.findOneAndUpdate(
            {
                guid: req.data.guid
            },
            {
                $set: {
                    name: req.data.name
                }
            },
            {
                upsert: false
            }
        )
        console.log(">>>>>>>>>>>>>> test #3 ",  new Date())
        if (!role) {
            throw ErrRoleNotFound
        }
        let fieldPermissions = [], viewPermissions = [], actionPermissions = [],  tableViewPermissions = []
        let bulkWriteRecordPermissions = [], bulkWriteFieldPermissions = [], bulkWriteViewPermissions = [], bulkWriteActionPermissions = [], bulkWriteTableViewPermissions = [];
        let automaticFilters = {}
        console.log(">>>>>>>>>>>>>> test #4 ",  new Date())
        for (let table of req?.data?.tables) {
            console.log(table.custom_permission)
            let isHaveCondition = false
            if (table?.automatic_filters?.read?.length ||
                table?.automatic_filters?.write?.length ||
                table?.automatic_filters?.delete?.length ||
                table?.automatic_filters?.update?.length) {
                isHaveCondition = true
                automaticFilters[table.slug] = {
                    automatic_filters: table.automatic_filters
                }
            }
            let document = {
                read: table.record_permissions.read,
                write: table.record_permissions.write,
                update: table.record_permissions.update,
                delete: table.record_permissions.delete,
                is_have_condition: isHaveCondition,
                is_public: table.record_permissions.is_public,
                role_id: roleId,
                table_slug: table.slug,
                language_btn: table?.custom_permission?.language_btn || "No",
                automation: table?.custom_permission?.automation || "No",
                settings: table?.custom_permission?.settings || "No",
                share_modal: table?.custom_permission?.share_modal || "No",
                view_create: table?.custom_permission?.view_create || "No",
            }
            bulkWriteRecordPermissions.push({
                updateOne: {
                    filter: { role_id: roleId, table_slug: table.slug },
                    update: document,
                    upsert: true
                }
            })
            fieldPermissions = [...fieldPermissions, ...table.field_permissions]
            viewPermissions = [...viewPermissions, ...table.view_permissions]
            actionPermissions = [...actionPermissions, ...table.action_permissions]
            tableViewPermissions = [...tableViewPermissions, ...table.table_view_permissions]
        }
        console.log(">>>>>>>>>>>>>> test #5 ",  new Date())
        for (let field_permission of (fieldPermissions || [])) {

            let documentFieldPermission = {
                view_permission: field_permission.view_permission,
                edit_permission: field_permission.edit_permission,
                field_id: field_permission.field_id,
                table_slug: field_permission.table_slug,
                role_id: roleId,
                label: field_permission.label,
                guid: v4()
            }
            bulkWriteFieldPermissions.push({
                updateOne: {
                    filter: {
                        field_id: field_permission.field_id,
                        role_id: roleId
                    },
                    update: documentFieldPermission,
                    upsert: true
                }
            })
        }
        console.log(">>>>>>>>>>>>>> test #6 ",  new Date())
        for (let view_permission of (viewPermissions || [])) {
            let document = {
                permission: view_permission.view_permission || false,
                label: view_permission.label,
                role_id: roleId,
                table_slug: view_permission.table_slug,
                relation_id: view_permission.relation_id,
                edit_permission: view_permission.edit_permission || false,
                create_permission: view_permission.create_permission || false,
                delete_permission: view_permission.delete_permission || false,
            }
            bulkWriteViewPermissions.push({
                updateOne: {
                    filter: {
                        relation_id: view_permission.relation_id,
                        table_slug: view_permission.table_slug,
                        role_id: roleId
                    },
                    update: document,
                    upsert: true,
                }
            })
        }
        for (let view_permission of (tableViewPermissions || [])) {
            console.log(">>>>>>>>>>>>>>>. ", view_permission)
            let document = {
                guid: view_permission.guid || v4(),
                role_id: roleId,
                view: view_permission.view || false,
                edit: view_permission.edit || false,
                delete: view_permission.delete || false,
                view_id: view_permission.view_id,
            }
            bulkWriteTableViewPermissions.push({
                updateOne: {
                    filter: {
                        view_id: view_permission.view_id,
                        role_id: roleId
                    },
                    update: document,
                    upsert: true,
                }
            })
        }
        console.log(">>>>>>>>>>>>>> test #7 ",  new Date())
        for (let action_permission of (actionPermissions || [])) {
            
            let documentActionPermission = {
                permission: action_permission.permission,
                custom_event_id: action_permission.custom_event_id,
                table_slug: action_permission.table_slug,
                role_id: roleId,
                label: action_permission.label,
            }
            bulkWriteActionPermissions.push({
                updateOne: {
                    filter: {
                        custom_event_id: action_permission.custom_event_id,
                        role_id: roleId
                    },
                    update: documentActionPermission,
                    upsert: true
                }
            })
        }
        console.log(">>>>>>>>>>>>>> test #8 ",  new Date())
        let tableFilters = []
        for (const tableSlug of Object.keys(automaticFilters)) {
            if (automaticFilters[tableSlug]) {
                const filters = automaticFilters[tableSlug].automatic_filters
                for (let read_filter of (filters.read || [])) {
                    if (read_filter.custom_field && read_filter.object_field) {
                        read_filter.role_id = roleId
                        read_filter.method = "read"
                        read_filter.table_slug = tableSlug
                        read_filter.guid = v4()
                        tableFilters.push(read_filter)
                    }
                }
                for (let update_filter of (filters.update || [])) {
                    if (update_filter.custom_field && update_filter.object_field) {
                        update_filter.role_id = roleId
                        update_filter.method = "update"
                        update_filter.table_slug = tableSlug
                        update_filter.guid = v4()
                        tableFilters.push(update_filter)
                    }
                }
                for (let write_filter of (filters.write || [])) {
                    if (write_filter.custom_field && write_filter.object_field) {
                        write_filter.role_id = roleId
                        write_filter.method = "write"
                        write_filter.table_slug = tableSlug
                        write_filter.guid = v4()
                        tableFilters.push(write_filter)
                    }
                }
                for (let delete_filter of (filters.delete || [])) {
                    if (delete_filter.custom_field && delete_filter.object_field) {
                        delete_filter.role_id = roleId
                        delete_filter.method = "delete"
                        delete_filter.table_slug = tableSlug
                        delete_filter.guid = v4()
                        tableFilters.push(delete_filter)
                    }
                }
            }
        }

        await CustomPermission.findOneAndUpdate({
            role_id: roleId,
        }, {
            $set: req.data.global_permission
        }) 

        console.log(">>>>>>>>>>>>>> test #9 ",  new Date())

        await AutomaticFilter.deleteMany({role_id: roleId})
        if (tableFilters.length) {
            await AutomaticFilter.insertMany(tableFilters)
        }
        console.log(">>>>>>>>>>>>>> test #10 ",  new Date())
        bulkWriteRecordPermissions.length && await RecordPermission.bulkWrite(bulkWriteRecordPermissions)
        console.log(">>>>>>>>>>>>>> test #11 ",  new Date())
        bulkWriteFieldPermissions.length && await FieldPermission.bulkWrite(bulkWriteFieldPermissions)
        console.log(">>>>>>>>>>>>>> test #12 ",  new Date())
        bulkWriteViewPermissions.length && await ViewPermission.bulkWrite(bulkWriteViewPermissions)
        console.log(">>>>>>>>>>>>>> test #13 ",  new Date())
        bulkWriteActionPermissions.length && await ActionPermission.bulkWrite(bulkWriteActionPermissions)
        console.log(">>>>>>>>>>>>>> test #14 ",  new Date(), bulkWriteTableViewPermissions, bulkWriteTableViewPermissions[0].updateOne)
        bulkWriteTableViewPermissions.length && await TableViewPermission.bulkWrite(bulkWriteTableViewPermissions)
        return {}

    }),
    createRoleAppTablePermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.createRoleAppTablePermissions`, async (req) => {

    }),
    getActionPermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.getActionPermissions`, async (req) => {

        const mongoConn = await mongoPool.get(req.project_id)
        const CustomEvent = mongoConn.models['CustomEvent']

        const customEvents = await CustomEvent.find({
            table_slug: req.table_slug
        })
        let customEventIdAndLabels = []
        customEvents.forEach(customEvent => {
            customEventIdAndLabels.push({ custom_event_id: customEvent.id, label: customEvent.label })
        })
        const permissionTable = (await ObjectBuilder(true, req.project_id))["action_permission"]
        let actionPermissions = await permissionTable.models.find({
            role_id: req.role_id,
            table_slug: req.table_slug
        },
            {
                created_at: 0,
                updated_at: 0,
                createdAt: 0,
                updatedAt: 0,
                _id: 0,
                __v: 0
            }
        )
        let permissioncustomEventIds = []
        actionPermissions.forEach(actionPermission => {
            permissioncustomEventIds.push(actionPermission.custom_event_id)
        })
        let docPermissions = []
        let noActionPermissions = customEventIdAndLabels.filter(val => !permissioncustomEventIds.includes(val.custom_event_id))
        actionPermissions = actionPermissions.concat(noActionPermissions)
        for (const actionPermission of actionPermissions) {
            if (!actionPermission.guid) {
                actionPermission.role_id = req.role_id
                actionPermission.table_slug = req.table_slug
                actionPermission.permission = false
                docPermissions.push(actionPermission)
            } else {
                let customEvent = customEvents.find(obj => obj.id === actionPermission.custom_event_id)
                actionPermission._doc.label = customEvent?.label
                docPermissions.push(actionPermission._doc)
            }
        }

        const response = struct.encode({
            action_permission: docPermissions
        })
        return { table_slug: "action_permission", data: response }
    }),
    getViewRelationPermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.getViewRelationPermissions`, async (req) => {
        const mongoConn = await mongoPool.get(req.project_id)
        const Relation = mongoConn.models['Relation']
        const View = mongoConn.models['View']

        const relations = await Relation.find({
            $or: [
                {
                    type: "Many2Many",
                    $or: [
                        { table_to: req.table_slug },
                        { table_from: req.table_slug },
                    ]
                },
                {
                    type: { $ne: "Many2Many" },
                    table_to: req.table_slug
                }
            ]
        }).lean()
        let relationIdsObject = [], relationIds = []
        relations.forEach(element => {
            relationIdsObject.push({ relation_id: element.id })
            relationIds.push(element.id)
        })

        let views = []
        if (relationIds.length) {
            views = await View.find({
                relation_table_slug: req.table_slug,
                relation_id: { $in: relationIds }
            }).lean()
        }

        const relationPermissionTable = (await ObjectBuilder(true, req.project_id))["view_relation_permission"]
        let viewRelationPermissions = await relationPermissionTable.models.find({
            role_id: req.role_id,
            table_slug: req.table_slug
        },
            {
                created_at: 0,
                updated_at: 0,
                createdAt: 0,
                updatedAt: 0,
                _id: 0,
                __v: 0
            }
        ).lean()

        let viewRelationPermissionsIds = []
        viewRelationPermissions.forEach(element => {
            viewRelationPermissionsIds.push(element.relation_id)
        })
        let docViewRelationPermissions = []
        let noViewRelationPermission = relationIdsObject.filter(obj => !viewRelationPermissionsIds.includes(obj.relation_id))
        viewRelationPermissions = viewRelationPermissions.concat(noViewRelationPermission)
        for (const viewRelationPermission of viewRelationPermissions) {
            let view = views.find(obj => (obj.relation_id === viewRelationPermission['relation_id'] && obj.relation_table_slug === req.table_slug))
            let relation = relations.find(obj => obj.id === viewRelationPermission.relation_id)
            if (!viewRelationPermission.guid) {
                viewRelationPermission.role_id = req.role_id
                viewRelationPermission.table_slug = req.table_slug
                viewRelationPermission.view_permission = true
                viewRelationPermission.label = view ? view.name : `No label: from ${relation?.table_from} to ${relation?.table_to}`
                docViewRelationPermissions.push(viewRelationPermission)
            } else {
                viewRelationPermission.label = view ? view.name : `No label: from ${relation?.table_from} to ${relation?.table_to}`
                docViewRelationPermissions.push(viewRelationPermission)
            }
        }
        const response = struct.encode({
            view_relation_permissions: docViewRelationPermissions
        })
        return { table_slug: "view_relation_permission", data: response }
    }),
    getAllMenuPermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.gettAllMenuPermissions`, async (data) => {
        try {
            console.log("data:", data);

            const mongoConn = await mongoPool.get(data.project_id) // project_id: is resource_id

            const Menu = mongoConn.models['object_builder_service.menu']

            let query = {
                parent_id: data.parent_id,
            }
            const pipelines = [
                {
                    '$match': query
                }, {
                    '$lookup': {
                        'from': 'menu_permissions',
                        'let': {
                            'menuId': '$id',
                            'roleId': data.role_id
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$expr': {
                                        '$and': [
                                            {
                                                '$eq': [
                                                    '$role_id', '$$roleId'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$menu_id', '$$menuId'
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
                        "__v": 0,
                        "_id": 0,
                        'permission._id': 0,
                        'permission.__v': 0,
                        'permission.createdAt': 0,
                        'permission.updatedAt': 0
                    }
                }, {
                    '$sort': {
                        'order': 1,
                    },
                }
            ]
            let menus = await Menu.aggregate(pipelines)
            return { menus };
        } catch (err) {
            throw err
        }

    }),
    updateMenuPermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.updateMenuPermissions`, async (data) => {
        try {

            // const mongoConn = await mongoPool.get(data.project_id) // project_id: is resource_id

            const menuPermissionTable = (await ObjectBuilder(true, data.project_id))["menu_permission"].models
            let updateMenuPermissions = []
            data.menus.forEach(menu => {
                menu.permission.role_id = data.role_id
                menu.permission.id = menu.id
                updateMenuPermissions.push({
                    updateOne: {
                        filter: {
                            menu_id: menu.id,
                            role_id: data.role_id
                        },
                        update: menu.permission,
                        upsert: true
                    }
                })
            })
            updateMenuPermissions.length && await menuPermissionTable.bulkWrite(updateMenuPermissions)
            return {};
        } catch (err) {
            throw err
        }

    }),
    getGlobalPermissionByRoleId: catchWrapDbObjectBuilder(`${NAMESPACE}.getGlobalPermissionByRoleId`, async (req) => {
        const mongoConn = await mongoPool.get(req.project_id)
        const GlobalPermission = mongoConn.models['global_permission']

        const resp = await GlobalPermission?.findOne({role_id: req.role_id}).lean() || {}

        return resp
    }),
}

module.exports = permission
// 