const mongoPool = require('../pkg/pool');

module.exports = async function (data) {
    const mongoConn = await mongoPool.get(data.project_id)
    const Table = mongoConn.models['Table']
    const Field = mongoConn.models['Field']
    const Relation = mongoConn.models['Relation']

    let bulkTable = [{
        updateOne: {
            filter: {
                id: "eca81c06-c4fc-4242-8dc9-ecca575e1762",
                slug: "user_login_table",
                deleted_at: new Date('1970-01-01T18:00:00.000+00:00'),
            },
            update: {
                "id": "eca81c06-c4fc-4242-8dc9-ecca575e1762",
                "slug": "user_login_table",
                "label": "User Login Table",
                "description": "User Login Table",
                "deleted_at": new Date('1970-01-01T18:00:00.000+00:00'),
                "show_in_menu": true,
                "is_changed": false,
                "icon": "chalkboard-user.svg",
                "subtitle_field_slug": "",
                "folder_id": "",
                "is_cached": false,
                "is_system": false,
                "soft_delete": false,
                "created_at": new Date(),
                "updated_at": new Date(),
                "is_system": true,
                "__v": 0,
                "commit_guid": "58e790aa-06a2-4a11-ae4f-0ff7cf2f8b0b"
            },
            upsert: true,
        }
    }]
    await Table.bulkWrite(bulkTable)
    let bulkFields = [{
        updateOne: {
            filter: {
                table_id: "eca81c06-c4fc-4242-8dc9-ecca575e1762",
                slug: "table_id",
            },
            update: {
                "id": "43f4ca6b-0d98-4829-ac87-15bbcaf7af3f",
                "required": false,
                "slug": "table_id",
                "label": "Table Id",
                "default": "",
                "type": "SINGLE_LINE",
                "index": "string",
                "attributes": {
                    "fields": {
                        "defaultValue": {
                            "stringValue": "",
                            "kind": "stringValue"
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
                "unique": false,
                "automatic": false,
                "commit_id": "",
                "is_system": false,
                "show_label": true,
                "table_id": "eca81c06-c4fc-4242-8dc9-ecca575e1762",
                "created_at": new Date(),
                "updated_at": new Date(),
                "is_system": true,
                "__v": 0
            },
            upsert: true,

        }
    }, {
        updateOne: {
            filter: {
                table_id: "eca81c06-c4fc-4242-8dc9-ecca575e1762",
                slug: "guid",
            },
            update: {
                "required": false,
                "slug": "guid",
                "label": "ID",
                "default": "v4",
                "type": "UUID",
                "index": "true",
                "is_visible": true,
                "unique": true,
                "is_system": false,
                "show_label": true,
                "id": "ee92d4c0-2a3a-4c1c-9025-aeb08f3d783f",
                "table_id": "eca81c06-c4fc-4242-8dc9-ecca575e1762",
                "created_at": new Date(),
                "updated_at": new Date(),
                "is_system": true,
                "__v": 0
            },
            upsert: true,
        }
    }, {
        updateOne: {
            filter: {
                table_id: "eca81c06-c4fc-4242-8dc9-ecca575e1762",
                slug: "client_type_id",
            },
            update: {
                "table_id": "eca81c06-c4fc-4242-8dc9-ecca575e1762",
                "required": false,
                "slug": "client_type_id",
                "label": "FROM user_login_table TO client_type",
                "type": "LOOKUP",
                "is_visible": true,
                "relation_id": "0c2889fc-95be-4b59-81f3-07e6903e9696",
                "is_system": false,
                "show_label": true,
                "id": "e4267874-c7b5-47df-af6b-f2e434d45135",
                "created_at": new Date(),
                "updated_at": new Date(),
                "is_system": true,
                "__v": 0
            },
            upsert: true,
        }
    },]
    await Field.bulkWrite(bulkFields)

    let bulkRelation = [
        {
            updateOne: {
                filter: {
                    table_from: "user_login_table",
                    table_to: "client_type",
                },
                update: {
                    "id": "0c2889fc-95be-4b59-81f3-07e6903e9696",
                    "table_from": "user_login_table",
                    "field_from": "client_type_id",
                    "table_to": "client_type",
                    "field_to": "id",
                    "type": "Many2One",
                    "view_fields": [
                        "04d0889a-b9ba-4f5c-8473-c8447aab350d"
                    ],
                    "relation_field_slug": "",
                    "dynamic_tables": [],
                    "editable": false,
                    "auto_filters": [],
                    "is_user_id_default": false,
                    "cascadings": [],
                    "object_id_from_jwt": false,
                    "cascading_tree_table_slug": "",
                    "cascading_tree_field_slug": "",
                    "commit_id": "",
                    "is_system": false,
                    "relation_buttons": false,
                    "created_at": new Date(),
                    "updated_at": new Date(),
                    "is_system": true,
                    "__v": 0
                },
                upsert: true,
            },
        }
    ]
    await Relation.bulkWrite(bulkRelation)
}