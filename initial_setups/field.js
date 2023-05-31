async function createField() {
    let fields = [{
        "id": "d8127cf2-2d60-474e-94ba-317d3b1ba18a",
        "required": false,
        "slug": "table_slug",
        "label": "Название таблица",
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
                "creatable": {
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
        "table_id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "076c519a-5503-4bff-99f1-c741ed7d47b8",
        "required": false,
        "slug": "relation_id",
        "label": "Ид свяьза",
        "default": "",
        "type": "SINGLE_LINE",
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
        "__v": 0
    }, {
        "id": "c5962e1c-2687-46a5-b2dd-d46d41a038c1",
        "required": false,
        "slug": "view_permission",
        "label": "Разрешение на просмотр",
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
        "__v": 0
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "a73fd453-3c21-4ab8-9e21-59d85acd106c",
        "table_id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
        "required": false,
        "slug": "role_id",
        "label": "FROM view_relation_permission TO role",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "158213ef-f38d-4c0d-b9ec-815e4d27db7e",
        "id": "6f344830-819c-40a3-a255-f11cdb515c2e",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "9d53673d-4df3-4679-91be-8a787bdff724",
        "required": false,
        "slug": "table_slug",
        "label": "Table Slug",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
            "fields": {
                "placeholder": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
                "showTooltip": {
                    "boolValue": false,
                    "kind": "boolValue"
                },
                "maxLength": {
                    "stringValue": "",
                    "kind": "stringValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "546320ae-8d9f-43cb-afde-3df5701e4b49",
        "required": false,
        "slug": "icon",
        "label": "Icon",
        "default": "",
        "type": "ICON",
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
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "a9767595-8863-414e-9220-f6499def0276",
        "required": false,
        "slug": "view_slug",
        "label": "View Slug",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
            "fields": {
                "placeholder": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
                "showTooltip": {
                    "boolValue": false,
                    "kind": "boolValue"
                },
                "maxLength": {
                    "stringValue": "",
                    "kind": "stringValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "b73c268c-9b91-47e4-9cb8-4f1d4ad14605",
        "required": false,
        "slug": "view_label",
        "label": "View label",
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
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "71a33f28-002e-42a9-95fe-934a1f04b789",
        "required": false,
        "slug": "type",
        "label": "Тип",
        "default": "",
        "type": "MULTISELECT",
        "index": "string",
        "attributes": {
            "fields": {
                "options": {
                    "listValue": {
                        "values": []
                    },
                    "kind": "listValue"
                },
                "placeholder": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
                "showTooltip": {
                    "boolValue": false,
                    "kind": "boolValue"
                },
                "maxLength": {
                    "stringValue": "",
                    "kind": "stringValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "c71928df-22d1-408c-8d63-7784cbec4a1d",
        "required": false,
        "slug": "name",
        "label": "Название",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
            "fields": {
                "showTooltip": {
                    "boolValue": false,
                    "kind": "boolValue"
                },
                "maxLength": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
                "placeholder": {
                    "stringValue": "",
                    "kind": "stringValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "fbcf919a-25b8-486b-a110-342c8c47385f",
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "required": false,
        "slug": "client_type_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "65a2d42f-5479-422f-84db-1a98547dfa04",
        "id": "f6962da4-bc72-4236-ac7b-18589c2fc029",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "c12adfef-2991-4c6a-9dff-b4ab8810f0df",
        "required": false,
        "slug": "name",
        "label": "Название роли",
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
        "table_id": "1ab7fadc-1f2b-4934-879d-4e99772526ad",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "3bb6863b-5024-4bfb-9fa0-6ed5bf8d2406",
        "table_id": "1ab7fadc-1f2b-4934-879d-4e99772526ad",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "1ab7fadc-1f2b-4934-879d-4e99772526ad",
        "required": false,
        "slug": "project_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "a56d0ad8-4645-42d8-9fbb-77e22526bd17",
        "id": "123cd75b-2da5-458f-8020-8176a18b54ce",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "1ab7fadc-1f2b-4934-879d-4e99772526ad",
        "required": false,
        "slug": "client_platform_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "ca008469-cfe2-4227-86db-efdf69680310",
        "id": "cb677e25-ddb3-4a64-a0cd-5aa6653417ed",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "1ab7fadc-1f2b-4934-879d-4e99772526ad",
        "required": false,
        "slug": "client_type_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "8ab28259-800d-4079-8572-a0f033d70e35",
        "id": "110055ac-75ab-4c1f-ae35-67098d1816a5",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "87ddadf0-689b-4285-9fc7-5cb76bdd4a7c",
        "required": false,
        "slug": "expires_at",
        "label": "Срок годности",
        "default": "",
        "type": "DATE_TIME",
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
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    },  {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "2a77fd05-5278-4188-ba34-a7b8d13e2e51",
        "table_id": "2546e042-af2f-4cef-be7c-834e6bde951c",
        "is_system": true,
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "2546e042-af2f-4cef-be7c-834e6bde951c",
        "is_system": true,
        "required": false,
        "slug": "project_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "6d2f94cb-0de4-455e-8dfc-97800eac7579",
        "id": "be11f4ac-1f91-4e04-872d-31cef96954e9",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "2546e042-af2f-4cef-be7c-834e6bde951c",
        "is_system": true,
        "required": false,
        "slug": "client_type_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "8f123dec-dfe4-4b89-956c-f607c84a84bd",
        "id": "5ca9db39-f165-4877-a191-57b5e8fedaf5",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "2546e042-af2f-4cef-be7c-834e6bde951c",
        "is_system": true,
        "required": false,
        "slug": "role_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "63b54109-5476-43c1-bf26-24e2266a33f0",
        "id": "bd5f353e-52d6-4b07-946c-678534a624ec",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "f932bf71-9049-462b-9342-8347bca7598d",
        "required": false,
        "slug": "update",
        "label": "Изменение",
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
        "id": "9bdbb8eb-334b-4515-87dc-20abd0da129a",
        "required": false,
        "slug": "table_slug",
        "label": "Название таблица",
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
        "id": "1e71486b-1438-4170-8883-50b505b8bb14",
        "required": false,
        "slug": "write",
        "label": "Написать",
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
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "4d1bb99b-d2f0-4ac7-8c50-2f5dd7932755",
        "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "27355d70-1c11-4fb9-9192-a1fffd93d9db",
        "required": false,
        "slug": "read",
        "label": "Чтение",
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
        "id": "d95c1242-63ab-45c1-bd23-86f23ee72971",
        "required": false,
        "slug": "delete",
        "label": "Удаление",
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
        "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
        "required": false,
        "slug": "role_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "82e93baf-2e02-432a-942b-2c93cbe26b89",
        "id": "8e748044-1b00-485c-b445-63e44380a6b1",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "5f099f9f-8217-4790-a8ee-954ec165b8d8",
        "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
        "required": false,
        "slug": "is_have_condition",
        "label": "Есть условия",
        "default": "",
        "type": "SWITCH",
        "index": "string",
        "attributes": {
            "fields": {
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
                },
                "disabled": {
                    "boolValue": false,
                    "kind": "boolValue"
                }
            }
        },
        "is_visible": false,
        "autofill_field": "",
        "autofill_table": "",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "37137f5f-ef9b-4710-a6df-fb920750fdfb",
        "required": false,
        "slug": "name",
        "label": "Название",
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
        "table_id": "373e9aae-315b-456f-8ec3-0851cad46fbf",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "dfbf6a89-9c78-4922-9a00-0e1555c23ece",
        "required": false,
        "slug": "domain",
        "label": "Домен проекта",
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
        "table_id": "373e9aae-315b-456f-8ec3-0851cad46fbf",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "8265459c-ab41-45b5-a79d-cbfa299ddaa7",
        "table_id": "373e9aae-315b-456f-8ec3-0851cad46fbf",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "8368fc76-0e80-409c-b64e-2275304411d8",
        "required": false,
        "slug": "table_slug",
        "label": "Название таблица",
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
        "table_id": "4c1f5c95-1528-4462-8d8c-cd377c23f7f7",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "6d5d18cd-255d-49fd-a08e-5a6b0f1b093f",
        "required": false,
        "slug": "custom_field",
        "label": "Пользавательские полья",
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
        "table_id": "4c1f5c95-1528-4462-8d8c-cd377c23f7f7",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "957ffe32-714a-41d2-9bd8-e6b6b30fef67",
        "required": false,
        "slug": "object_field",
        "label": "Полья объекты",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
            "fields": {
                "showTooltip": {
                    "boolValue": false,
                    "kind": "boolValue"
                },
                "maxLength": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
                "placeholder": {
                    "stringValue": "",
                    "kind": "stringValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "4c1f5c95-1528-4462-8d8c-cd377c23f7f7",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "2ca6eec7-faea-4afd-a75f-980c18164f3c",
        "table_id": "4c1f5c95-1528-4462-8d8c-cd377c23f7f7",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "4c1f5c95-1528-4462-8d8c-cd377c23f7f7",
        "required": false,
        "slug": "role_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "697fbd16-97d8-4233-ab21-4ce12dd6c5c6",
        "id": "a1ece772-a8e0-41ae-8060-e1f667d0d96e",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "c818bc89-c2e9-4181-9db4-06fdf837d6e2",
        "required": false,
        "slug": "name",
        "label": "Название платформы",
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
        "table_id": "53edfff0-2a31-4c73-b230-06a134afa50b",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "948500db-538e-412b-ba36-09f5e9f0eccc",
        "required": false,
        "slug": "subdomain",
        "label": "Субдомен платформы",
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
        "table_id": "53edfff0-2a31-4c73-b230-06a134afa50b",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "6c812f3d-1aae-4b9e-8c28-55019ede57f8",
        "table_id": "53edfff0-2a31-4c73-b230-06a134afa50b",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "53edfff0-2a31-4c73-b230-06a134afa50b",
        "required": false,
        "slug": "project_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "c1492b03-8e76-4a09-9961-f61d413dbe68",
        "id": "f7220ec5-d9cb-485b-9652-f3429132375d",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "53edfff0-2a31-4c73-b230-06a134afa50b",
        "required": false,
        "slug": "client_type_ids",
        "label": "IT'S RELATION",
        "type": "LOOKUPS",
        "is_visible": true,
        "relation_id": "426a0cd6-958d-4317-bf23-3b4ea4720e53",
        "id": "d95156ba-d443-4c95-8383-c122747330c5",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "1e39a65d-9709-4c5a-99e4-dde67191d95a",
        "required": false,
        "slug": "custom_event_id",
        "label": "Ид действия",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
            "fields": {
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
        "table_id": "5af2bfb2-6880-42ad-80c8-690e24a2523e",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "34abee63-37ad-48c1-95d2-f4a032c373a1",
        "required": false,
        "slug": "table_slug",
        "label": "Название таблица",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
            "fields": {
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
        "table_id": "5af2bfb2-6880-42ad-80c8-690e24a2523e",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "b84f052c-c407-48c5-a4bf-6bd54869fbd7",
        "required": false,
        "slug": "permission",
        "label": "Разрешение",
        "default": "",
        "type": "SWITCH",
        "index": "string",
        "attributes": {
            "fields": {
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
        "table_id": "5af2bfb2-6880-42ad-80c8-690e24a2523e",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "cf504dda-a34a-4422-843b-afaa32efbe49",
        "table_id": "5af2bfb2-6880-42ad-80c8-690e24a2523e",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "5af2bfb2-6880-42ad-80c8-690e24a2523e",
        "required": false,
        "slug": "role_id",
        "label": "FROM action_permission TO role",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "d522a2ac-7fb4-413d-b5bb-8d1d34b65b98",
        "id": "f58a6d67-7254-474c-af2a-052596bb0513",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "d02ddb83-ad98-47f5-bc0a-6ee7586d9a8e",
        "required": false,
        "slug": "login_strategy",
        "label": "Login strategy",
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
        "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "f5486957-e804-4050-a3c5-cfdcdaca0a16",
        "required": false,
        "slug": "table_slug",
        "label": "Table Slug",
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
        "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "fbc9b3e9-0507-48f5-9772-d42febfb4d30",
        "required": false,
        "slug": "login_view",
        "label": "Login view",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
            "fields": {
                "placeholder": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
                "showTooltip": {
                    "boolValue": false,
                    "kind": "boolValue"
                },
                "maxLength": {
                    "stringValue": "",
                    "kind": "stringValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "5591515f-8212-4bd5-b13b-fffd9751e9ce",
        "required": false,
        "slug": "login_label",
        "label": "Login label",
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
        "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "35ddf13d-d724-42ab-a1bb-f3961c7db9d6",
        "required": false,
        "slug": "password_view",
        "label": "Password view",
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
        "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "7ab42774-6ca9-4e10-a71b-77871009e0a2",
        "required": false,
        "slug": "object_id",
        "label": "Ид обьеткта",
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
        "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "276c0e0c-2b79-472a-bcdf-ac0eed115ebe",
        "required": false,
        "slug": "password_label",
        "label": "Password label",
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
        "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "14e3ed9a-384e-45ac-897f-0fb4174adfaf",
        "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "required": false,
        "slug": "client_type_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "79bdd075-eef0-48d1-b763-db8dfd819043",
        "id": "d5fda673-95b2-492a-97c2-afd0466f1e32",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "7587ed1d-a8b9-4aa8-b845-56dbb9333e25",
        "required": false,
        "slug": "field_id",
        "label": "Ид поля",
        "default": "",
        "type": "SINGLE_LINE",
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
                }
            }
        },
        "is_visible": false,
        "table_id": "961a3201-65a4-452a-a8e1-7c7ba137789c",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "27634c7a-1de8-4d54-9f57-5ff7c77d0af9",
        "required": false,
        "slug": "table_slug",
        "label": "Название таблица",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
            "fields": {
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
        "table_id": "961a3201-65a4-452a-a8e1-7c7ba137789c",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "00787831-04b4-4a08-b74d-14f80a219b86",
        "required": false,
        "slug": "view_permission",
        "label": "Разрешение на просмотр",
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
                }
            }
        },
        "is_visible": false,
        "table_id": "961a3201-65a4-452a-a8e1-7c7ba137789c",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "9ae553a2-edca-41f7-ba8a-557dc24cb74a",
        "required": false,
        "slug": "edit_permission",
        "label": "Изменить разрешение",
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
                }
            }
        },
        "is_visible": false,
        "table_id": "961a3201-65a4-452a-a8e1-7c7ba137789c",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "autofill_field": "",
        "autofill_table": "",
        "relation_id": ""
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "6040f51f-7b41-4e7a-87b1-b48286a00bea",
        "table_id": "961a3201-65a4-452a-a8e1-7c7ba137789c",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "961a3201-65a4-452a-a8e1-7c7ba137789c",
        "required": false,
        "slug": "role_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "8283449e-7978-4e75-83d6-1b6f3a194683",
        "id": "1267fb0d-2788-4171-ab69-b9573d3974a2",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "285ceb40-6267-4f5e-9327-f75fe79e8bfe",
        "table_id": "961a3201-65a4-452a-a8e1-7c7ba137789c",
        "required": false,
        "slug": "label",
        "label": "Название поля",
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
        "autofill_field": "",
        "autofill_table": "",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "04d0889a-b9ba-4f5c-8473-c8447aab350d",
        "required": false,
        "slug": "name",
        "label": "Название типа",
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
        "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "d99ac785-1d1a-49d8-af23-4d92774d15b6",
        "required": false,
        "slug": "confirm_by",
        "label": "Подтверждено",
        "default": "",
        "type": "PICK_LIST",
        "index": "string",
        "attributes": {
            "fields": {
                "placeholder": {
                    "stringValue": "",
                    "kind": "stringValue"
                },
                "showTooltip": {
                    "boolValue": false,
                    "kind": "boolValue"
                },
                "options": {
                    "listValue": {
                        "values": [
                            {
                                "stringValue": "UNDECIDED",
                                "kind": "stringValue"
                            },
                            {
                                "stringValue": "PHONE",
                                "kind": "stringValue"
                            },
                            {
                                "stringValue": "EMAIL",
                                "kind": "stringValue"
                            }
                        ]
                    },
                    "kind": "listValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "763a0625-59d7-4fd1-ad4b-7ef303c3aadf",
        "required": false,
        "slug": "self_register",
        "label": "Саморегистрация",
        "default": "",
        "type": "SWITCH",
        "index": "string",
        "attributes": {
            "fields": {
                "showTooltip": {
                    "boolValue": false,
                    "kind": "boolValue"
                }
            }
        },
        "is_visible": false,
        "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "5bcd3857-9f9e-4ab9-97da-52dbdcb3e5d7",
        "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "id": "d37e08d6-f7d0-441e-b7af-6034e5c2a77f",
        "required": false,
        "slug": "self_recover",
        "label": "Самовосстановление",
        "default": "",
        "type": "SWITCH",
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
        "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
        "required": false,
        "slug": "project_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "094c33df-5556-45f3-a74c-7f589412bcc8",
        "id": "faa90368-d201-4322-82b7-e370f788d248",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
        "required": false,
        "slug": "client_platform_ids",
        "label": "IT'S RELATION",
        "type": "LOOKUPS",
        "is_visible": true,
        "relation_id": "426a0cd6-958d-4317-bf23-3b4ea4720e53",
        "id": "4eb81779-7529-420f-991f-a194e2010563",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    },{
        "id": "834df8ef-edb7-4170-996c-9bd5431d9a62",
        "required": false,
        "slug": "table_slug",
        "label": "Таблица",
        "default": "",
        "type": "SINGLE_LINE",
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
              "stringValue": "table_slug",
              "kind": "stringValue"
            },
            "showTooltip": {
              "boolValue": false,
              "kind": "boolValue"
            }
          }
        },
        "is_visible": false,
        "table_id": "08972256-30fb-4d75-b8cf-940d8c4fc8ac",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "id": "5dda58a1-84ac-4c50-8993-02e2cefcb29a",
        "required": false,
        "slug": "size",
        "label": "Размер",
        "default": "",
        "type": "MULTISELECT",
        "index": "string",
        "attributes": {
          "fields": {
            "icon": {
              "stringValue": "",
              "kind": "stringValue"
            },
            "options": {
              "listValue": {
                "values": [
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
                          "stringValue": "l8pqwm99uvafrgkle38",
                          "kind": "stringValue"
                        },
                        "label": {
                          "stringValue": "A4",
                          "kind": "stringValue"
                        },
                        "value": {
                          "stringValue": "A4",
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
                          "stringValue": "l8pqwp8kktxrtw6xebi",
                          "kind": "stringValue"
                        },
                        "label": {
                          "stringValue": "A5",
                          "kind": "stringValue"
                        },
                        "value": {
                          "stringValue": "A5",
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
            "placeholder": {
              "stringValue": "size",
              "kind": "stringValue"
            },
            "showTooltip": {
              "boolValue": false,
              "kind": "boolValue"
            },
            "has_color": {
              "boolValue": false,
              "kind": "boolValue"
            },
            "has_icon": {
              "boolValue": false,
              "kind": "boolValue"
            },
            "is_multiselect": {
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
            }
          }
        },
        "is_visible": false,
        "table_id": "08972256-30fb-4d75-b8cf-940d8c4fc8ac",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "id": "9772b679-33ec-4004-b527-317a1165575e",
        "required": false,
        "slug": "title",
        "label": "Название",
        "default": "",
        "type": "SINGLE_LINE",
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
            }
          }
        },
        "is_visible": false,
        "table_id": "08972256-30fb-4d75-b8cf-940d8c4fc8ac",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "id": "98279b02-10c0-409e-8303-14224fd76ec6",
        "required": false,
        "slug": "html",
        "label": "HTML",
        "default": "",
        "type": "SINGLE_LINE",
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
              "stringValue": "address-card.svg",
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
        "table_id": "08972256-30fb-4d75-b8cf-940d8c4fc8ac",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "494e1ad3-fce8-4e6c-921f-850d0ec73cc4",
        "table_id": "08972256-30fb-4d75-b8cf-940d8c4fc8ac",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "table_id": "08972256-30fb-4d75-b8cf-940d8c4fc8ac",
        "required": false,
        "slug": "doctors_ids",
        "label": "FROM doctors TO template",
        "type": "LOOKUPS",
        "is_visible": true,
        "relation_id": "4d5f933c-3d46-4303-95aa-31daccef96cf",
        "id": "fd7f0fde-3de7-4073-b64d-bd3076c6e3fb",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "id": "a99106a9-32dc-446b-9850-8713d687804a",
        "required": false,
        "slug": "date",
        "label": "Время создание",
        "default": "",
        "type": "DATE_TIME",
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
            }
          }
        },
        "is_visible": false,
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "id": "b1bb10c9-d399-4baa-98d1-0a04171ff5d1",
        "required": false,
        "slug": "tags",
        "label": "Теги",
        "default": "",
        "type": "MULTISELECT",
        "index": "string",
        "attributes": {
          "fields": {
            "showTooltip": {
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
            "has_icon": {
              "boolValue": false,
              "kind": "boolValue"
            },
            "icon": {
              "stringValue": "",
              "kind": "stringValue"
            },
            "is_multiselect": {
              "boolValue": false,
              "kind": "boolValue"
            },
            "placeholder": {
              "stringValue": "",
              "kind": "stringValue"
            },
            "creatable": {
              "boolValue": false,
              "kind": "boolValue"
            },
            "has_color": {
              "boolValue": false,
              "kind": "boolValue"
            },
            "options": {
              "listValue": {
                "values": [
                  {
                    "structValue": {
                      "fields": {
                        "value": {
                          "stringValue": "diagnostic",
                          "kind": "stringValue"
                        },
                        "color": {
                          "stringValue": "",
                          "kind": "stringValue"
                        },
                        "icon": {
                          "stringValue": "",
                          "kind": "stringValue"
                        },
                        "id": {
                          "stringValue": "l8pr3dqxbq4nlviy49h",
                          "kind": "stringValue"
                        },
                        "label": {
                          "stringValue": "Диагностика",
                          "kind": "stringValue"
                        }
                      }
                    },
                    "kind": "structValue"
                  },
                  {
                    "structValue": {
                      "fields": {
                        "value": {
                          "stringValue": "consultation",
                          "kind": "stringValue"
                        },
                        "color": {
                          "stringValue": "",
                          "kind": "stringValue"
                        },
                        "icon": {
                          "stringValue": "",
                          "kind": "stringValue"
                        },
                        "id": {
                          "stringValue": "l8pr3u7pgyf1lz5urgg",
                          "kind": "stringValue"
                        },
                        "label": {
                          "stringValue": "Консультация",
                          "kind": "stringValue"
                        }
                      }
                    },
                    "kind": "structValue"
                  },
                  {
                    "structValue": {
                      "fields": {
                        "icon": {
                          "stringValue": "",
                          "kind": "stringValue"
                        },
                        "id": {
                          "stringValue": "lao5vpro3wkmmqhss0p",
                          "kind": "stringValue"
                        },
                        "label": {
                          "stringValue": "Лаборатория",
                          "kind": "stringValue"
                        },
                        "value": {
                          "stringValue": "laboratory",
                          "kind": "stringValue"
                        },
                        "color": {
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
            }
          }
        },
        "is_visible": false,
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "__v": 0,
        "autofill_field": "",
        "autofill_table": "",
        "relation_id": "",
        "unique": false
      },{
        "id": "61870278-3195-4874-9c0c-28104bbfb19a",
        "required": false,
        "slug": "type",
        "label": "Тип файла",
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
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "id": "afb99f72-106d-4939-b831-9e4b025afb9f",
        "required": false,
        "slug": "name",
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
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "id": "b7e00be4-70f2-4a57-bf77-91d3834d0520",
        "required": false,
        "slug": "size",
        "label": "Размер",
        "default": "",
        "type": "NUMBER",
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
            }
          }
        },
        "is_visible": false,
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "id": "5c0efd79-60f4-455b-b1df-e51e3b56b140",
        "required": false,
        "slug": "file_link",
        "label": "Линк фaйла",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
          "fields": {
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
            },
            "defaultValue": {
              "stringValue": "",
              "kind": "stringValue"
            },
            "disabled": {
              "boolValue": false,
              "kind": "boolValue"
            }
          }
        },
        "is_visible": false,
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "autofill_field": "",
        "autofill_table": "",
        "relation_id": "",
        "unique": false
      },{
        "required": false,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "a9199d67-72bc-42b0-bcd3-04d8a18b9441",
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "required": false,
        "slug": "patients_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "ccc39e6d-f3f6-43b0-82f3-eee3044d25f8",
        "id": "ef53a742-3442-4225-8a9c-90d59ab9b53c",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "required": false,
        "slug": "doctors_id",
        "label": "IT'S RELATION",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "c257fe1d-488b-4d0f-a657-b0b729811a56",
        "id": "69652ef4-71e8-43dc-8cd5-dd0572f6b9a7",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "required": false,
        "slug": "cashbox_id",
        "label": "FROM file TO cash_transaction",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "dae09c03-247a-4353-8f17-fc35e545a44e",
        "id": "4be7708d-e8af-4687-ad3d-8df0f7be1566",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "attributes": {
          "fields": {
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
        "autofill_field": "",
        "autofill_table": "",
        "default": "",
        "index": "string"
      },{
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "required": false,
        "slug": "branches_id",
        "label": "FROM file TO branches",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "e7604b67-027f-4314-a270-86db31e33887",
        "id": "bd35cc88-e671-41a6-a334-554b88a20604",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "required": false,
        "slug": "specialities_id",
        "label": "FROM file TO specialities",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "df8b1c3b-7f1a-43f4-8368-b37f191c888d",
        "id": "673a828f-3955-40f7-8968-dfee6eb6442d",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
        "required": false,
        "slug": "news_id",
        "label": "FROM file TO news",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "89afc0b2-431b-4243-a22f-53539f50deff",
        "id": "bbe64ec5-9b8b-4b8a-886f-fa96342f29ab",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      }, {
        "id": "eb0c1ac2-eff3-4ca2-b383-9c801a2992ff",
        "table_id": "4c1f5c95-1528-4462-8d8c-cd377c23f7f7",
        "required": false,
        "slug": "method",
        "label": "Метод",
        "default": "",
        "type": "SINGLE_LINE",
        "index": "string",
        "attributes": {
          "fields": {
            "showTooltip": {
              "boolValue": false,
              "kind": "boolValue"
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
            "placeholder": {
              "stringValue": "",
              "kind": "stringValue"
            }
          }
        },
        "is_visible": false,
        "autofill_field": "",
        "autofill_table": "",
        "unique": false,
        "automatic": false,
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      },{
        "id": "7ae7cc2b-d0eb-4e76-9a9f-8b72c8dc9a71",
        "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
        "required": false,
        "slug": "is_public",
        "label": "Общедоступ",
        "default": "",
        "type": "SWITCH",
        "index": "string",
        "attributes": {
          "fields": {
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
            },
            "defaultValue": {
              "stringValue": "",
              "kind": "stringValue"
            },
            "disabled": {
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
        "commit_id": "5ed7c5af-9433-441d-ad45-5fc6bdf2bbd9",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
      }, {
        "required": true,
        "slug": "guid",
        "label": "ID",
        "default": "v4",
        "type": "UUID",
        "index": "true",
        "is_visible": true,
        "id": "a73fd453-3c21-4ab8-9e21-59d85acd106d",
        "table_id": "41491588-53f1-4457-ba46-93019363ab88",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }, {
        "table_id": "41491588-53f1-4457-ba46-93019363ab88",
        "required": false,
        "slug": "role_id",
        "label": "FROM app_permission TO role",
        "type": "LOOKUP",
        "is_visible": true,
        "relation_id": "82e93baf-2e02-432a-942b-2c93cbe26b81",
        "id": "6f344830-819c-40a3-a255-f11cdb515c2d",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    },{
      "id": "b8d627d2-99b3-40c1-929c-10094b2784aa",
      "table_id": "41491588-53f1-4457-ba46-93019363ab88",
      "required": false,
      "slug": "app_id",
      "label": "App Id",
      "default": "",
      "type": "SINGLE_LINE",
      "index": "string",
      "attributes": {
        "fields": {
          "showTooltip": {
            "boolValue": false,
            "kind": "boolValue"
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
          "placeholder": {
            "stringValue": "",
            "kind": "stringValue"
          }
        }
      },
      "is_visible": false,
      "autofill_field": "",
      "autofill_table": "",
      "unique": false,
      "automatic": false,
      "created_at": new Date(),
      "updated_at": new Date(),
      "__v": 0
    },{
      "id": "3c3dca2f-3c0c-499e-b732-89baf16f987f",
      "required": false,
      "slug": "create",
      "label": "Создать",
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
      "table_id": "41491588-53f1-4457-ba46-93019363ab88",
      "created_at": new Date(),
      "updated_at": new Date(),
      "__v": 0
  },{
    "id": "4ae1959d-c898-4937-9503-bec55c2abade",
    "required": false,
    "slug": "update",
    "label": "Изменить",
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
    "table_id": "41491588-53f1-4457-ba46-93019363ab88",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
},{
  "id": "b35b1f62-c15a-412f-8f48-811178ae64e1",
  "required": false,
  "slug": "read",
  "label": "Чтение",
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
  "table_id": "41491588-53f1-4457-ba46-93019363ab88",
  "created_at": new Date(),
  "updated_at": new Date(),
  "__v": 0
},{
  "id": "592789b2-cb93-42f8-90dd-dfeb24ed979f",
  "required": false,
  "slug": "delete",
  "label": "Удалить",
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
  "table_id": "41491588-53f1-4457-ba46-93019363ab88",
  "created_at": new Date(),
  "updated_at": new Date(),
  "__v": 0
}]

    return fields
}

module.exports = createField