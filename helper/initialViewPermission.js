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
        console.log("Initial View check function working...")
        const Table = mongoConn.models['Table']
        const Role = mongoConn.models['role']
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const RecordPermission = mongoConn.models['record_permission']
        const FieldPermission = mongoConn.models['field_permission']
        const Menu = mongoConn.models['object_builder_service.menu']

        let role = await Role?.findOne({ name: "DEFAULT ADMIN" })
        if (!role) {
            role = await Role?.findOne({ name: "Guess" })

            if (!role) {
                throw Error("No role to create permission in menu permission insert helper")
            }
        }

        let table_data = await tables()
        let field_data = await fields()
        let relation_data = await relations()
        let record_permission_data = await recordPermissions(role.guid)
        let field_permission_data = await fieldPermissions(role.guid)

        let menu_permission_slug = "view_permission"
        let menu_permission_id = "65a7936b-f3db-4401-afef-8eee77b68da3"

        let menu_tables = table_data.filter(el => {
            if (el.id == menu_permission_id) {
                return true
            }
        })

        let menu_field_ids = []
        let menu_fields = field_data.filter(el => {
            if (
                el.table_id == menu_permission_id
            ) {
                menu_field_ids.push(el.id)
                return true
            }
        })

        let menu_relation_ids = []
        let menu_relations = relation_data.filter(el => {
            if (
                el.table_from == menu_permission_slug || el.table_to == menu_permission_slug
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
            slug: "view_permission"
        }, { $set: { is_changed: true } })


        const ModelCustomPermission = mongoConn.models["view_permission"]
        const indexs = await ModelCustomPermission.collection.getIndexes()

        if (!indexs['role_id_1_view_id_1']) {
            console.log(".>>>>")
            await ModelCustomPermission.collection.createIndex({ role_id: 1, view_id: 1 }, { unique: true })
        }

        console.log("Initial view permission check function done ✅")
    } catch (error) {
        console.log("failed to initial view permission")
    }

}