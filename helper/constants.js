module.exports = {
    // JS TYPES
    STRING_TYPES: ["SINGLE_LINE", "MULTI_LINE", "PICK_LIST", "DATE", "LOOKUP", "EMAIL", "PHOTO", "PHONE", "UUID", "DATE_TIME", "TIME", "INCREMENT_ID", "RANDOM_NUMBERS", "PASSWORD", "FILE", "CODABAR", "INTERNATIONAL_PHONE", "DATE_TIME_WITHOUT_TIME_ZONE"],
    NUMBER_TYPES: ["NUMBER", "MONEY", "FLOAT", "FLOAT_NOLIMIT"],
    BOOLEAN_TYPES: ["CHECKBOX", "SWITCH"],
    MIXED_TYPES: ["MULTISELECT", "LOOKUPS", "DYNAMIC", "FORMULA", "FORMULA_FRONTEND", "LANGUAGE_TYPE"],
    DYNAMIC_TYPES: ["AUTOFILL"],
    MENU_TYPES: ["TABLE", "LAYOUT", "FOLDER", "MICROFRONTEND", "FAVOURITE", "HIDE", "WEBPAGE", "PIVOT", "REPORT_SETTING", "LINK", "MINIO_FOLDER"],
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
    ],


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
    TopicEventUpdateV1: "v1.event_service.event.update"
};

