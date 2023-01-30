const catchWrapDb = require("../../helper/catchWrapDb")
const mongoPool = require("../../pkg/pool")
const con = require("../../helper/constants")
const NAMESPACE = "storage.fields_relations"

let fieldsRelationsStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {

        const mongoConn = await mongoPool.get(data.options.project_id)
        const Field = mongoConn.models["Field"]
        const Relation = mongoConn.models["Relation"]
        const Table = mongoConn.models["Table"]

        data.fields.push({
            slug: "guid",
            label: "ID",
            default: "v4",
            index: true,
            unique: true,
            type: "UUID",
        });
        const fieldPermissionTable = (await ObjectBuilder(true, data.project_id))["field_permission"]
        let fieldPermissions = []
        for (const fieldReq of data.fields) {
            if (con.DYNAMIC_TYPES.includes(fieldReq.type) && fieldReq.autofill_field && fieldReq.autofill_table) {
                let autoFillTable = await Table.findOne({
                    slug: fieldReq.autofill_table
                })
                let autoFillFieldSlug = "", autoFillField = {}
                if (fieldReq.autofill_field.includes(".")) {
                    let splitedAutofillField = fieldReq.autofill_field.split(".")
                    autoFillTable = await Table.findOne({
                        slug: splitedAutofillField[0]
                    })
                    let splitedTable = splitedAutofillField[0].split("_")
                    let tableSlug = ""
                    for (let i = 0; i < splitedTable.length - 2; i++) {
                        tableSlug = tableSlug + "_" + splitedTable[i]
                    }
                    tableSlug = tableSlug.slice(1, tableSlug.length)
                    autoFillTable = await Table.findOne({
                        slug: tableSlug
                    })
                    autoFillFieldSlug = splitedAutofillField[1]
                } else {
                    autoFillFieldSlug = fieldReq.autofill_field
                }
                autoFillField = await Field.findOne({
                    slug: autoFillFieldSlug,
                    table_id: autoFillTable?.id
                })
                if (autoFillField) {
                    fieldReq.type = autoFillField.type
                    fieldReq.attributes = autoFillField.attributes
                }
            }
            const field = new Field(fieldReq);
            const response = await field.save();
            const resp = await Table.updateOne({
                id: data.table_id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                })
            const table = await Table.findOne({
                id: data.table_id
            });

            
            const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
            const roles = await roleTable?.models.find()
            for (const role of roles) {
                let permission = {
                    view_permission: true,
                    edit_permission: true,
                    table_slug: table?.slug,
                    field_id: field.id,
                    field_label: field.label,
                    role_id: role.guid
                }
                const fieldPermission = new fieldPermissionTable.models(permission)
                fieldPermissions.push(fieldPermission)
            }
        }
        fieldPermissionTable.models.insertMany(fieldPermissions)
        const resp = await Table.updateOne({
            id: data.id,
        },
            {
                $set: {
                    is_changed: true
                }
            })
    })
}

module.exports = fieldsRelationsStore;