const tables = require("../initial_setups/tables")
const fields = require("../initial_setups/field")
const relations = require("../initial_setups/relation")
const recordPermissions = require("../initial_setups/recordPermission")
const fieldPermissions = require("../initial_setups/fieldPermission")
const objectBuilder = require("../models/object_builder");


module.exports = async function (mongoConn, project_id) {
    console.log("Language insert function working...")
    const Table = mongoConn.models['Table']
    const Field = mongoConn.models['Field']
    const Relation = mongoConn.models['Relation']
    const RecordPermission = mongoConn.models['record_permission']
    const FieldPermission = mongoConn.models['field_permission']

    let table_data = await tables()
    let field_data = await fields()
    let relation_data = await relations()
    let record_permission_data = await recordPermissions()
    let field_permission_data = await fieldPermissions()

    let language_id = "d267203c-1c23-4663-a721-7a845d4b98ad"
    let language_slug = "setting.languages"
    let timezone_id = "bba3dddc-5f20-449c-8ec8-37bef283c766"
    let timezone_slug = "setting.timezones"

    let setting_tables = table_data.filter(el => {
        if(el.id == language_id || el.id == timezone_id) {
            return true
        }
    })
    // console.log("#test 1 ", setting_tables, table_data)
    let setting_field_ids = []
    let setting_fields = field_data.filter(el => {
        if (
            // el.table_id == language_id 
            // || 
            // el.table_id == timezone_id
            // || 
            el.slug == language_slug + "_id"
            ||
            el.slug == timezone_slug + "_id"
            ) {
            setting_field_ids.push(el.id)
            return true
        }
    })
    console.log("#test 1", setting_fields.length, setting_field_ids)
    let setting_relation_ids = []
    let setting_relations = relation_data.filter(el => {
        if(
            (el.table_from == "user" && el.table_to == language_slug) 
            ||
            (el.table_from == "user" && el.table_to == timezone_slug)
        ) {
            setting_relation_ids.push(el.id)
            return true
        }
    })
    
    let setting_record_permissions_ids = []
    let setting_record_permissions = record_permission_data.filter(el => {
        if(el.table_slug == language_slug || el.table_slug == timezone_slug) {
            setting_record_permissions_ids.push(el.guid)
            return true
        }
    })

    let setting_field_permissions_ids = []
    let setting_field_permissions = field_permission_data.filter(el => {
        if(el.table_slug == language_slug || el.table_slug == timezone_slug) {
            setting_field_permissions_ids.push(el.id)
            return true
        }
    })


    const exist_tables = await Table.find({id: {$in: [language_id, timezone_id]}})
    if(!exist_tables.length) {
        await Table.insertMany(setting_tables)
    }

    const exist_fields = await Field.find({id: {$in: setting_field_ids}})
    if(!exist_fields.length) {
        await Field.insertMany(setting_fields)
    }

    const exist_relations = await Relation.find({id: {$in: setting_relation_ids}})
    if(!exist_relations.length) {
        await Relation.insertMany(setting_relations)
    }

    const exist_record_permissions = await RecordPermission.find({guid: {$in: setting_record_permissions_ids}})
    if(!exist_record_permissions.length) {
        await RecordPermission.insertMany(setting_record_permissions)
    }

    const exist_field_permissions = await FieldPermission.find({guid: {$in: setting_field_permissions_ids}})
    if(!exist_field_permissions.length) {
        await FieldPermission.insertMany(setting_field_permissions)
    }

    console.log("Language insert function done")
}