const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")

module.exports = async function (data) {
    console.log(": add additional field to view_relation_permissison and role checking...")
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
    }, {
        "id": "c5962e1c-2687-46a5-b2dd-d46d41a038c5",
        "required": false,
        "slug": "grant_access",
        "label": "Предоставление доступа",
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
        "table_id": "1ab7fadc-1f2b-4934-879d-4e99772526ad",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "is_system": true,
    }, {
        "id": "d440d8fa-f36f-4290-857d-73a8bb969d1e",
        "required": false,
        "slug": "type",
        "label": "Тип",
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
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "is_system": true,
        "__v": 0
    }, {
        "id": "04b4921f-323f-45ce-835c-8f5ad5486634",
        "required": false,
        "slug": "main_table_slug",
        "label": "Main Table Slug",
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
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "is_system": true,
        "__v": 0
    }, {
        "id": "71e5f87f-de45-40ee-baa7-a8654b1c4eff",
        "required": false,
        "slug": "field_slug",
        "label": "Field Slug",
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
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "is_system": true,
        "__v": 0
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
    // update role and view relation permission table
    await Table.updateMany({
        id: { $in: ["074fcb3b-038d-483d-b390-ca69490fc4c3", "1ab7fadc-1f2b-4934-879d-4e99772526ad", "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea"] }
    }, { $set: { is_changed: true } })

    console.log("done creating additional field for view_relaiton_permission and role")
}