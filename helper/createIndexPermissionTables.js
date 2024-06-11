const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")
const ObjectBuilder = require('../models/object_builder');

module.exports = async function (data) {
    const mongoConn = await mongoPool.get(data.project_id)
    const fieldPermission = mongoConn.models['field_permission']
    const actionPermission = mongoConn.models['action_permission']
    const viewRelationPermission = mongoConn.models['view_relation_permission']
    const recordPermission = mongoConn.models['record_permission']
    const menuPermisssion = mongoConn.models['menu_permission']
    const Field = mongoConn.models['Field']
    const Table = mongoConn.models['Table']
    let labelFieldViewRelationTable = await Field.findOne({
        slug: "label",
        table_id: "074fcb3b-038d-483d-b390-ca69490fc4c3"
    })
    if (!labelFieldViewRelationTable) {
        let label = {
            "id": "385ceb40-6267-4f5e-9327-f75fe79e8bfe",
            "table_id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
            "required": false,
            "slug": "label",
            "label": "Название связь",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "disabled": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
                    "icon": {
                        "stringValue": "",
                        "kind": "stringValue"
                    },
                    "placeholder": {
                        "stringValue": "",
                        "kind": "stringValue"
                    },
                    "showTooltip": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
                    "defaultValue": {
                        "stringValue": "",
                        "kind": "stringValue"
                    }
                }
            },
            "is_visible": false,
            "is_system": true,
            "autofill_field": "",
            "autofill_table": "",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        }
        await Field.create(label)
        await Table.updateOne({ id: "074fcb3b-038d-483d-b390-ca69490fc4c3" }, { $set: { is_changed: true } })
    }
    let labelFieldActionPermissionTable = await Field.findOne({
        slug: "label",
        table_id: "5af2bfb2-6880-42ad-80c8-690e24a2523e"
    })
    if (!labelFieldActionPermissionTable) {
        let label = {
            "id": "485ceb40-6267-4f5e-9327-f75fe79e8bfe",
            "table_id": "5af2bfb2-6880-42ad-80c8-690e24a2523e",
            "required": false,
            "slug": "label",
            "label": "Название",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "disabled": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
                    "icon": {
                        "stringValue": "",
                        "kind": "stringValue"
                    },
                    "placeholder": {
                        "stringValue": "",
                        "kind": "stringValue"
                    },
                    "showTooltip": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
                    "defaultValue": {
                        "stringValue": "",
                        "kind": "stringValue"
                    }
                }
            },
            "is_visible": false,
            "is_system": true,
            "autofill_field": "",
            "autofill_table": "",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        }
        await Field.create(label)
        await Table.updateOne({ id: "5af2bfb2-6880-42ad-80c8-690e24a2523e" }, { $set: { is_changed: true } })
    }
    try {
        await fieldPermission.collection.createIndex({ field_id: 1, role_id: 1 }, { unique: true })
    } catch (error) {
    }
    try {
        await actionPermission.collection.createIndex({ custom_event_id: 1, role_id: 1 }, { unique: true })
    } catch (error) {
    }
    try {
        await viewRelationPermission.collection.createIndex({ relation_id: 1, role_id: 1, table_slug: 1 }, { unique: true })
    } catch (error) {
    }

    try {
        await recordPermission.collection.createIndex({ role_id: 1, table_slug: 1 }, { unique: true })
    } catch (error) {

    }

    try {
        await recordPermission.collection.createIndex({ role_id: 1, table_slug: 1 }, { unique: true })
    } catch (error) {

    }
    try {
        await menuPermisssion.collection.createIndex({ menu_id: 1, role_id: 1 }, { unique: true })
    } catch (error) {

    }
}