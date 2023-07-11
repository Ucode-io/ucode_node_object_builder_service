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
        // return { project_id: "okok", data: {} }
        let start = new Date()
        console.log(">>>>> permission with role ", new Date())
        const mongoConn = await mongoPool.get(req.project_id)
        const App = mongoConn.models['App']
        const Role = (await ObjectBuilder(true, req.project_id))['role'].models
        const AutomaticFilter = (await ObjectBuilder(true, req.project_id))['automatic_filter'].models
        const Field = mongoConn.models['Field']
        const ViewRelation = mongoConn.models['ViewRelation']
        const CustomEvent = mongoConn.models['CustomEvent']
        const Table = mongoConn.models['Table']



        const role = await Role.findOne(
            { guid: req.role_id },
            null,
            { sort: { createdAt: -1 } }
        )
        console.log(">>>>>>>> test #1 ", new Date())
        if (!role) {
            console.log('WARNING role not found')
            throw new Error('Error role not found')
        }

        let roleCopy = {
            ...role._doc
        }

        const tables = await Table.find(
            {
                deleted_at: { $eq: new Date('1970-01-01T18:00:00.000+00:00') }
            },
            {
                __v: 0,
                _id: 0,
                created_at: 0,
                updated_at: 0,
            },
            {
                sort: { created_at: -1 }
            }
        ).populate({
            path: 'record_permissions',
            match: { 'record_permissions.role_id': req.role_id },
        });

        console.log(">>>>>>>> test #2 ", new Date())

        if (!tables || !tables.length) {
            console.log('WARNING apps not found')
            return roleCopy
        }
        let testPipeline = [
            {
              $group: {
                _id: '$table_id',
                fields: { $push: '$$ROOT' }
              }
            },
            {
              $lookup: {
                from: 'field_permissions',
                let: { field_ids: '$fields.id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $in: ['$field_id', '$$field_ids'] },
                          { $eq: ['$role_id', req.role_id] } 
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      _id: 0,
                      field_id: 1,
                      table_slug: 1,
                      view_permission: 1,
                      edit_permission: 1,
                      label: 1
                    }
                  }
                ],
                as: 'field_permissions'
              }
            },
            {
              $addFields: {
                fields: {
                  $map: {
                    input: '$fields',
                    as: 'field',
                    in: {
                      $mergeObjects: [
                        '$$field',
                        {
                          field_permissions: {
                            $filter: {
                              input: '$field_permissions',
                              as: 'fp',
                              cond: {
                                $eq: ['$$field.id', '$$fp.field_id']
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            {
              $addFields: {
                fields: {
                  $map: {
                    input: '$fields',
                    as: 'field',
                    in: {
                      $cond: [
                        { $ne: [{ $size: '$$field.field_permissions' }, 0] },
                        '$$field',
                        { $mergeObjects: ['$$field', { field_permissions: [] }] }
                      ]
                    }
                  }
                }
              }
            },
            {
              $project: {
                _id: 0,
                table_id: '$_id',
                fields: 1
              }
            }
        ]
        const getListFieldPermisssions = [
            {
                '$lookup': {
                    'from': 'field_permissions',
                    'let': {
                        'fieldId': '$id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        {
                                            '$eq': [
                                                '$field_id', '$$fieldId'
                                            ]
                                        }, {
                                            '$eq': [
                                                '$role_id', req.role_id
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'field_permissions'
                }
            }, {
                '$unwind': {
                    'path': '$field_permissions',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$group': {
                    '_id': '$table_id',
                    'fields': {
                        '$push': '$$ROOT'
                    }
                }
            }, {
                '$match': {
                    '_id': {
                        '$ne': null
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'table_fields': {
                        '$push': {
                            'k': '$_id',
                            'v': '$fields'
                        }
                    }
                }
            }, {
                '$replaceRoot': {
                    'newRoot': {
                        '$arrayToObject': '$table_fields'
                    }
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

        // let fieldsOfTables = await Field.aggregate(getListFieldPermisssions)
        // let fields = fieldsOfTables[0]
        // console.log(">>>>>>>> test #3 ", new Date())

        let newFieldOfTables = await Field.aggregate(testPipeline)
        let fields = {}
        newFieldOfTables.forEach(el => {
            fields[el.table_id] = el.fields
        })
        console.log(">>>>>>>> test #3.1 ", new Date())
        let viewPermissions = await ViewRelation.aggregate(getListViewRelationPermissions)
        let viewPermission = viewPermissions[0]
        console.log(">>>>>>>> test #4 ", new Date())
        let actionPermissions = await CustomEvent.aggregate(getListActionPermissions)
        let actionPermission = actionPermissions[0]
        console.log(">>>>>>>> test #5 ", new Date())
        let automaticFilters = await AutomaticFilter.aggregate(getAutoFilters)
        let automaticFilter = automaticFilters[0]
        console.log(">>>>>>>> test #6 ", new Date())



        // let appCopy = {
        //     ...app._doc
        // }

        // for (let table of (app.tables || [])) {
        //     if (table.is_own_table) {
        //         tableIds.push(table.table_id)
        //     }
        // }
        // const tables = await tableVersion(mongoConn, { id: { $in: tableIds }, deleted_at: new Date("1970-01-01T18:00:00.000+00:00"), role_id: req.role_id }, req.version_id, false)
        let tablesList = []
        // if (!tables || !tables.length) {
        //     console.log('WARNING tables not found')
        //     // return roleCopy
        // }

        for (let table of tables) {
            let tableCopy = {
                ...table._doc,
                record_permissions: table.record_permissions || null
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
            let tableFields = fields[table.id]
            tableCopy.field_permissions = []
            tableFields && tableFields.length && tableFields.forEach(field => {
                if (field.field_permissions && field.field_permissions.length) {
                    let obj = field.field_permissions[0]
                    tableCopy.field_permissions.push({
                        ...obj,
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
            if (viewPermission && viewPermission[table.slug]) {
                tableCopy.view_permissions = viewPermission[table.slug]
            } else {
                tableCopy.view_permissions = []
            }
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
        let fieldPermissions = [], viewPermissions = [], actionPermissions = []
        let bulkWriteRecordPermissions = [], bulkWriteFieldPermissions = [], bulkWriteViewPermissions = [], bulkWriteActionPermissions = [];
        let automaticFilters = {}
        for (let table of req?.data?.tables) {
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
                table_slug: table.slug
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
        }
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
        for (let view_permission of (viewPermissions || [])) {
            let document = {
                view_permission: view_permission.view_permission || false,
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
        for (let action_permission of (actionPermissions || [])) {

            let documentActionPermission = {
                view_permission: action_permission.permission,
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

        if (tableFilters.length) {
            AutomaticFilter.deleteMany({})
            await AutomaticFilter.insertMany(tableFilters)
        }
        bulkWriteRecordPermissions.length && await RecordPermission.bulkWrite(bulkWriteRecordPermissions)
        bulkWriteFieldPermissions.length && await FieldPermission.bulkWrite(bulkWriteFieldPermissions)
        bulkWriteViewPermissions.length && await ViewPermission.bulkWrite(bulkWriteViewPermissions)
        bulkWriteActionPermissions.length && await ActionPermission.bulkWrite(bulkWriteActionPermissions)
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
}

module.exports = permission
// 