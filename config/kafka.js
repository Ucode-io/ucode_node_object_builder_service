const { Kafka } = require('kafkajs')
const cfg = require('./index.js')


const kafka = new Kafka({
    clientId: 'medion_node_object_builder_service',
    brokers: [`${cfg.kafkaHost}:${cfg.kafkaPort}`],
})


async function produceMessageToTopic(topic, payload) {
    const producer = kafka.producer()

    await producer.connect()

    await producer.send({
    topic: topic,
    messages: [
        {
            key: null,
            value: JSON.stringify(payload),
            partition: 0
        }
    ]})

    await producer.disconnect()
    console.log("message is send to " + topic + ", and producer is closed")
}

module.exports = produceMessageToTopic