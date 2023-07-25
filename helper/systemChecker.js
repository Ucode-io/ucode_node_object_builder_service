const tables = require("../initial_setups/tables")
const fields = require("../initial_setups/field")
const relations = require("../initial_setups/relation")
const { v4 } = require("uuid");
const mongoPool = require('../pkg/pool');

module.exports = async function (data) {
    const mongoConn = await mongoPool.get(data.project_id)
    console.log("Menu permission insert function working...")
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
        id: {$in: table_ids}
    })

}