const tables = require("../initial_setups/tables")
const fields = require("../initial_setups/field")
const recordPermissions = require("../initial_setups/recordPermission")
const fieldPermissions = require("../initial_setups/fieldPermission")
const relations = require("../initial_setups/relation")
const { v4 } = require("uuid");
const ObjectBuilder = require("../models/object_builder")
const mongoPool = require('../pkg/pool');

module.exports = async function (data) {
   try {
    const mongoConn = await mongoPool.get(data.project_id)
    console.log("Initial global check function working...")
    const Table = mongoConn.models['Table']
    const Role = mongoConn.models['role']
    const Field = mongoConn.models['Field']
    const Relation = mongoConn.models['Relation']
    const RecordPermission = mongoConn.models['record_permission']
    const FieldPermission = mongoConn.models['field_permission']
    const Menu = mongoConn.models['object_builder_service.menu']

    let role = await Role.findOne({ name: "DEFAULT ADMIN" })
    if (!role) {
        role = await Role.findOne({ name: "Guess" })

        if (!role) {
            throw Error("No role to create permission in menu permission insert helper")
        }
    }

    let table_data = await tables()
    let field_data = await fields()
    let relation_data = await relations()
    let record_permission_data = await recordPermissions(role.guid)
    let field_permission_data = await fieldPermissions(role.guid)

    let menu_permission_slug = "global_permission"
    let menu_permission_id = "1b066143-9aad-4b28-bd34-0032709e463b"

    let menu_tables = table_data.filter(el => {
        if (el.id == menu_permission_id) {
            return true
        }
    })

    let menu_field_ids = []
    let menu_fields = field_data.filter(el => {
        if (
            el.table_id == menu_permission_id ||
            // this ids record_permission field ids
            ["8498e227-7ab8-4ebe-81fa-9995fb63a301", "0b2e6bad-e461-4cfc-acf1-f59f98d46e57", "ab927fe6-30ed-488c-b4cc-0d5712f7a461", "96b034d5-d7b2-4d23-bbf6-7fe4041c520a", "52ea67a2-079d-4a03-907a-b0594ffede51"].includes(el.id)
        ) {
            menu_field_ids.push(el.id)
            return true
        }
    })

    let menu_relation_ids = []
    let menu_relations = relation_data.filter(el => {
        if (
            el.table_from == menu_permission_slug
        ) {
            menu_relation_ids.push(el.id)
            return true
        }
    })

    let menu_field_permissions_ids = []
    let menu_field_permissions = field_permission_data.filter(el => {
        if (el.table_slug == menu_permission_slug) {
            menu_field_permissions_ids.push(el.id)
            return true
        }
    })

    const exist_tables = await Table.find({ id: { $in: menu_permission_id } })
    if (!exist_tables.length) {
        await Table.insertMany(menu_tables)
    }

    const exist_fields = await Field.find({ id: { $in: menu_field_ids } })
    if (!exist_fields.length) {
        await Field.insertMany(menu_fields)
    }

    const exist_relations = await Relation.find({ id: { $in: menu_relation_ids } })
    if (!exist_relations.length) {
        await Relation.insertMany(menu_relations)
    }

    const exist_field_permissions = await FieldPermission.find({ guid: { $in: menu_field_permissions_ids } })
    if (!exist_field_permissions.length) {
        await FieldPermission.insertMany(menu_field_permissions)
    }
    
    await Table.updateOne({
        slug: "global_permission"
    }, { $set: { is_changed: true } })

    const customPermissionTable = (await ObjectBuilder(true, data.project_id))["global_permission"]
    const exist_custom_permission = await customPermissionTable.models.findOne({role_id: role.guid})
    !exist_custom_permission && await customPermissionTable.models.create({
        guid: v4(),
        menu_button: true,
        chat: true,
        settings_button: true,
        role_id: role.guid,
        projects_button: true,
        environments_button: true,
        api_keys_button: true,
        redirects_button: true,
        menu_setting_button: true,
        profile_settings_button: true,
        project_settings_button: true,
    })

    const ModelCustomPermission = mongoConn.models["global_permission"]
    const indexs = await ModelCustomPermission.collection.getIndexes()

    if(!indexs['role_id_1']) {
        console.log(".>>>>")
        await ModelCustomPermission.collection.createIndex({ role_id: 1}, {unique: true})
    }
    
    console.log("Initial custom check function done ✅")
   } catch (err) {
    console.log("Custom permission err >>", err)
   }
}