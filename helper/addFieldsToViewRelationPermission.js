const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")

module.exports = async function (data) {
    console.log(": add additional field to view relation permissison checking...")
    const mongoConn = await mongoPool.get(data.project_id)
    const Field = mongoConn.models['Field']
    const Table = mongoConn.models['Table']
    let fields = [{
        "id": "c5962e1c-2687-46a5-b2dd-d46d41a038c2",
        "required": false,
        "slug": "edit_permission",
        "label": "Разрешение на изменение",
        "default": "",
        "type": "SWITCH",
        "index": "string",
        "attributes": {
            "fields": {
                "defaultValue": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
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
                "creatable": {
                    "boolValue": false,
                    "kind": "boolValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "is_system": true,
    }, {
        "id": "c5962e1c-2687-46a5-b2dd-d46d41a038c3",
        "required": false,
        "slug": "create_permission",
        "label": "Разрешение на создавание",
        "default": "",
        "type": "SWITCH",
        "index": "string",
        "attributes": {
            "fields": {
                "defaultValue": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
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
                "creatable": {
                    "boolValue": false,
                    "kind": "boolValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "is_system": true,
    },
    {
        "id": "c5962e1c-2687-46a5-b2dd-d46d41a038c4",
        "required": false,
        "slug": "delete_permission",
        "label": "Разрешение на удаление",
        "default": "",
        "type": "SWITCH",
        "index": "string",
        "attributes": {
            "fields": {
                "defaultValue": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
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
                "creatable": {
                    "boolValue": false,
                    "kind": "boolValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "is_system": true,
    }]
    let bulkWriteFields = []
    fields.forEach(field => {
        bulkWriteFields.push(
            {
                updateOne: {
                    filter: {
                        slug: field.slug,
                        table_id: field.table_id
                    },
                    update: field,
                    upsert: true,
                },
            }
        )
    })
    await Field.bulkWrite(bulkWriteFields)
    await Table.updateOne({
        id: "074fcb3b-038d-483d-b390-ca69490fc4c3"
    }, { $set: { is_changed: true } })

    console.log("done creating additional field for view relaiton permission")
}