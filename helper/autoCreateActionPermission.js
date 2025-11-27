const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")
const ObjectBuilder = require("../models/object_builder");
const customErrMsg = require('../initial_setups/customErrMsg');

module.exports = async function (data) {
    const mongoConn = await mongoPool.get(data.project_id)
    const Role = mongoConn.models['role']
    const ActionPermission = mongoConn.models['action_permission']
    const CustomEvent = mongoConn.models['CustomEvent']


    const custom_events = await CustomEvent.find()
    const roles = await Role.find()

    let pipelineBulkwrite = []
    for(let ce of custom_events) {
        for(let r of roles) {
            pipelineBulkwrite.push({
                updateOne: {
                    filter: {
                        custom_event_id: ce.id,
                        role_id: r.guid
                    },
                    update: {
                        permission: true,
                        custom_event_id: ce.id,
                        table_slug: ce.table_slug,
                        role_id: r.guid,
                        label: ce.label,
                    },
                    upsert: true
                }
            })
        }
    }

    await ActionPermission.bulkWrite(pipelineBulkwrite)
}