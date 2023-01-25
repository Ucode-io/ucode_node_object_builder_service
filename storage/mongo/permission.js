const ObjectBuilder = require("../../models/object_builder");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
let NAMESPACE = "storage.object_builder";
const { struct } = require('pb-util');
const { v4 } = require("uuid");
const con = require("../../config/kafkaTopics");

const sendMessageToTopic = require("../../config/kafka");
const converter = require("../../helper/converter");
const cfg = require('../../config/index')
const mongoPool = require('../../pkg/pool');

const App = require('./app')
const Table = require('./table');
const { limit } = require("../../config/index");
const { ta } = require("date-fns/locale");

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
                        const tableInfo = await table.findOne({ id: tableFromApp.table_id })
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

            const tables = await table.find({
                deleted_at: "1970-01-01T18:00:00.000+00:00"
            })
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

            const tableInfo = await table.findOne({
                slug: req.table_slug,
                deleted_at: "1970-01-01T18:00:00.000+00:00"
            }).lean()
            const fields = await Field.find({
                table_id: tableInfo.id
            })
            let fieldIds = []
            let noFieldPermissions = []
            fields.forEach(field => {
                fieldIds.push(field.id)
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
            ).lean()

            let permissionFieldIds = []
            fieldPermissions.forEach(fieldPermission => {
                permissionFieldIds.push(fieldPermission.field_id)
            })

            let noFieldPermissionIds = fieldIds.filter(val => !permissionFieldIds.includes(val))

            for (const fieldId of noFieldPermissionIds) {
                let field = fields.find(field => (field.id === fieldId))
                let fieldPermission = {
                    field_id: fieldId,
                    role_id: req.role_id,
                    table_slug: req.table_slug,
                    view_permission: true,
                    edit_permission: true,
                    label: field.label
                }
                noFieldPermissions.push(fieldPermission)
            }
            fieldPermissions = fieldPermissions.concat(noFieldPermissions)

            const response = struct.encode({
                field_permissions: fieldPermissions
            })
            return { table_slug: "field_permission", data: response }
        } catch (err) {
            throw err
        }
    }),
    getListWithAppTablePermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.getListWithAppTablePermissions`, async (req) => {

    }),
    getListWithRoleAppTablePermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.getListWithRoleAppTablePermissions`, async (req) => {

        const mongoConn = await mongoPool.get(req.project_id)
        const Table = mongoConn.models['Table']
        const App = mongoConn.models['App']
        const Role = (await ObjectBuilder(true, req.project_id))['role'].models
        const RecordPermission = (await ObjectBuilder(true, req.project_id))['record_permission'].models
        const FieldPermission = (await ObjectBuilder(true, req.project_id))['field_permission'].models
        const ViewPermission = (await ObjectBuilder(true, req.project_id))['view_relation_permission'].models
        const Field = mongoConn.models['Field']
        
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
        for (let app of apps) {

            let appCopy = {
                ...app._doc
            }

            let tableIds = []
            for (let table of (app.tables || [])) {
                tableIds.push(table.table_id)
            }

            const tables = await Table.find(
                {
                    id: { $in: tableIds },
                    deleted_at: "1970-01-01T18:00:00.000+00:00",
                },
                null,
                {
                    sort: { created_at: -1 }
                }
            );

            if (!tables) {
                console.log('WARNING tables not found')
                return roleCopy
            }

            let tablesList = []

            for (let table of tables) {
                let tableCopy = {
                    ...table._doc
                }

                const record_permissions = await RecordPermission.findOne(
                    {   
                        $and: [
                            {table_slug: table.slug},
                            {role_id: req.role_id}
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
                        read: "Yes",
                        write: "Yes",
                        delete: "Yes",
                        update: "Yes",
                        is_have_condition: false
                    }
                }

                // NEW
                const fields = await Field.find({
                    table_id: table.id
                })
                let fieldIds = []
                let noFieldPermissions = []

                fields.forEach(field => {
                    fieldIds.push(field.id)
                })

                let fieldPermissions = await FieldPermission.find({
                    $and: [
                        {role_id: req.role_id},
                        {table_slug: table.slug}
                    ]
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

                let noFieldPermissionIds = fieldIds.filter(val => !permissionFieldIds.includes(val))

                for (const fieldId of noFieldPermissionIds) {
                    let field = fields.find(field => (field.id == fieldId))
                    let fieldPermission = {
                        field_id: fieldId,
                        role_id: req.role_id,
                        table_slug: req.table_slug,
                        view_permission: true,
                        edit_permission: true,
                        label: field.label
                    }
                    noFieldPermissions.push(fieldPermission)
                }
                fieldPermissions = fieldPermissions.concat(noFieldPermissions)

                let docPermissions = []
                for (const permission of fieldPermissions) {
                    if (permission._doc) {
                        docPermissions.push(permission._doc)
                    } else {
                        docPermissions.push(permission)
                    }
                }
                // NEW


                tableCopy.field_permissions = docPermissions || []

                const view_permissions = await ViewPermission.find(
                    {
                        $and: [
                            {role_id: req.role_id},
                            {table_slug: table.slug}
                        ]
                    },
                    null,
                    { sort: { createdAt: -1 } }
                );

                tableCopy.view_permissions = view_permissions || []

                tablesList.push(tableCopy)
            }

            appCopy.tables = tablesList

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

        for (let app of req?.data?.apps) {
            for (let table of app?.tables) {

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
                            }
                        },
                        {
                            upsert: false
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
                            role_id: req.data.guid,
                            table_slug: table.record_permissions.table_slug,
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
                                table_slug: field_permission.table_slug,
                                role_id: field_permission.role_id,
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
                                role_id: view_permission.role_id,
                                table_slug: view_permission.table_slug,
                                view_permission: view_permission.view_permission,
                            }
                        )
                    }
                }
            }
        }

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