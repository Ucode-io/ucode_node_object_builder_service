const tables = require("../initial_setups/tables")
const fields = require("../initial_setups/field")
const recordPermissions = require("../initial_setups/recordPermission")
const fieldPermissions = require("../initial_setups/fieldPermission")
const relations = require("../initial_setups/relation")
const { v4 } = require("uuid");
const ObjectBuilder = require("../models/object_builder")
const mongoPool = require('../pkg/pool');


module.exports = async function (data) {
    console.log("Custom Permission update function working...")
    const mongoConn = await mongoPool.get(data.project_id)
    const Role = mongoConn.models['role']
    const View = mongoConn.models['View']
    const ViewPermission = mongoConn.models['view_permission']
    const RecordPermission = mongoConn.models['record_permission']

    const roles = await Role.find()

    const views = await View.find()

    
    let bulkWriteViewPermissions = []
    for(let view of views) {
        for(let role of roles) {
            bulkWriteViewPermissions.push({
                updateOne: {
                    filter: {
                        view_id: view.id,
                        role_id: role.guid
                    },
                    update: {
                        guid: v4(),
                        role_id: role.guid,
                        view: true,
                        edit:   true,
                        delete: true,
                        view_id: view.id,
                    },
                    upsert: true
                }
            })
        }
    }
    await ViewPermission.bulkWrite(bulkWriteViewPermissions)

    await RecordPermission.updateMany({}, {
        view_create: "Yes",
        language_btn: "Yes",
        automation: "Yes",
        settings: "Yes",
        share_modal: "Yes"
    })
    

}