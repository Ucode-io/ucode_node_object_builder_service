const { v4 } = require('uuid');
const mongoPool = require('../pkg/pool');
const staticFields = require('../initial_setups/field');
const viewStore = require('../storage/mongo/view');

async function initialSetupSmsTemplate(data) {
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
        const tableCollection = mongoConn.models["Table"];

        const tableId = "c5ef7f8f-f76b-4cb8-afd9-387f45d88a83";
        const table = await tableCollection.findOne({id: tableId})
        if (!table) {
            const tableRequest = {
                "id": "c5ef7f8f-f76b-4cb8-afd9-387f45d88a83",
                "label": "SMS Template",
                "slug": "sms_template",
                "description": "",
                "deleted_at": new Date('1970-01-01T18:00:00.000+00:00'),
                "show_in_menu": true,
                "is_changed": false,
                "icon": "comment-sms.svg",
                "subtitle_field_slug": "",
                "folder_id": "",
                "is_cached": false,
                "soft_delete": false,
                "order_by": false,
                "is_system": true,
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0 
            }
            await tableCollection.create(tableRequest)
        }
 
        const layout = await layoutCollection.findOne({ table_id: tableId });
        if (!layout) {
            const layoutId = v4();
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

            const tabId = v4();
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

            const sectionRequest = {
                "id": v4(),
                "attributes": null,
                "column": "",
                "created_at": new Date(),
                "fields": [
                    {
                        "id": "6f861c3b-65d0-4217-b1e0-86a9d709443d",
                        "column": 0,
                        "order": 0,
                        "field_name": "Text",
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
                                    "stringValue": "Text",
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
            }
            await sectionCollection.create(sectionRequest);
        }

        const role = await roleCollection.findOne({ name: "DEFAULT ADMIN", status: true, is_system: true });
        const recordPermissionResponse = await recordPermissionCollection.findOne({ role_id: role.guid, table_slug: "sms_template" });
        if (!recordPermissionResponse) {
            await recordPermissionCollection.create({
                "role_id": role.guid,
                "table_slug": "sms_template",
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
            });
        }

        const staticSmsTemplateFields = (await staticFields()).filter(field => field.table_id === tableId);

        const fieldsToCreate = [];
        const fieldPermissionsToCreate = [];

        for (const field of staticSmsTemplateFields) {
            const exist = await fieldsCollection.findOne({slug: field.slug, table_id: field.table_id})
            if (!exist) {fieldsToCreate.push(field)};
        }

        if (fieldsToCreate.length > 0) {
            await fieldsCollection.insertMany(fieldsToCreate);
        }

        for (const field of staticSmsTemplateFields) {
            const fieldPermission = await fieldPermissionCollection.findOne({
                role_id: role.guid,
                field_id: field.id,
                table_slug: "sms_template"
            });

            if (!fieldPermission) {
                fieldPermissionsToCreate.push({
                    role_id: role.guid,
                    field_id: field.id,
                    table_slug: "sms_template",
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
        const viewResponse = await viewCollection.findOne({table_slug: 'sms_template'})
        if (!viewResponse){
            let viewData = {};
            viewData.table_slug = "sms_template";
            viewData.type = "TABLE";
            viewData.app_id = "";
            viewData.project_id = data.project_id;
            viewData.id = v4();
            await viewStore.create(viewData)
        }
    } catch (error) { console.error(`Error when setup sms template table error: ${error}`) }
}

module.exports = initialSetupSmsTemplate