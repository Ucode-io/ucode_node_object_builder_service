
const { v4 } = require('uuid');
const mongoPool = require('../pkg/pool');
const viewStore = require('../storage/mongo/view');
const relationStore = require('../storage/mongo/relation');

async function initialSetupPerson(data) {
    try {
        if (!data || !data.project_id) {
            throw new Error("Invalid data or project_id.");
        }
        
        const mongoConn = await mongoPool.get(data.project_id);
        
        if (!mongoConn || !mongoConn.models) {
            throw new Error(`Mongo connection or models are unavailable for project_id: ${data.project_id}`);
        }
        
        const layoutCollection = mongoConn.models["Layout"];
        const tabCollection = mongoConn.models["Tab"]
        const sectionCollection = mongoConn.models["Section"]
        const roleCollection = mongoConn.models["role"]
        const recordPermissionCollection = mongoConn.models["record_permission"]
        const fieldsCollection = mongoConn.models["Field"];
        const fieldPermissionCollection = mongoConn.models["field_permission"];
        const relationCollection = mongoConn.models["Relation"]
        
        const tableId = "c1669d87-332c-41ee-84ac-9fb2ac9efdd5";
        const layout = await layoutCollection.findOne({ table_id: tableId });
        
        if (!layout) {
            const layoutId = v4()
            const layoutRequest = {
                id: layoutId,
                __v: 0,
                attributes: {
                    fields: { label_en: { stringValue: "New Layout", kind: "stringValue" } }
                },
                created_at: new Date(),
                icon: "",
                is_default: true,
                is_modal: false,
                is_visible_section: false,
                label: "New Layout",
                menu_id: "",
                order: 0,
                summary_fields: [],
                table_id: tableId,
                type: "SimpleLayout",
                updated_at: new Date()
            };
        
            await layoutCollection.create(layoutRequest);

            const tabId = v4()
            const tabRequest = {
                "id": tabId,
                "attributes": { "fields": { "label_en": { "stringValue": "", "kind": "stringValue" } } },
                "created_at": new Date(),
                "icon": "",
                "label": "",
                "layout_id": layoutId,
                "order": 0,
                "relation_id": "",
                "type": "section",
                "updated_at": new Date()
            }

            await tabCollection.create(tabRequest);


            const sectionRequest = [
                {
                    "id": v4(),
                    "attributes": null,
                    "column": "",
                    "created_at": new Date(),
                    "fields": [
                        {
                            "id": "f54d8076-4972-4067-9a91-c178c02c4273",
                            "column": 0,
                            "order": 0,
                            "field_name": "Full Name",
                            "relation_type": "",
                            "show_label": true,
                            "attributes": {
                                "fields": {
                                    "number_of_rounds": {
                                        "nullValue": "NULL_VALUE",
                                        "kind": "nullValue"
                                    },
                                    "defaultValue": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label_en": {
                                        "stringValue": "Full Name",
                                        "kind": "stringValue"
                                    }
                                }
                            },
                            "is_visible_layout": false
                        },
                        {
                            "id": "b92b9b8c-c138-4ce6-9260-b4452a7f5ae2",
                            "column": 0,
                            "order": 0,
                            "field_name": "Gender",
                            "relation_type": "",
                            "show_label": true,
                            "attributes": {
                                "fields": {
                                    "label": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label_en": {
                                        "stringValue": "Gender",
                                        "kind": "stringValue"
                                    },
                                    "number_of_rounds": {
                                        "nullValue": "NULL_VALUE",
                                        "kind": "nullValue"
                                    },
                                    "options": {
                                        "listValue": {
                                            "values": [
                                                {
                                                    "structValue": {
                                                        "fields": {
                                                            "id": {
                                                                "stringValue": "m5nhqhnwx94lr5tvlf",
                                                                "kind": "stringValue"
                                                            },
                                                            "label": {
                                                                "stringValue": "Male",
                                                                "kind": "stringValue"
                                                            },
                                                            "value": {
                                                                "stringValue": "male",
                                                                "kind": "stringValue"
                                                            },
                                                            "color": {
                                                                "stringValue": "",
                                                                "kind": "stringValue"
                                                            },
                                                            "icon": {
                                                                "stringValue": "",
                                                                "kind": "stringValue"
                                                            }
                                                        }
                                                    },
                                                    "kind": "structValue"
                                                },
                                                {
                                                    "structValue": {
                                                        "fields": {
                                                            "color": {
                                                                "stringValue": "",
                                                                "kind": "stringValue"
                                                            },
                                                            "icon": {
                                                                "stringValue": "",
                                                                "kind": "stringValue"
                                                            },
                                                            "id": {
                                                                "stringValue": "m5nhqlmt8ivnl7ijvr",
                                                                "kind": "stringValue"
                                                            },
                                                            "label": {
                                                                "stringValue": "Female",
                                                                "kind": "stringValue"
                                                            },
                                                            "value": {
                                                                "stringValue": "female",
                                                                "kind": "stringValue"
                                                            }
                                                        }
                                                    },
                                                    "kind": "structValue"
                                                },
                                                {
                                                    "structValue": {
                                                        "fields": {
                                                            "id": {
                                                                "stringValue": "m5nibeydyfhz3y2lfk",
                                                                "kind": "stringValue"
                                                            },
                                                            "label": {
                                                                "stringValue": "Other",
                                                                "kind": "stringValue"
                                                            },
                                                            "value": {
                                                                "stringValue": "other",
                                                                "kind": "stringValue"
                                                            },
                                                            "color": {
                                                                "stringValue": "",
                                                                "kind": "stringValue"
                                                            },
                                                            "icon": {
                                                                "stringValue": "",
                                                                "kind": "stringValue"
                                                            }
                                                        }
                                                    },
                                                    "kind": "structValue"
                                                }
                                            ]
                                        },
                                        "kind": "listValue"
                                    },
                                    "defaultValue": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "has_color": {
                                        "boolValue": false,
                                        "kind": "boolValue"
                                    },
                                    "is_multiselect": {
                                        "boolValue": false,
                                        "kind": "boolValue"
                                    }
                                }
                            },
                            "is_visible_layout": false
                        },
                        {
                            "id": "e5a2a21e-a9e2-4e6d-87e8-57b8dd837d48",
                            "column": 0,
                            "order": 0,
                            "field_name": "Date Of Birth",
                            "relation_type": "",
                            "show_label": true,
                            "attributes": {
                                "fields": {
                                    "label": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label_en": {
                                        "stringValue": "Date of birth",
                                        "kind": "stringValue"
                                    },
                                    "number_of_rounds": {
                                        "nullValue": "NULL_VALUE",
                                        "kind": "nullValue"
                                    },
                                    "defaultValue": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    }
                                }
                            },
                            "is_visible_layout": false
                        }
                    ],
                    "icon": "",
                    "is_summary_section": false,
                    "label": "",
                    "order": 0,
                    "tab_id": tabId,
                    "updated_at": new Date()
                },
                {
                    "id": v4(),
                    "attributes": null,
                    "column": "",
                    "created_at": new Date(),
                    "fields": [
                        {
                            "id": "c5b09b80-528d-4987-9105-a2be539255ee",
                            "column": 0,
                            "order": 0,
                            "field_name": "Image",
                            "relation_type": "",
                            "show_label": true,
                            "attributes": {
                                "fields": {
                                    "defaultValue": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label_en": {
                                        "stringValue": "Image",
                                        "kind": "stringValue"
                                    },
                                    "number_of_rounds": {
                                        "nullValue": "NULL_VALUE",
                                        "kind": "nullValue"
                                    },
                                    "path": {
                                        "stringValue": "Media",
                                        "kind": "stringValue"
                                    }
                                }
                            },
                            "is_visible_layout": false
                        },
                        {
                            "id": "eb3deeb7-6d34-4e24-b65a-f03e09efd0cf",
                            "column": 0,
                            "order": 0,
                            "field_name": "Phone Number",
                            "relation_type": "",
                            "show_label": true,
                            "attributes": {
                                "fields": {
                                    "defaultValue": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label_en": {
                                        "stringValue": "Phone Number",
                                        "kind": "stringValue"
                                    },
                                    "number_of_rounds": {
                                        "nullValue": "NULL_VALUE",
                                        "kind": "nullValue"
                                    }
                                }
                            },
                            "is_visible_layout": false
                        },
                        {
                            "id": "d868638d-35d6-4992-8216-7b2f479f722e",
                            "column": 0,
                            "order": 0,
                            "field_name": "Email",
                            "relation_type": "",
                            "show_label": true,
                            "attributes": {
                                "fields": {
                                    "defaultValue": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label": {
                                        "stringValue": "",
                                        "kind": "stringValue"
                                    },
                                    "label_en": {
                                        "stringValue": "Email",
                                        "kind": "stringValue"
                                    },
                                    "number_of_rounds": {
                                        "nullValue": "NULL_VALUE",
                                        "kind": "nullValue"
                                    }
                                }
                            },
                            "is_visible_layout": false
                        }
                    ],
                    "icon": "",
                    "is_summary_section": false,
                    "label": "",
                    "order": 1,
                    "tab_id": tabId,
                    "updated_at": new Date()
                }
            ]

            await sectionCollection.insertMany(sectionRequest)
        }

        const role = await roleCollection.findOne({ name: "DEFAULT ADMIN", status: true })
        const recordPermissionResponse = await recordPermissionCollection.findOne({ role_id: role.guid, table_slug: "person" })
      
        if (!recordPermissionResponse){
            await recordPermissionCollection.create({
                "role_id": role.guid,
                "table_slug": "person",
                "add_field": "No",
                "add_filter": "Yes",
                "automation": "No",
                "columns": "Yes",
                "createdAt": new Date(),
                "delete": "Yes",
                "delete_all": "No",
                "excel_menu": "Yes",
                "field_filter": "Yes",
                "fix_column": "Yes",
                "group": "Yes",
                "guid": v4(),
                "is_have_condition": false,
                "is_public": false,
                "language_btn": "No",
                "pdf_action": "No",
                "read": "Yes",
                "search_button": "Yes",
                "settings": "No",
                "share_modal": "No",
                "tab_group": "Yes",
                "update": "Yes",
                "updatedAt": new Date(),
                "view_create": "No",
                "write": "Yes"
            })
        }

        const fields = await fieldsCollection.find( { table_id: tableId } );
        const fieldUserIdAuth = await fieldsCollection.findOne( { slug: "user_id_auth", table_id: tableId } )
        if (!fieldUserIdAuth) {
            await fieldsCollection.create({
                id: v4(),
                table_id: tableId,
                required: false,
                slug: "user_id_auth",
                label: "User ID Auth",
                default: "",
                type: "SINGLE_LINE",
                index: "string",
                attributes: {
                    fields: {
                        label_en: { stringValue: "User Id Auth", kind: "stringValue" },
                        label: { stringValue: "", kind: "stringValue" },
                        defaultValue: { stringValue: "", kind: "stringValue" }
                    }
                },
                is_visible: false,
                is_system: true,
                autofill_field: "",
                autofill_table: "",
                created_at: new Date(),
                updated_at: new Date(),
                __v: 0
            })
        }

        const fieldPermissionsToCreate = [];

        for (const field of fields) {
            const fieldPermission = await fieldPermissionCollection.findOne({
                role_id: role.guid,
                field_id: field.id,
                table_slug: "person"
            });

            if (!fieldPermission) {
                fieldPermissionsToCreate.push({
                    role_id: role.guid,
                    field_id: field.id,
                    table_slug: "person",
                    edit_permission: true,
                    view_permission: true,
                    label: field?.label,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    guid: v4()
                });
            }
        }

        if (fieldPermissionsToCreate.length > 0) {
            await fieldPermissionCollection.insertMany(fieldPermissionsToCreate);
        }

        const viewCollection = mongoConn.models["View"]
        const viewResponse = await viewCollection.findOne({table_slug: 'person'})
        if (!viewResponse){
            let viewData = {};
            viewData.table_slug = "person";
            viewData.type = "TABLE";
            viewData.app_id = "";
            viewData.project_id = data.project_id;
            viewData.id = v4();
            await viewStore.create(viewData)
        }

        const clientTypeRelation = await relationCollection.findOne( { table_from: "person", table_to: "client_type" } )
        if (!clientTypeRelation) {
            await relationStore.create({
                id: "604bed17-4de6-47f7-a4d7-990be4194a93",
                table_from: 'person',
                table_to: "client_type",
                type: "Many2One",
                view_fields: ["04d0889a-b9ba-4f5c-8473-c8447aab350d"],
                relation_table_slug: "client_type",
                label: "Client Type",
                project_id: data.project_id,
                attributes: {
                    fields: {
                        label_en: { stringValue: "Client Type", kind: "stringValue" },
                        label_to_en: { stringValue: "Person", kind: "stringValue" },
                        table_editable: { boolValue: false, kind: "boolValue" },
                        enable_multi_language: { boolValue: false, kind: "boolValue" }
                    }
                }
            })
        }

        const roleRelation = await relationCollection.findOne( { table_from: "person", table_to: "role" } )
        if (!roleRelation) {
            await relationStore.create({
                id: "0ecb08c1-0558-4101-8101-df304ac06ed9",
                table_from: "person",
                table_to: 'role',
                type: 'Many2One',
                view_fields: ['c12adfef-2991-4c6a-9dff-b4ab8810f0df'],
                relation_table_slug: 'role',
                label: 'Role',
                project_id: data.project_id,
                attributes: {
                    fields: {
                        label_en: { stringValue: "Role", kind: "stringValue" },
                        label_to_en: { stringValue: "Person", kind: "stringValue" },
                        table_editable: { boolValue: false, kind: "boolValue" },
                        enable_multi_language: { boolValue: false, kind: "boolValue" },
                    }
                },
                auto_filters: [ { field_to: "client_type_id", field_from: "client_type_id" } ]
            })
        }

    } catch (error) { console.error("error", error) }
}

module.exports = initialSetupPerson