const ObjectBuilder = require("../models/object_builder");
const { struct } = require("pb-util");

const mongoPool = require('../pkg/pool');
const config = require('../config/index')

let permissionFunctions = {
    toField: async (fields, roleId, tableSlug, project_id) => {

        try {
            if (!project_id) {
                console.warn('WARNING:: Using default project id in checkRelationFieldExists...')
            }

            const mongoConn = await mongoPool.get(project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']

            let fieldIds = [], fieldPermissions = [], fieldsWithPermissions = [];
            const fieldPermissionMap = new Map();
            const relationFieldPermissionMap = new Map();
            let table = {}, fieldResp = {};
            for (const field of fields) {
                if (field.id.includes("#")) {
                    console.log("enter field with # in get list");
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
                const fieldPermissionTable = (await ObjectBuilder(true, project_id))["field_permission"];
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

        } catch (err) {
            throw err
        }
    },
    toCustomEvent: async (customEvents, roleId, tableSlug, project_id) => {

        try {
            if (!project_id) {
                console.warn('WARNING:: Using default project id in checkRelationFieldExists...')
            }

            const mongoConn = await mongoPool.get(project_id)

            let customEventIds = [], actionPermissions = [], actionWithPermissions = []
            const actionPermissionMap = new Map();
            for (const customEvent of customEvents) {
                customEventIds.push(customEvent.id)
            }
            if (customEventIds.length) {
                const actionPermissionTable = (await ObjectBuilder(true, project_id))["action_permission"]
                actionPermissions = await actionPermissionTable.models.find({
                    $and: [
                        { custom_event_id: { $in: customEventIds } },
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
                )
                for (const actionPermission of actionPermissions) {
                    actionPermissionMap.set(actionPermission.custom_event_id, actionPermission)
                }
            }
            for (let customEvent of customEvents) {
                let actionPer = actionPermissionMap.get(customEvent.id)
                if (actionPer) {
                    let encodedActionPermission = struct.encode(actionPer._doc)
                    customEvent.action_permission = encodedActionPermission
                }
            }
            return customEvents

        } catch (err) {
            throw err
        }

    },
    toViewRelation: async (relations, roleId, tableSlug, project_id) => {

        try {
            if (!project_id) {
                console.warn('WARNING:: Using default project id in checkRelationFieldExists...')
            }

            const mongoConn = await mongoPool.get(project_id)

            let relationIds = []
            relations.forEach(element => {
                relationIds.push(element.id)
            })
            // console.log(project_id, roleId, relationIds, tableSlug)
            const relationPermissionTable = (await ObjectBuilder(true, project_id))["view_relation_permission"]
            let viewRelationPermissions = await relationPermissionTable.models.find({
                role_id: roleId,
                table_slug: tableSlug,
                relation_id: { $in: relationIds }
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
            // console.log("TEST:::::::::1", viewRelationPermissions)
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
            // console.log("relations", relations)
            return relations

        } catch (err) {
            throw err
        }
    },
    toRelationTab: async (relation, roleId, tableSlug, project_id) => {

        try {
            if (!project_id) {
                console.warn('WARNING:: Using default project id in [helper.addPermission.toRelationTab]...')
            }



            const relationPermissionTable = (await ObjectBuilder(true, project_id))["view_relation_permission"]
            let viewRelationPermissions = await relationPermissionTable.models.findOne({
                role_id: roleId,
                table_slug: tableSlug,
                relation_id: relation.id
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

            let encodedPermission = {}
            if (viewRelationPermissions) {
                if (viewRelationPermissions._doc) {
                    encodedPermission = struct.encode(viewRelationPermissions._doc)
                } else {
                    encodedPermission = struct.encode(viewRelationPermissions)
                }
            }
            relation["permission"] = encodedPermission
            return relation

        } catch (err) {
            throw err
        }
    }

}

module.exports = permissionFunctions
