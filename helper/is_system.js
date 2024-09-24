let initialFields = require("../initial_setups/field")
let createApp  = require("../initial_setups/app")
let initialTables = require("../initial_setups/tables")
let initialRelations = require("../initial_setups/relation")

module.exports = async function (mongoConn) {
    const Field = mongoConn.models['Field']
    const Table = mongoConn.models['Table']
    const Relation = mongoConn.models['Relation']
    const App = mongoConn.models['App']
    
    let c = 0
    let initial_field_ids = (await initialFields()).map(el => el.id)
    const fields = await Field.find({id: {$in: initial_field_ids}, $or: [{is_system: false}, {is_system: null}]})
    for(let field of fields) {
            field.is_system = true
            await field.save()
    }
    let initialApps = await createApp()
    const app = await App.findOneAndUpdate({id: initialApps[0]?.id}, {is_system: true})

    let initial_table_ids = (await initialTables()).map(el => el.id)
    const tables = await Table.find({id: {$in: initial_table_ids}, $or: [{is_system: false}, {is_system: null}]})
    for(let table of tables) {
        if(!table.is_system) {
            table.is_system = true
            await table.save()
        }
    }

    let initial_relation_ids = (await initialRelations()).map(el => el.id)
    const relations = await Relation.find({id: {$in: initial_relation_ids}, $or: [{is_system: false}, {is_system: null}]})
    for(let relation of relations) {
        if(!relation.is_system) {
            relation.is_system = true
            await relation.save()
        }
    }
}