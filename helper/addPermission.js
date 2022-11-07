const Table = require("../models/table");
const Field = require("../models/field");
const ObjectBuilder = require("../models/object_builder");
const {struct} = require("pb-util");



let permissionFunctions = {
    toField: async (fields, roleId, tableSlug) => {
        let fieldIds = [], fieldPermissions = [], fieldsWithPermissions = [];
        const fieldPermissionMap = new Map();
        const relationFieldPermissionMap = new Map();
        let table = {}, fieldResp = {};
        for (const field of fields) {
            if (field.id.includes("#")) {
                table = await Table.findOne({
                    slug: tableSlug
                });
                let relationID = field.id.split("#")[1];
                fieldResp = await Field.findOne({
                    relation_id: relationID,
                    table_id: table.id
                });
                if (fieldResp) {
                    relationFieldPermissionMap.set(relationID, fieldResp.id);
                    fieldIds.push(fieldResp.id);
                    continue;
                }
            }
            fieldIds.push(field.id);
        }
        if (fieldIds.length) {
            const fieldPermissionTable = (await ObjectBuilder())["field_permission"];
            fieldPermissions = await fieldPermissionTable.models.find({
                $and: [
                    { field_id: { $in: fieldIds } },
                    { role_id: roleId },
                    { table_slug: tableSlug }
                ]
            },
                {
                    created_at: 0,
                    updated_at: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    _id: 0,
                    __v: 0
                }
            );
            for (const fieldPermission of fieldPermissions) {
                fieldPermissionMap.set(fieldPermission.field_id, fieldPermission);
            }
        }
        for (const field of fields) {
            let id = field.id;
            if (id.includes("#")) {
                id = relationFieldPermissionMap.get(id.split("#")[1]);
            }
            let fieldPer = fieldPermissionMap.get(id);
            if (fieldPer) {
                if (field.attributes) {
                    let decodedAttributes = struct.decode(field.attributes);
                    decodedAttributes["field_permission"] = fieldPer._doc;
                    let encodedAttributes = struct.encode(decodedAttributes);
                    field.attributes = encodedAttributes;
                } else {
                    let attributes = {
                        field_permission: fieldPer._doc
                    };
                    let encodedAttributes = struct.encode(attributes);
                    field["attributes"] = encodedAttributes;
                }
            }
            fieldsWithPermissions.push(field);
        }
        return fieldsWithPermissions;
    },
    toCustomEvent: async (customEvents, roleId, tableSlug) => {
        let customEventIds = [], actionPermissions = [], actionWithPermissions = []
        const actionPermissionMap = new Map();
        for (const customEvent of customEvents) {
            customEventIds.push(customEvent.id)
        }
        if (customEventIds.length) {
            const actionPermissionTable = (await ObjectBuilder())["action_permission"]
            actionPermissions = await actionPermissionTable.models.find({
                    $and: [
                        {custom_event_id: {$in: customEventIds}},
                        {role_id: roleId},
                        {table_slug: tableSlug}
                    ]
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
            for (const actionPermission of actionPermissions) {
                actionPermissionMap.set(actionPermission.custom_event_id, actionPermission)
            }
        }
        for (let customEvent of customEvents) {
            let actionPer = actionPermissionMap.get(customEvent.id)
            let newCustomEvent = {
                table_slug: customEvent.table_slug,
                icon: customEvent.icon,
                label: customEvent.label,
                event_path: customEvent.event_path,
                url: customEvent.url,
                disable: customEvent.disable,
                id: customEvent.id,
                functions: customEvent.functions
            }
            if (actionPer) {
                let encodedActionPermission = struct.encode(actionPer._doc)
                newCustomEvent.action_permission = encodedActionPermission
            }
            actionWithPermissions.push(newCustomEvent)
        }
        return actionWithPermissions
    },
    toViewRelation: async (relations, roleId, tableSlug) => {
        let relationIds = []
        relations.forEach(element => {
            relationIds.push(element.id)
        })
        const relationPermissionTable = (await ObjectBuilder())["view_relation_permission"]
        let viewRelationPermissions = await relationPermissionTable.models.find({
                role_id: roleId,
                table_slug: tableSlug,
                relation_id: {$in: relationIds}
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
        for (const relation of relations) {
            let encodedPermission = {}
            let permission = viewRelationPermissions.find(obj => obj.relation_id === relation.id)
            if (permission) {
                if (permission._doc) {
                    encodedPermission = struct.encode(permission._doc)
                } else {
                    encodedPermission = struct.encode(permission)
                }
            }
            relation["permission"] = encodedPermission
        }
        return relations
    }

} 

module.exports = permissionFunctions
