const ObjectBuilder = require("../../models/object_builder");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
let NAMESPACE = "storage.object_builder";
const {struct} = require('pb-util');
const Relation = require("../../models/relation");
const { v4 } = require("uuid");
const con = require("../../helper/constants");
const sendMessageToTopic = require("../../config/kafka");
const table = require("../../models/table");
const converter = require("../../helper/converter");
const Field = require("../../models/field");
const App = require("../../models/app");

let permission = {
    upsertPermissionsByAppId: catchWrapDbObjectBuilder(`${NAMESPACE}.upsertPermissionsByAppId`, async (req) => {
        const data = struct.decode(req.data)

        const app = await App.findOne({id: req.app_id})
        let response = []
        if (app) {
            if (app.tables.length) {
                for (const tableFromApp of app.tables) {
                    const tableInfo = await table.findOne({id: tableFromApp.table_id})
                    let res;
                    if (tableInfo) {
                        const permissionTable = (await ObjectBuilder())["record_permission"]
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
                                    $and:[
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
                            let event  = {}
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
                                    data[method] = "No"
                                }
                            }
                            data["is_have_condition"] = false
                            let payload = new permissionTable.models(data);
                            res = await payload.save();
                            let event  = {}
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
        return {app: app.name, data: response}
    }),
    getAllPermissionsByRoleId: catchWrapDbObjectBuilder(`${NAMESPACE}.getAllPermissionsByRoleId`, async (req) => {

        const tables = await table.find({
            deleted_at: "1970-01-01T18:00:00.000+00:00"
        })
        let tableSlugs = []
        let noPermissions = []
        tables.forEach(table => {
            tableSlugs.push(table.slug)
        })
        const permissionTable = (await ObjectBuilder())["record_permission"]
        let permissions = await permissionTable.models.find({
                role_id: req.role_id,
                table_slug: {$in: tableSlugs}
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
                read: "No",
                write: "No",
                delete: "No",
                update: "No",
                is_have_condition: false
            }
            noPermissions.push(permission)
        }
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
        return {table_slug: "record_permission", data: response}
    }),
    getFieldPermissions: catchWrapDbObjectBuilder(`${NAMESPACE}.getFieldPermissions`, async (req) => {

        const tableInfo = await table.findOne({
            slug: req.table_slug,
            deleted_at: "1970-01-01T18:00:00.000+00:00"
        })
        const fields = await Field.find({
            table_id: tableInfo.id
        })
        let fieldIds = []
        let noFieldPermissions = []
        fields.forEach(field => {
            fieldIds.push(field.id)
        })
        const permissionTable = (await ObjectBuilder())["field_permission"]
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
        let noFieldPermissionIds = fieldIds.filter(val => !permissionFieldIds.includes(val))
        for (const fieldId of noFieldPermissionIds) {
            let field = fields.find(field => (field.id == fieldId))
            let fieldPermission = {
                field_id: fieldId,
                role_id: req.role_id,
                table_slug: req.table_slug,
                view_permission: false,
                edit_permission: false,
                field_label: field.label
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
        const response = struct.encode({
            field_permissions: docPermissions
        })
        return {table_slug: "field_permission", data: response}
    }),
}

module.exports = permission