const config = {
    topicTableCreateV1: getConfig("TopicTableCreateV1", "v1.analytics_service.table.create"),
    topicTableUpdeteV1: getConfig("TopicTableUpdeteV1", "v1.analytics_service.table.update"),

    topicObjectCreateV1: getConfig("TopicObjectCreateV1", "v1.analytics_service.object.create"),
    topicObjectDeleteV1: getConfig("TopicObjectDeleteV1", "v1.analytics_service.object.delete"),
    topicObjectUpdateV1: getConfig("TopicObjectUpdateV1", "v1.analytics_service.object.update"),

    topicFieldCreateV1: getConfig("TopicFieldCreateV1", "v1.analytics_service.field.create"),
    topicFieldUpdateV1: getConfig("TopicFieldUpdateV1", "v1.analytics_service.field.update"),
    topicFieldDeleteV1: getConfig("TopicFieldDeleteV1", "v1.analytics_service.field.delete"),

    topicRelationFromCreateV1: getConfig("TopicRelationFromCreateV1", "v1.analytics_service.relation.from.create"),
    topicRelationToCreateV1: getConfig("TopicRelationToCreateV1", "v1.analytics_service.relation.to.create"),
    topicRecursiveRelationCreateV1: getConfig("TopicRecursiveRelationCreateV1", "v1.analytics_service.recursive.relation.create"),
    topicMany2OneRelationCreateV1: getConfig("TopicMany2OneRelationCreateV1", "v1.analytics_service.many.2.one.relation.create"),
    topicRelationDeleteV1: getConfig("TopicRelationDeleteV1", "v1.analytics_service.relation.delete"),

    topicEventCreateV1: getConfig("TopicEventCreateV1", "v1.event_service.event.create"),
    topicEventUpdateV1: getConfig("TopicEventUpdateV1", "v1.event_service.event.delete"),
    topicEventDeleteV1: getConfig("TopicEventDeleteV1", "v1.event_service.event.update"),
}

function getConfig(name, def = "") {
    if (process.env[name]) {
        return process.env[name];
    }
    return def;
}

module.exports = config;