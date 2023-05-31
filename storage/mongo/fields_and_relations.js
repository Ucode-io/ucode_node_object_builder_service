const catchWrapDb = require("../../helper/catchWrapDb")
const mongoPool = require("../../pkg/pool")
const con = require("../../helper/constants")
const NAMESPACE = "storage.fields_relations"
const ObjectBuilder = require("../../models/object_builder");
const { v4 } = require("uuid");
const relationFieldChecker = require("../../helper/relationFieldChecker");
const converter = require("../../helper/converter");
const sendMessageToTopic = require("../../config/kafka");
const tableVersion = require('../../helper/table_version');

let fieldsRelationsStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {

        const table_guid = data.options?.table_id;
        // project_id -> resource_id
        const resource_guid = data.options?.project_id;
        try {

            // Create fields
            const mongoConn = await mongoPool.get(resource_guid)
            const Field = mongoConn.models["Field"]
            const Relation = mongoConn.models["Relation"]
            const Table = mongoConn.models["Table"]

            // Every table should have own GUID field, 
            data.fields.push({
                slug: "guid",
                label: "ID",
                default: "v4",
                index: true,
                unique: true,
                type: "UUID",
            });
            const fieldPermissionTable = (await ObjectBuilder(true, resource_guid))["field_permission"]
            let fieldPermissions = []
            for (const fieldReq of data.fields) {
                if (con.DYNAMIC_TYPES.includes(fieldReq.type) && fieldReq.autofill_field && fieldReq.autofill_table) {
                    // let autoFillTable = await Table.findOne({
                    //     slug: fieldReq.autofill_table
                    // })
                    let autoFillTable = await tableVersion(mongoConn, {slug: fieldReq.autofill_table}, data.version_id, true)
                    let autoFillFieldSlug = "", autoFillField = {}
                    if (fieldReq.autofill_field.includes(".")) {
                        let splitedAutofillField = fieldReq.autofill_field.split(".")
                        // autoFillTable = await Table.findOne({
                        //     slug: splitedAutofillField[0]
                        // })
                        autoFillTable = await tableVersion(mongoConn, {slug: splitedAutofillField[0]}, data.version_id, true)
                        let splitedTable = splitedAutofillField[0].split("_")
                        let tableSlug = ""
                        for (let i = 0; i < splitedTable.length - 2; i++) {
                            tableSlug = tableSlug + "_" + splitedTable[i]
                        }
                        tableSlug = tableSlug.slice(1, tableSlug.length)
                        // autoFillTable = await Table.findOne({
                        //     slug: tableSlug
                        // })
                        autoFillTable = await tableVersion(mongoConn, {slug: tableSlug}, data.version_id, true)
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
                field.table_id = table_guid;
                field.id = v4()
                var responseFields = field.save();
                // const table = await Table.findOne({
                //     id: table_guid
                // })
                const table = await tableVersion(mongoConn, {id: table_guid}, data.version_id, true)
                const roleTable = (await ObjectBuilder(true, resource_guid))["role"]
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
            await Table.updateOne(
                {
                    id: table_guid,
                },
                {
                    $set: {
                        is_changed: true
                    }
                })

            // Create relations 
            var responseRelations;
            for (const relationReq of data.relations) {

                const Table = mongoConn.models['Table']
                const Field = mongoConn.models['Field']
                const View = mongoConn.models['View']
                const Relation = mongoConn.models['Relation']

                const roleTable = (await ObjectBuilder(true, resource_guid))["role"]
                const roles = await roleTable?.models.find()

                let table = {};
                let field = {};
                let result = {};
                // if (!relationReq["id"]) {
                //     relationReq["id"] = v4()
                // }
                relationReq["id"] = v4()
                switch (relationReq.type) {
                    case 'One2Many':
                        relationReq.field_from = "id";
                        relationReq.field_to = relationReq.table_from + "_id";
                        // table = await Table.findOne({
                        //     slug: relationReq.table_to,
                        //     deleted_at: "1970-01-01T18:00:00.000+00:00",
                        // });
                        table = await tableVersion(mongoConn, {slug: relationReq.table_to, deleted_at: "1970-01-01T18:00:00.000+00:00"}, data.version_id, true)
                        result = await relationFieldChecker(relationReq.field_to, table.id, resource_guid)
                        if (result.exists) {
                            relationReq.field_to = result.lastField
                        }
                        field = new Field({
                            table_id: table.id,
                            slug: relationReq.field_to,
                            label: "FROM " + relationReq.table_from + " TO " + relationReq.table_to,
                            type: "LOOKUP",
                            relation_id: relationReq.id
                        });
                        let response = await field.save();

                        const fieldPermissionTableOne = (await ObjectBuilder(true, resource_guid))["field_permission"]
                        for (const role of roles) {
                            let fieldPermission = {
                                field_id: response.id,
                                table_slug: relationReq.table_to,
                                view_permission: true,
                                edit_permission: true,
                                guid: v4(),
                                role_id: role.guid,
                                label: "FROM " + relationReq.table_from + " TO " + relationReq.table_to
                            }

                            const fieldPermissionWithModel = new fieldPermissionTableOne.models(fieldPermission)
                            await fieldPermissionWithModel.save()
                        }

                        console.log("response from field create while creating relation", response)
                        break;
                    case 'Many2Dynamic':
                        relationReq.field_from = relationReq.relation_field_slug
                        relationReq.field_to = "id"
                        // table = await Table.findOne({
                        //     slug: relationReq.table_from,
                        //     deleted_at: "1970-01-01T18:00:00.000+00:00",
                        // });
                        table = await tableVersion(mongoConn, {slug: relationReq.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00"}, data.version_id, true)
                        field = new Field({
                            table_id: table.id,
                            slug: relationReq.relation_field_slug,
                            label: "FROM " + relationReq.table_from + " TO DYNAMIC",
                            type: "DYNAMIC",
                            relation_id: relationReq.id
                        });
                        let output = await field.save();

                        const fieldPermissionTableDynamic = (await ObjectBuilder(true, resource_guid))["field_permission"]
                        for (const role of roles) {
                            let fieldPermission = {
                                field_id: output.id,
                                table_slug: relationReq.table_from,
                                view_permission: true,
                                edit_permission: true,
                                guid: v4(),
                                role_id: role.guid,
                                label: "FROM " + relationReq.table_from + " TO DYNAMIC"
                            }

                            const fieldPermissionWithModel = new fieldPermissionTableDynamic.models(fieldPermission)
                            await fieldPermissionWithModel.save()
                        }

                        console.log("response from field create while creating relation", output);
                        break;
                    case 'Many2Many':
                        relationReq.field_from = relationReq.table_to + "_ids";
                        relationReq.field_to = relationReq.table_from + "_ids";
                        // let tableTo = await Table.findOne({
                        //     slug: relationReq.table_to,
                        //     deleted_at: "1970-01-01T18:00:00.000+00:00",
                        // });
                        let tableTo =  await tableVersion(mongoConn, {slug: relationReq.table_to, deleted_at: "1970-01-01T18:00:00.000+00:00"}, data.version_id, true)
                        result = await relationFieldChecker(relationReq.field_to, tableTo.id, resource_guid)
                        if (result.exists) {
                            relationReq.field_to = result.lastField
                        }
                        field = new Field({
                            table_id: tableTo.id,
                            required: false,
                            slug: relationReq.field_to,
                            label: "FROM " + relationReq.table_from + " TO " + relationReq.table_to,
                            type: "LOOKUPS",
                            relation_id: relationReq.id
                        });
                        let res = await field.save();

                        const fieldPermissionTableMany1 = (await ObjectBuilder(true, resource_guid))["field_permission"]
                        for (const role of roles) {
                            let fieldPermission = {
                                field_id: res.id,
                                table_slug: relationReq.table_to,
                                view_permission: true,
                                edit_permission: true,
                                guid: v4(),
                                role_id: role.guid,
                                label: "FROM " + relationReq.table_from + " TO " + relationReq.table_to
                            }

                            const fieldPermissionWithModel = new fieldPermissionTableMany1.models(fieldPermission)
                            await fieldPermissionWithModel.save()
                        }

                        let type = converter(field.type);
                        let eventTo = {}
                        let tableRes = {}
                        let fieldsFrom = []
                        tableRes.slug = tableTo.slug
                        fieldsFrom.push(
                            {
                                slug: field.slug,
                                type: type
                            }
                        )
                        tableRes.fields = fieldsFrom
                        eventTo.payload = tableRes
                        // tableFrom = await Table.findOne({
                        //     slug: relationReq.table_from,
                        //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                        // });
                        tableFrom =  await tableVersion(mongoConn, {slug: relationReq.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00"}, data.version_id, true)
                        result = await relationFieldChecker(relationReq.field_from, tableFrom.id, resource_guid)
                        if (result.exists) {
                            relationReq.field_from = result.lastField
                        }
                        field = new Field({
                            table_id: tableFrom.id,
                            required: false,
                            slug: relationReq.field_from,
                            label: "FROM " + relationReq.table_from + " TO " + relationReq.table_to,
                            type: "LOOKUPS",
                            relation_id: relationReq.id
                        });
                        res = await field.save();

                        const fieldPermissionTableMany2 = (await ObjectBuilder(true, resource_guid))["field_permission"]
                        for (const role of roles) {
                            let fieldPermission = {
                                field_id: res.id,
                                table_slug: relationReq.table_to,
                                view_permission: true,
                                edit_permission: true,
                                guid: v4(),
                                role_id: role.guid,
                                label: "FROM " + relationReq.table_from + " TO " + relationReq.table_to
                            }

                            const fieldPermissionWithModel = new fieldPermissionTableMany2.models(fieldPermission)
                            await fieldPermissionWithModel.save()
                        }

                        console.log("response from field create while creating relation", res)
                        // await sendMessageToTopic(con.TopicRelationToCreateV1, eventTo)
                        type = converter(field.type);
                        let fieldsTo = []
                        let eventFrom = {}
                        tableRes.slug = tableFrom.slug
                        fieldsTo.push(
                            {
                                slug: field.slug,
                                type: type
                            }
                        )
                        tableRes.fields = fieldsTo
                        eventFrom.payload = tableRes
                        // await sendMessageToTopic(con.TopicRelationFromCreateV1, eventFrom)
                        break;
                    case 'Recursive':
                        relationReq.recursive_field = relationReq.table_from + "_id";
                        relationReq.field_from = "id";
                        relationReq.field_to = relationReq.table_from + "_id";
                        // table = await Table.findOne({
                        //     slug: relationReq.table_from,
                        //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                        // });
                        table =  await tableVersion(mongoConn, {slug: relationReq.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00"}, data.version_id, true)
                        result = await relationFieldChecker(relationReq.recursive_field, table.id, resource_guid)
                        if (result.exists) {
                            relationReq.recursive_field = result.lastField
                        }
                        field = new Field({
                            table_id: table.id,
                            required: false,
                            slug: relationReq.recursive_field,
                            label: "FROM " + relationReq.table_from + " TO " + relationReq.table_from,
                            type: "LOOKUP",
                            relation_id: relationReq.id
                        });
                        let responsee = await field.save();

                        const fieldPermissionTableRecursive = (await ObjectBuilder(true, resource_guid))["field_permission"]
                        for (const role of roles) {
                            let fieldPermission = {
                                field_id: responsee.id,
                                table_slug: relationReq.table_from,
                                view_permission: true,
                                edit_permission: true,
                                guid: v4(),
                                role_id: role.guid,
                                label: "FROM " + relationReq.table_from + " TO " + relationReq.table_from
                            }

                            const fieldPermissionWithModel = new fieldPermissionTableRecursive.models(fieldPermission)
                            await fieldPermissionWithModel.save()
                        }

                        console.log("response from field create while creating recursive relation======>", responsee)

                        let typeRecursive = converter(field.type);
                        let tableRecursive = {}
                        let event = {}
                        let fields = []
                        tableRecursive.slug = relationReq.table_from
                        fields.push(
                            {
                                slug: field.slug,
                                type: typeRecursive
                            }
                        )
                        tableRecursive.fields = fields
                        event.payload = tableRecursive
                        // await sendMessageToTopic(con.TopicRecursiveRelationCreateV1, event)
                        break;
                    case 'Many2One':
                    case 'One2One':
                        relationReq.field_from = relationReq.table_to + "_id";
                        relationReq.field_to = "id";
                        // table = await Table.findOne({
                        //     slug: relationReq.table_from,
                        //     deleted_at: "1970-01-01T18:00:00.000+00:00",
                        // });
                        table =  await tableVersion(mongoConn, {slug: relationReq.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00"}, data.version_id, true)
                        result = await relationFieldChecker(relationReq.field_from, table.id, resource_guid)
                        if (result.exists) {
                            relationReq.field_from = result.lastField
                        }
                        field = new Field({
                            table_id: table.id,
                            slug: relationReq.field_from,
                            label: "FROM " + relationReq.table_from + " TO " + relationReq.table_to,
                            type: "LOOKUP",
                            relation_id: relationReq.id
                        });
                        let resp = await field.save();

                        const fieldPermissionTableOne1 = (await ObjectBuilder(true, resource_guid))["field_permission"]
                        for (const role of roles) {
                            let fieldPermission = {
                                field_id: resp.id,
                                table_slug: relationReq.table_from,
                                view_permission: true,
                                edit_permission: true,
                                guid: v4(),
                                role_id: role.guid,
                                label: "FROM " + relationReq.table_from + " TO " + relationReq.table_to
                            }

                            const fieldPermissionWithModel = new fieldPermissionTableOne1.models(fieldPermission)
                            await fieldPermissionWithModel.save()
                        }

                        console.log("response from field create while creating relation", resp);
                        let typeMany2One = converter(field.type);
                        let tableMany2One = {}
                        let eventMany2One = {}
                        let fieldsMany2One = []
                        tableMany2One.slug = relationReq.table_from
                        fieldsMany2One.push(
                            {
                                slug: field.slug,
                                type: typeMany2One
                            }
                        )
                        tableMany2One.fields = fieldsMany2One
                        eventMany2One.payload = tableMany2One
                        // await sendMessageToTopic(con.TopicMany2OneRelationCreateV1, eventMany2One)
                        break;
                    default:
                }
                const relation = new Relation(relationReq);
                const response = await relation.save();
                relationReq.id = v4()
                relationReq.type = relationReq.view_type
                relationReq["relation_id"] = relation.id
                relationReq["name"] = relationReq.title
                const view = new View(relationReq);
                const responseView = await view.save();
                const resp = await Table.updateMany({
                    slug: { $in: [relationReq.table_from, relationReq.table_to] },
                },
                    {
                        $set: {
                            is_changed: true
                        }
                    })
            }
            return { fields: responseFields, relations: responseRelations };
        } catch (err) {
            throw err
        }
    })
}

module.exports = fieldsRelationsStore;