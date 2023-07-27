const tables = require("../initial_setups/tables")
const fields = require("../initial_setups/field")
const relations = require("../initial_setups/relation")
const { v4 } = require("uuid");
const mongoPool = require('../pkg/pool');

module.exports = async function (data) {
    const mongoConn = await mongoPool.get(data.project_id)
    console.log("System checker function working...")
    const Table = mongoConn.models['Table']
    const ClientType = mongoConn.models['client_type']
    const Role = mongoConn.models['role']
    const User = mongoConn.models['user']
    const Field = mongoConn.models['Field']
    const Relation = mongoConn.models['Relation']

    let table_data = await tables()
    const table_ids = []
    table_data.forEach(el => {
        table_ids.push(el.id)
    })
    const not_system_tables = await Table.find({
        $and: [
            {id: {$in: table_ids}},
            {
                $or: [
                    { is_system: false },
                    { is_system: null }
                ]
            }
        ]
    }) || []
    let table_update_ids = []
    not_system_tables.forEach(el => {
        table_update_ids.push(el.id)
    })
    const respTable = await Table.updateMany({id: {$in: table_update_ids}}, {$set: {is_system: true}})


    const systemClientType = await ClientType.findOneAndUpdate({name: "ADMIN"}, {$set: {is_system: true}}, {new: true})

    const systemRole = await Role.findOneAndUpdate({name: "DEFAULT ADMIN"}, {$set: {is_system: true}}, {new: true})

    await User.updateMany({client_type: systemClientType.guid, role_id: systemRole.guid}, {$set: {is_system: true}})


    let field_data = await fields()
    const field_ids = []
    field_data.forEach(el => {
        field_ids.push(el.id)
    })
    const not_system_fields = await Field.find({
        $and: [
            {id: {$in: field_ids}},
            {
                $or: [
                    { is_system: false },
                    { is_system: null }
                ]
            }
        ]
    }) || []
    let field_update_ids = []
    not_system_fields.forEach(el => {
        field_update_ids.push(el.id)
    })
    await Field.updateMany({id: {$in: field_update_ids}}, {$set: {is_system: true}})

    
    let relation_data = await relations()
    const relation_ids = []
    relation_data.forEach(el => {
        relation_ids.push(el.id)
    })
    const not_system_relation = await Relation.find({
        $and: [
            {id: {$in: relation_ids}},
            {
                $or: [
                    { is_system: false },
                    { is_system: null }
                ]
            }
        ]
    }) || []
    let relation_update_ids = []
    not_system_relation.forEach(el => {
        relation_update_ids.push(el.id)
    })
    await Relation.updateMany({id: {$in: relation_update_ids}}, {$set: {is_system: true}})

    console.log("System checker function done")

}