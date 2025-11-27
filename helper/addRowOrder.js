const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid");
const ObjectBuilder = require("../models/object_builder");


module.exports = async function (data) {
    try {

        const mongoConn = await mongoPool.get(data.project_id)
        const RowOrder = mongoConn.models['rowOrder']
        const Table = mongoConn.models['Table']
        const Field = mongoConn.models['Field']
        const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
        const roles = await roleTable?.models.find()
        const fieldPermissionTable = (await ObjectBuilder(true, data.project_id))["field_permission"]
        let fieldPermissions = []

        let tables = await Table.find({ "is_system": { "$exists": false } })

        const rowOrders = await RowOrder.find()

        const rowOrdersMap = rowOrders.reduce((map, doc) => {
            map[doc.table_slug] = doc;
            return map;
          }, {});


        for (let t of tables) {

            const field = await Field.find({ "table_id": t.id, "slug": "row_order" })

            if (!field) {

                const fieldId = v4()
                await Field.create({
                    "id": fieldId,
                    "table_id": t.id,
                    "label": "row_order",
                    "slug": "row_order",
                    "default": "",
                    "required": false,
                    "type": "NUMBER",
                    "index": "string",
                    "attributes": {
                        "fields": {
                            "icon": {
                                "stringValue": "",
                                "kind": "stringValue"
                            },
                            "placeholder": {
                                "stringValue": "",
                                "kind": "stringValue"
                            },
                            "showTooltip": {
                                "boolValue": false,
                                "kind": "boolValue"
                            }
                        }
                    },
                    "is_visible": false,
                    "is_visible": false,
                    "autofill_field": "",
                    "autofill_table": "",
                    "created_at": new Date(),
                    "updated_at": new Date(),
                    "__v": 0
                })

                for (const role of roles) {
                    let permission = {
                        view_permission: true,
                        edit_permission: true,
                        table_slug: t?.slug,
                        field_id: fieldId,
                        field_label: "row_order",
                        role_id: role.guid
                    }

                    const fieldPermission = new fieldPermissionTable.models(permission)
                    fieldPermissions.push(fieldPermission)
                }
            }

            if (!rowOrdersMap[t.slug]) {
                await RowOrder.create({
                    "id": v4(),
                    "table_slug": t.slug,
                    "value": 0
                })
            }
        }

        try {
            fieldPermissionTable.models.insertMany(fieldPermissions)
        } catch (err) {
            logger.error(err)
        }

    } catch (error) {
        throw error
    }
}