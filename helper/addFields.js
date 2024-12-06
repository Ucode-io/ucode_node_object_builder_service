const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")

module.exports = async function (data) {
    try {
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
            "attributes": {
                "defaultValue": "TRUE",
                "label": "",
                "label_en": "Статус",
                "number_of_rounds": null
            },
            "default": "",
            "index": "string",
            "label": "Статус",
            "required": false,
            "slug": "status",
            "table_id": "1ab7fadc-1f2b-4934-879d-4e99772526ad",
            "type": "SWITCH",
            "id": "dd1cce54-2333-4556-97ab-3663c577a28c",
            "show_label": true,
            "is_system": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
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
            "id": "a2e13350-6e6c-43f3-8d08-14734e2401f9",
            "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
            "required": false,
            "slug": "table_slug",
            "label": "Таблица",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "show_label": {
                        "boolValue": false,
                        "kind": "boolValue"
                    },
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
                    }
                }
            },
            "is_visible": false,
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
        },{
            "id": "9cebaca0-5198-4369-8951-e5b8ce820b08",
            "table_id": "4c1f5c95-1528-4462-8d8c-cd377c23f7f7",
            "required": false,
            "slug": "not_use_in_tab",
            "label": "Не использовать в таб",
            "default": "",
            "type": "SWITCH",
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
                    "label_ru": {
                        "stringValue": "Не использовать в таб",
                        "kind": "stringValue"
                    },
                    "label_uz": {
                        "stringValue": "Tab da ishlatilmasin",
                        "kind": "stringValue"
                    },
                    "number_of_rounds": {
                        "nullValue": "NULL_VALUE",
                        "kind": "nullValue"
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
            "show_label": false,
            "enable_multilanguage": false,
            "hide_multilanguage": false,
            "label_uz": "",
            "label_en": "",
            "created_at": new Date(),
            "updated_at": new Date(),
            "is_system": true,
            "__v": 0
        }, {
            "id": "02257f5a-4d16-4d31-98f0-04eb7d1f7c96",
            "required": false,
            "slug": "add_field",
            "label": "Add Field",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        }, {
            "id": "dc177d03-8e3d-416e-979e-3b294a4168e8",
            "required": false,
            "slug": "pdf_action",
            "label": "PDF Action",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        }, {
            "id": "6f50514c-7ce9-43ed-8aa0-38840d1ab59f",
            "required": false,
            "slug": "add_filter",
            "label": "Add Filter",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        }, 	{
            "id": "7d7d3a79-6e24-4406-8382-22725d832f31",
            "required": false,
            "slug": "fix_column",
            "label": "Fix Column",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        },
        {
            "id": "278012fb-2e19-4096-8d33-a89b5c2bb2cc",
            "required": false,
            "slug": "tab_group",
            "label": "Tab Group",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        },
        {
            "id": "4f2ee4ef-5255-473f-900e-0446c7affe69",
            "required": false,
            "slug": "columns",
            "label": "Columns",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        },
        {
            "id": "2bfa9e02-56ee-489f-bd52-5fa872e01756",
            "required": false,
            "slug": "group",
            "label": "Group",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        },
        {
            "id": "d59fed1e-ac23-4409-bd7f-1a415e885876",
            "required": false,
            "slug": "excel_menu",
            "label": "Excel Menu",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        },
        {
            "id": "286ea44a-8684-4527-b0df-d73d04e29db8",
            "required": false,
            "slug": "search_button",
            "label": "Search Button",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        },
        {
            "id": "1649f334-94e8-4211-a60c-955817ce0147",
            "required": false,
            "slug": "field_filter",
            "label": "Field Filter",
            "default": "",
            "type": "SINGLE_LINE",
            "index": "string",
            "attributes": {
                "fields": {
                    "maxLength": {
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
                    }
                }
            },
            "is_visible": false,
            "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0
        },]
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
            id: { $in: ["074fcb3b-038d-483d-b390-ca69490fc4c3", "1ab7fadc-1f2b-4934-879d-4e99772526ad", "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea", "4c1f5c95-1528-4462-8d8c-cd377c23f7f7"] }
        }, { $set: { is_changed: true } })

    } catch (err) {
    }
}