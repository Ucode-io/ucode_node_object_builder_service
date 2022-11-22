const config = {
    topicTableCreateV1: getConfig("TopicTableCreateV1", ""),
    topicTableUpdeteV1: getConfig("TopicTableUpdeteV1", ""),

    topicObjectCreateV1: getConfig("TopicObjectCreateV1", ""),
    topicObjectDeleteV1: getConfig("TopicObjectDeleteV1", ""),
    topicObjectUpdateV1: getConfig("TopicObjectUpdateV1", ""),

    topicFieldCreateV1: getConfig("TopicFieldCreateV1", ""),
    topicFieldUpdateV1: getConfig("TopicFieldUpdateV1", ""),
    topicFieldDeleteV1: getConfig("TopicFieldDeleteV1", ""),

    topicRelationFromCreateV1: getConfig("TopicRelationFromCreateV1", ""),
    topicRelationToCreateV1: getConfig("TopicRelationToCreateV1", ""),
    topicRecursiveRelationCreateV1: getConfig("TopicRecursiveRelationCreateV1", ""),
    topicMany2OneRelationCreateV1: getConfig("TopicMany2OneRelationCreateV1", ""),
    topicRelationDeleteV1: getConfig("TopicRelationDeleteV1", ""),

    topicEventCreateV1: getConfig("TopicEventCreateV1", ""),
    topicEventUpdateV1: getConfig("TopicEventUpdateV1", ""),
    topicEventDeleteV1: getConfig("TopicEventDeleteV1", ""),
}

function getConfig(name, def = "") {
    if (process.env[name]) {
        return process.env[name];
    }
    return def;
}

module.exports = config;