const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")
const ObjectBuilder = require("../models/object_builder");
const customErrMsg = require('../initial_setups/customErrMsg');

module.exports = async function (data) {
    console.log(": Default custom message checking...")
    const mongoConn = await mongoPool.get(data.project_id)
    const Table = mongoConn.models['Table']
    const Field = mongoConn.models['Field']

    let customErrMsgTable = await Table.findOne({
        slug: "object_builder.custom_error",
        deleted_at: { $eq: "1970-01-01T18:00:00.000+00:00" },
    })

    if (!customErrMsgTable) {
        await Table.create({
            "id": "c2f225b6-b6d9-4201-aa25-e648a4c1ff29",
            "label": "Custom Error",
            "slug": "object_builder.custom_error",
            "description": "Custom Error",
            "deleted_at": new Date('1970-01-01T18:00:00.000+00:00'),
            "show_in_menu": true,
            "is_changed": false,
            "is_system": true,
            "icon": "bear-toy.svg",
            "subtitle_field_slug": "",
            "folder_id": "96ed7568-e086-48db-92b5-658450cbd4a8",
            "is_cached": false,
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
            "commit_guid": "277404a5-83ac-4a5c-8f4b-c38d10b1796b"
        })
    }
    let fields = [
        {
            "id": "588f80aa-0838-43b9-bb49-29a7cfecae8d",
            "required": false,
            "slug": "title",
            "label": "Титул",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "showTooltip": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
                    "show_label": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
                    "validation": {
                        "stringValue": "",
                        "kind": "stringValue"
                    },
                    "validation_message": {
                        "stringValue": "",
                        "kind": "stringValue"
                    },
                    "creatable": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
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
                    }
                }
            },
            "is_visible": false,
            "unique": false,
            "automatic": false,
            "commit_id": "",
            "is_system": true,
            "show_label": true,
            "table_id": "c2f225b6-b6d9-4201-aa25-e648a4c1ff29",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
            "autofill_field": "",
            "autofill_table": "",
            "relation_field": "",
            "relation_id": ""
        },
        {
            "required": false,
            "slug": "guid",
            "label": "ID",
            "default": "v4",
            "type": "UUID",
            "index": "true",
            "is_visible": true,
            "unique": true,
            "is_system": true,
            "show_label": true,
            "id": "74d91d9b-1cb8-4f58-8b63-5773d5424306",
            "table_id": "c2f225b6-b6d9-4201-aa25-e648a4c1ff29",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        },
        {
            "id": "2a237e0c-50fd-40bb-9d78-580135d8ade3",
            "table_id": "c2f225b6-b6d9-4201-aa25-e648a4c1ff29",
            "required": false,
            "slug": "name",
            "label": "Название",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "validation": {
                        "stringValue": "",
                        "kind": "stringValue"
                    },
                    "validation_message": {
                        "stringValue": "",
                        "kind": "stringValue"
                    },
                    "creatable": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
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
                    "showTooltip": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
                    "show_label": {
                        "boolValue": false,
                        "kind": "boolValue"
                    }
                }
            },
            "is_visible": false,
            "autofill_field": "",
            "autofill_table": "",
            "unique": false,
            "automatic": false,
            "commit_id": "",
            "relation_field": "",
            "is_system": true,
            "show_label": false,
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        }
    ]
    for (const field of fields) {
        let existField = await Field.findOne({ id: field.id })
        if (!existField) {
            await Field.create(field)
        }
    }
    await Table.updateOne({
        slug: "object_builder.custom_error"
    }, {
        $set: {
            is_changed: true,
        }
    })
    const customErrMsgModel = (await ObjectBuilder(true, data.project_id))["object_builder.custom_error"]
    let customMessages = await customErrMsg()
    for (const customErrMsg of customMessages) {
        await customErrMsgModel.models.updateOne(
            {
                guid: customErrMsg.guid
            },
            {
                $set: customErrMsg
            },
            { upsert: true }
        )
    }

    console.log(": Default custom message checking done!!!")
}