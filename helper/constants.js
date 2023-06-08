module.exports = {
    // JS TYPES
    STRING_TYPES: ["SINGLE_LINE", "MULTI_LINE", "PICK_LIST", "DATE", "LOOKUP", "EMAIL", "PHOTO", "PHONE", "UUID", "DATE_TIME", "TIME", "INCREMENT_ID", "RANDOM_NUMBERS", "PASSWORD", "FILE", "CODABAR", "INTERNATIONAL_PHONE"],
    NUMBER_TYPES: ["NUMBER", "MONEY"],
    BOOLEAN_TYPES: ["CHECKBOX", "SWITCH"],
    MIXED_TYPES: ["MULTISELECT", "LOOKUPS", "DYNAMIC", "FORMULA", "FORMULA_FRONTEND", "LANGUAGE_TYPE"],
    DYNAMIC_TYPES: ["AUTOFILL"],
    MENU_TYPES: ["TABLE", "LAYOUT", "FOLDER", "MICROFRONTEND", "FAVOURITE", "HIDE"],


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

