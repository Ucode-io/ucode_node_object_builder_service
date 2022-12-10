const config = {
    TopicTableCreateV1: getConfig("TopicTableCreateV1", "v1.analytics_service.table.create"),
    TopicTableUpdeteV1: getConfig("TopicTableUpdeteV1", "v1.analytics_service.table.update"),

    TopicObjectCreateV1: getConfig("TopicObjectCreateV1", "v1.analytics_service.object.create"),
    TopicObjectDeleteV1: getConfig("TopicObjectDeleteV1", "v1.analytics_service.object.delete"),
    TopicObjectUpdateV1: getConfig("TopicObjectUpdateV1", "v1.analytics_service.object.update"),

    TopicFieldCreateV1: getConfig("TopicFieldCreateV1", "v1.analytics_service.field.create"),
    TopicFieldUpdateV1: getConfig("TopicFieldUpdateV1", "v1.analytics_service.field.update"),
    TopicFieldDeleteV1: getConfig("TopicFieldDeleteV1", "v1.analytics_service.field.delete"),

    TopicRelationFromCreateV1: getConfig("TopicRelationFromCreateV1", "v1.analytics_service.relation.from.create"),
    TopicRelationToCreateV1: getConfig("TopicRelationToCreateV1", "v1.analytics_service.relation.to.create"),
    TopicRecursiveRelationCreateV1: getConfig("TopicRecursiveRelationCreateV1", "v1.analytics_service.recursive.relation.create"),
    TopicMany2OneRelationCreateV1: getConfig("TopicMany2OneRelationCreateV1", "v1.analytics_service.many.2.one.relation.create"),
    TopicRelationDeleteV1: getConfig("TopicRelationDeleteV1", "v1.analytics_service.relation.delete"),

    TopicEventCreateV1: getConfig("TopicEventCreateV1", "v1.event_service.event.create"),
    TopicEventUpdateV1: getConfig("TopicEventUpdateV1", "v1.event_service.event.delete"),
    TopicEventDeleteV1: getConfig("TopicEventDeleteV1", "v1.event_service.event.update"),
}

function getConfig(name, def = "") {
    if (process.env[name]) {
        return process.env[name];
    }
    return def;
}

module.exports = config;