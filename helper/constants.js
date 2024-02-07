module.exports = {
    // JS TYPES
    STRING_TYPES: ["SINGLE_LINE", "MULTI_LINE", "PICK_LIST", "DATE", "LOOKUP", "EMAIL", "PHOTO", "PHONE", "UUID", "DATE_TIME", "TIME", "INCREMENT_ID", "RANDOM_NUMBERS", "PASSWORD", "FILE", "CODABAR", "INTERNATIONAL_PHONE", "DATE_TIME_WITHOUT_TIME_ZONE"],
    NUMBER_TYPES: ["NUMBER", "MONEY", "FLOAT", "FLOAT_NOLIMIT"],
    BOOLEAN_TYPES: ["CHECKBOX", "SWITCH"],
    MIXED_TYPES: ["MULTISELECT", "LOOKUPS", "DYNAMIC", "FORMULA", "FORMULA_FRONTEND", "LANGUAGE_TYPE"],
    DYNAMIC_TYPES: ["AUTOFILL"],
    MENU_TYPES: ["TABLE", "LAYOUT", "FOLDER", "MICROFRONTEND", "FAVOURITE", "HIDE", "WEBPAGE", "PIVOT", "REPORT_SETTING", "LINK", "MINIO_FOLDER", "WIKI", "WIKI_FOLDER"],
    STATIC_MENU_IDS: [
        "c57eedc3-a954-4262-a0af-376c65b5a284", //root
        "c57eedc3-a954-4262-a0af-376c65b5a282", //favorite
        "c57eedc3-a954-4262-a0af-376c65b5a280", //admin
        "c57eedc3-a954-4262-a0af-376c65b5a278", //analytics
        "c57eedc3-a954-4262-a0af-376c65b5a276", //pivot
        "c57eedc3-a954-4262-a0af-376c65b5a274", //report setting
        "7c26b15e-2360-4f17-8539-449c8829003f", //saved pivot
        "e96b654a-1692-43ed-89a8-de4d2357d891", //history pivot
        "a8de4296-c8c3-48d6-bef0-ee17057733d6", //admin => user and permission
        "d1b3b349-4200-4ba9-8d06-70299795d5e6", //admin => database
        "f7d1fa7d-b857-4a24-a18c-402345f65df8", //admin => code
        "f313614f-f018-4ddc-a0ce-10a1f5716401", //admin => resource
        "db4ffda3-7696-4f56-9f1f-be128d82ae68", //admin => api
        "3b74ee68-26e3-48c8-bc95-257ca7d6aa5c", // profile setting
        "8a6f913a-e3d4-4b73-9fc0-c942f343d0b9", //files menu id
        "744d63e6-0ab7-4f16-a588-d9129cf959d1", //wiki menu id
        "9e988322-cffd-484c-9ed6-460d8701551b"  // users menu id
    ],
    VIEW_TYPES: {
        "TABLE": "TABLE",
        "CALENDAR": "CALENDAR",
        "CALENDAR HOUR": "CALENDAR HOUR",
        "GANTT": "GANTT",
        "TREE": "TREE",
        "BOARD": "BOARD",
        "FINANCE CALENDAR": "FINANCE CALENDAR",
    },
    STATIC_TABLE_IDS: [
        "65a7936b-f3db-4401-afef-8eee77b68da3", //view_permission
        "1b066143-9aad-4b28-bd34-0032709e463b", //global_permission
        "08a391b2-1c78-4f3e-b84a-9d745e7d528f", //menu_permission
        "eca81c06-c4fc-4242-8dc9-ecca575e1762", // user_login_table
        "c2f225b6-b6d9-4201-aa25-e648a4c1ff29", //custom_error
        "6b99e876-b4d8-440c-b2e2-a961530690f8", //doctors
        "961a3201-65a4-452a-a8e1-7c7ba137789c", //field_permission
        "5db33db7-4524-4414-b65a-b6b8e5bba345", //test_login
        "5af2bfb2-6880-42ad-80c8-690e24a2523e", //action_permission
        "53edfff0-2a31-4c73-b230-06a134afa50b", //client_platform
        "4c1f5c95-1528-4462-8d8c-cd377c23f7f7", //automatic_filters
        "25698624-5491-4c39-99ec-aed2eaf07b97", //record_permission
        "074fcb3b-038d-483d-b390-ca69490fc4c3", //view_relation_permission
        "d267203c-1c23-4663-a721-7a845d4b98ad", //setting.languages
        "bba3dddc-5f20-449c-8ec8-37bef283c766", //setting.timezones
        "b1896ed7-ba00-46ae-ae53-b424d2233589", //file
        "08972256-30fb-4d75-b8cf-940d8c4fc8ac", //template
        "373e9aae-315b-456f-8ec3-0851cad46fbf", //project
        "2546e042-af2f-4cef-be7c-834e6bde951c", //user
        "0ade55f8-c84d-42b7-867f-6418e1314e28", //connections
    ],

    VERSION_SOURCE_TYPES: [
        "TABLE", "FIELD", "RELATION", "LAYOUT", "TAB", "SECTION", "VIEW", "ACTION", "MENU"
    ],
    VERSION_SOURCE_TYPES_MAP: {
        "TABLE": "TABLE", 
        "FIELD": "FIELD", 
        "RELATION": "RELATION", 
        "LAYOUT": "LAYOUT", 
        "TAB": "TAB", 
        "SECTION": "SECTION", 
        "VIEW": "VIEW", 
        "ACTION": "ACTION", 
        "MENU": "MENU"
    },
    ACTION_TYPES: ["CREATE", "UPDATE", "DELETE", "BULKWRITE", "GET", "LOGIN", "DELETE ITEM", "CREATE ITEM", "UPDATE ITEM", "CREATE TABLE", "UPDATE TABLE", "DELETE TABLE", "CREATE MENU", "DELETE MENU", "UPDATE MENU", "CREATE FIELD", "UPDATE FIELD", "DELETE FIELD", "CREATE VIEW", "DELETE VIEW", "UPDATE VIEW"],
    ACTION_TYPE_MAP: {
        "CREATE": "CREATE", 
        "UPDATE": "UPDATE", 
        "DELETE": "DELETE",
        "BULKWRITE": "BULKWRITE", 
    },
    VERSION_HISTORY_TYPES: {
        "DOWN": "DOWN",
        "UP": "UP",
        "GLOBAL": "GLOBAL",
        "API_KEY": "API_KEY",
    },

    // KAFKA PRODUCER TOPICS


    // TABLE
    TopicTableCreateV1: "v1.analytics_service.table.create",
    TopicTableUpdeteV1: "v1.analytics_service.table.update",


    // OBJECT
    TopicObjectCreateV1: "v1.analytics_service.object.create",
    TopicObjectDeleteV1: "v1.analytics_service.object.delete",
    TopicObjectUpdateV1: "v1.analytics_service.object.update",

    // FIELDS
    TopicFieldCreateV1: "v1.analytics_service.field.create",
    TopicFieldUpdateV1: "v1.analytics_service.field.update",
    TopicFieldDeleteV1: "v1.analytics_service.field.delete",

    //RELATION
    TopicRelationFromCreateV1: "v1.analytics_service.relation.from.create",
    TopicRelationToCreateV1: "v1.analytics_service.relation.to.create",
    TopicRecursiveRelationCreateV1: "v1.analytics_service.recursive.relation.create",
    TopicMany2OneRelationCreateV1: "v1.analytics_service.many.2.one.relation.create",
    TopicRelationDeleteV1: "v1.analytics_service.relation.delete",


    // EVENT 
    TopicEventCreateV1: "v1.event_service.event.create",
    TopicEventDeleteV1: "v1.event_service.event.delete",
    TopicEventUpdateV1: "v1.event_service.event.update",

    // FOR UNIT TESTING
    UnitTestData: {
        dev: {
            dbCred: {
                project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81", // youtube dev
                credentials: {
                    host: "65.109.239.69",
                    port: 30027,
                    database: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
                    username: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
                    password: "bLjkGFjiva"
                }
            }
        },
        staging: {
            dbCred: {
                project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81", // youtube dev
                credentials: {
                    host: "65.109.239.69",
                    port: 30027,
                    database: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
                    username: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
                    password: "bLjkGFjiva"
                }
            }
        },
        master: {
            dbCred: {
                project_id: "b8c69f43-5972-4c4f-908f-0a4d49b0f909", // byd_admin
                credentials: {
                    host: "142.93.164.37",
                    port: 27017,
                    database: "byd_admin_a1e63e80ded14979be80b39be5449def_p_obj_build_svcs",
                    username: "byd_admin_a1e63e80ded14979be80b39be5449def_p_obj_build_svcs",
                    password: "0kZ8wyr6OG"
                }
            }
        }
    }
};

