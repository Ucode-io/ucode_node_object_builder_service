const ObjectBuilder = require("../../models/object_builder");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
let NAMESPACE = "storage.object_builder";
const { struct } = require('pb-util');
const { v4 } = require("uuid");
const con = require("../../config/kafkaTopics");

const sendMessageToTopic = require("../../config/kafka");
const converter = require("../../helper/converter");
const tableVersion = require('../../helper/table_version');
const cfg = require('../../config/index')
const mongoPool = require('../../pkg/pool');

const App = require('./app')
const Table = require('./table');
const { limit } = require("../../config/index");
const { ta, el } = require("date-fns/locale");
const { bulkWrite } = require("../../models/relation");

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

        console.log("ENTER FUNCTION")
        const mongoConn = await mongoPool.get(req.project_id)
        const Table = mongoConn.models['Table']
        const App = mongoConn.models['App']
        const Role = (await ObjectBuilder(true, req.project_id))['role'].models
        const RecordPermission = (await ObjectBuilder(true, req.project_id))['record_permission'].models
        const FieldPermission = (await ObjectBuilder(true, req.project_id))['field_permission'].models
        const ViewPermission = (await ObjectBuilder(true, req.project_id))['view_relation_permission'].models
        const ActionPermission = (await ObjectBuilder(true, req.project_id))['action_permission'].models
        const AutomaticFilter = (await ObjectBuilder(true, req.project_id))['automatic_filter'].models
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const View = mongoConn.models['View']


        const role = await Role.findOne(
            { guid: req.role_id },
            null,
            { sort: { createdAt: -1 } }
        )

        if (!role) {
            console.log('WARNING role not found')
            throw new Error('Error role not found')
        }

        let roleCopy = {
            ...role._doc
        }

        const apps = await App.find(
            {},
            null,
            {
                sort: { created_at: -1 }
            }
        );

        if (!apps) {
            console.log('WARNING apps not found')
            return roleCopy
        }


        let appsList = []
        console.log("Apps ", apps.length, apps)
        for (let app of apps) {

            let appCopy = {
                ...app._doc
            }

            let tableIds = []
            for (let table of (app.tables || [])) {
                tableIds.push(table.table_id)
            }
            console.log("Table ids", tableIds)
            const tables = await tableVersion(mongoConn, { id: { $in: tableIds }, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, req.version_id, false)

            if (!tables || !tables.length) {
                console.log('WARNING tables not found')
                // return roleCopy
            }
            console.log(" Tables ", tables.length, tables);
            let tablesList = []

            for (let table of tables) {
                let tableCopy = {
                    ...table._doc
                }

                const record_permissions = await RecordPermission.findOne(
                    {
                        $and: [
                            { table_slug: table.slug },
                            { role_id: req.role_id }
                        ]

                    }
                );

                if (record_permissions) {
                    tableCopy.record_permissions = record_permissions._doc
                } else {
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
                console.log("Record permissions ", record_permissions);
                // NEW
                const fields = await Field.find({
                    table_id: table.id
                })
                let fieldIdAndLabels = []
                // console.log("--test 0 field permission--");
                fields.forEach(el => {
                    fieldIdAndLabels.push({ field_id: el.id, label: el.label })
                })

                let fieldPermissions = await FieldPermission.find({
                    role_id: req.role_id,
                    table_slug: table.slug
                },
                    {
                        _id: 0,
                        __v: 0
                    }
                )
                // console.log("--test 1 field permission--");
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
                        fieldPermission.table_slug = table.slug
                        fieldPermission.view_permission = false
                        fieldPermission.edit_permission = false
                        docFieldPermissions.push(fieldPermission)
                    } else {
                        let field = fields.find(obj => obj.id === fieldPermission.field_id)
                        fieldPermission._doc.label = field?.label
                        docFieldPermissions.push(fieldPermission._doc)
                    }

                }
                // NEW


                tableCopy.field_permissions = docFieldPermissions || []


                let viewRelationPermissions = await ViewPermission.find(
                    {
                        $and: [
                            { role_id: req.role_id },
                            { table_slug: table.slug }
                        ]
                    },
                    null,
                    { sort: { createdAt: -1 } }
                );
                const relations = await Relation.find({
                    $or: [
                        {
                            type: "Many2Many",
                            $or: [
                                { table_to: table.slug },
                                { table_from: table.slug },
                            ]
                        },
                        {
                            type: { $ne: "Many2Many" },
                            table_to: table.slug
                        }
                    ]
                }).lean()
                let relationIdsObject = [], relationIds = []
                relations.forEach(element => {
                    relationIdsObject.push({ relation_id: element.id })
                    relationIds.push(element.id)
                })
                let relationObject = {};
                relations.map(el => relationObject[el.id] = { table_from: el.table_from, table_to: el.table_to })
                let views = []
                if (relationIds.length) {
                    views = await View.find({
                        relation_table_slug: table.slug,
                        relation_id: { $in: relationIds }
                    }).lean()
                }
                let viewObject = {};
                views.map(el => viewObject[el.relation_id] = el.name)

                let viewRelationPermissionsIds = []
                viewRelationPermissions.forEach(element => {
                    viewRelationPermissionsIds.push(element.relation_id)
                })
                let docViewRelationPermissions = []
                let noViewRelationPermission = relationIdsObject.filter(obj => !viewRelationPermissionsIds.includes(obj.relation_id))
                viewRelationPermissions = viewRelationPermissions.concat(noViewRelationPermission)
                for (const viewRelationPermission of viewRelationPermissions) {
                    let view = viewObject[viewRelationPermission.relation_id]
                    let relation = relationObject[viewRelationPermission.relation_id]
                    if (!viewRelationPermission.guid) {
                        viewRelationPermission.role_id = req.role_id
                        viewRelationPermission.table_slug = table.slug
                        viewRelationPermission.view_permission = false
                        viewRelationPermission.label = view ? view : `No label: from ${relation?.table_from} to ${relation?.table_to}`
                        docViewRelationPermissions.push(viewRelationPermission)
                    } else {
                        viewRelationPermission._doc.label = view ? view : `No label: from ${relation?.table_from} to ${relation?.table_to}`
                        docViewRelationPermissions.push(viewRelationPermission._doc)
                    }
                }

                tableCopy.view_permissions = docViewRelationPermissions || []
                const automaticFilters = await AutomaticFilter.find({
                    role_id: req.role_id,
                    table_slug: table.slug,
                })
                let readFilters = [], writeFilters = [], updateFilters = [], deleteFilters = [];
                automaticFilters.forEach(el => {
                    switch (el.method) {
                        case "read":
                            readFilters.push(el)
                            break;
                        case "write":
                            writeFilters.push(el)
                            break;
                        case "update":
                            updateFilters.push(el)
                            break;
                        case "delete":
                            deleteFilters.push(el)
                            break;
                        default:
                            break;
                    }
                })
                tableCopy.automatic_filters = {
                    read: readFilters,
                    write: writeFilters,
                    update: updateFilters,
                    delete: deleteFilters,
                }
                const CustomEvent = mongoConn.models['CustomEvent']

                const customEvents = await CustomEvent.find({
                    table_slug: table.slug,
                })
                let eventObj = {}
                customEvents.map(el => eventObj[el.id] = el.label)
                // let customEventIdAndLabels = []
                // customEvents.forEach(customEvent => {
                //     customEventIdAndLabels.push({ custom_event_id: customEvent.id, label: customEvent.label })
                // })
                // let actionPermissions = await ActionPermission.find({
                //     role_id: req.role_id,
                //     table_slug: req.table_slug
                // },
                //     {
                //         created_at: 0,
                //         updated_at: 0,
                //         createdAt: 0,
                //         updatedAt: 0,
                //         _id: 0,
                //         __v: 0
                //     }
                // )
                const actionPermissions = await ActionPermission.find({
                    role_id: req.role_id,
                    table_slug: table.slug,
                })
                actionPermissions.forEach(el => {
                    el.label = eventObj[el.custom_event_id]
                })
                tableCopy.action_permissions = actionPermissions || []

                tablesList.push(tableCopy)
            }

            appCopy.tables = tablesList
            console.log(" App info ", appCopy)
            appsList.push(appCopy)
        }

        roleCopy.apps = appsList

        // console.log('response->', JSON.stringify(roleCopy, null, 2))
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
        let fieldPermissions = [], viewPermissions = []
        let automaticFilters = []
        let actionPermissions = []
        let bulkWriteRecordPermissions = [], bulkWriteFieldPermissions = [], bulkWriteViewPermission = [];
        for (let app of req?.data?.apps) {
            for (let table of app?.tables) {
                let isHaveCondition = false
                let lengthKeys = Object.keys(table.automatic_filters) ? Object.keys(table.automatic_filters).length : false
                if (lengthKeys) {
                    isHaveCondition = true
                }
                if (table?.record_permissions?.guid) {
                    let filter = { guid: table.record_permissions.guid }
                    let document = {
                        read: table.record_permissions.read,
                        write: table.record_permissions.write,
                        update: table.record_permissions.update,
                        delete: table.record_permissions.delete,
                        is_have_condition: isHaveCondition,
                        is_public: table.record_permissions.is_public,
                        role_id: roleId,
                    }
                    bulkWriteRecordPermissions.push({
                        updateOne: {
                            filter: { guid: table.record_permissions.guid },
                            update: document,
                            upsert: false
                        }
                    })
                } else {
                    let document = {}
                    document["read"] = "Yes"
                    document["write"] = "Yes"
                    document["delete"] = "Yes"
                    document["update"] = "Yes"
                    document["is_have_condition"] = false
                    document["is_public"] = true
                    document["guid"] = v4()
                    document["role_id"] = roleId
                    document["table_slug"] = table.slug
                    bulkWriteRecordPermissions.push({
                        insertOne: {
                            document,
                        }
                    })
                }
                fieldPermissions = [...fieldPermissions, ...table.field_permissions]
                viewPermissions = [...viewPermissions, ...table.view_permissions]
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
        for (let field_permission of (fieldPermissions || [])) {

            if (field_permission?.guid) {
                let document = {
                    view_permission: field_permission.view_permission,
                    edit_permission: field_permission.edit_permission,
                }
                bulkWriteFieldPermissions.push({
                    updateOne: {
                        filter: {
                            guid: field_permission.guid,
                        },
                        update: document,
                        upsert: false
                    }
                })
            } else {
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
                    insertOne: documentFieldPermission
                })
            }
        }
        for (let view_permission of (viewPermissions || [])) {
            if (view_permission?.guid) {
                let document = { view_permission: view_permission.view_permission }
                bulkWriteViewPermission.push({
                    updateOne: {
                        filter: { guid: view_permission?.guid, relation_id: view_permission.relation_id, role_id: roleId },
                        update: document,
                        upsert: false,
                    }
                })

            } else {

                let document = {
                    guid: v4(),
                    label: view_permission.label,
                    relation_id: view_permission.relation_id,
                    role_id: roleId,
                    table_slug: view_permission.table_slug,
                    view_permission: view_permission.view_permission,
                }
                bulkWriteViewPermission.push({ insertOne: document })
            }
        }
        console.log("bulkWriteRecordPermissions lenght:::", bulkWriteRecordPermissions.length);
        console.log("bulkWriteFieldPermissions lenght:::", bulkWriteFieldPermissions.length);
        console.log("bulkWriteViewPermission lenght:::", bulkWriteViewPermission.length);
        console.log("time before bulk table permission", new Date());
        bulkWriteRecordPermissions.length && await RecordPermission.bulkWrite(bulkWriteRecordPermissions)
        console.log("time after bulk table permission", new Date());
        bulkWriteFieldPermissions.length && await FieldPermission.bulkWrite(bulkWriteFieldPermissions)
        console.log("time after bulk field permission", new Date());
        bulkWriteViewPermission.length && await ViewPermission.bulkWrite(bulkWriteViewPermission)
        console.log("time after view field permission", new Date());
        automaticFilters.length && await AutomaticFilter.insertMany(automaticFilters)
        actionPermissions.length && await ActionPermission.insertMany(actionPermissions)

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
}

module.exports = permission
// 