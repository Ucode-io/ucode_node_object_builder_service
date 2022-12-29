const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const con = require("../../config/kafkaTopics");
const conn = require("../../helper/constants");
const sendMessageToTopic = require("../../config/kafka");
const converter = require("../../helper/converter");
const Relation = require("../../models/relation");
const { struct } = require('pb-util');
const ObjectBuilder = require("../../models/object_builder");
const mongoPool = require('../../pkg/pool');


let NAMESPACE = "storage.field";

let fieldStore = {
    createAll: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']

            data.fields.push({
                slug: "guid",
                label: "ID",
                default: "v4",
                index: true,
                unique: true,
                type: "UUID",
            });


            for (const fieldReq of data.fields) {
                if (conn.DYNAMIC_TYPES.includes(fieldReq.type) && fieldReq.autofill_field && fieldReq.autofill_table) {
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
                field.table_id = data.id;
                var response = field.save();
                const table = await Table.findOne({
                    id: data.id
                })
                const fieldPermissionTable = (await ObjectBuilder(true, data.project_id))["field_permission"]
                const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
                const roles = await roleTable?.models.find()
                for (const role of roles) {
                    let permission = {
                        view_permission: true,
                        edit_permission: true,
                        table_slug: table?.slug,
                        field_id: field.id,
                        label: field.label,
                        role_id: role.guid
                    }
                    const fieldPermission = new fieldPermissionTable.models(permission)
                    let resp = fieldPermission.save()
                }
            }
            const resp = await Table.updateOne({
                id: data.id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                })
            return response;
        } catch (err) {
            throw err
        }

    }),
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']

            if (conn.DYNAMIC_TYPES.includes(data.type) && data.autofill_field && data.autofill_table) {
                let autoFillTable = await Table.findOne({
                    slug: data.autofill_table
                })
                let autoFillFieldSlug = "", autoFillField = {}
                if (data.autofill_field.includes(".")) {
                    let splitedAutofillField = data.autofill_field.split(".")
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
                    autoFillFieldSlug = data.autofill_field
                }
                autoFillField = await Field.findOne({
                    slug: autoFillFieldSlug,
                    table_id: autoFillTable?.id
                })
                if (autoFillField) {
                    data.type = autoFillField.type
                    data.attributes = autoFillField.attributes
                }
            }

            const field = new Field(data);

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
            const fieldPermissionTable = (await ObjectBuilder(true, data.project_id))["field_permission"]
            const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
            const roles = await roleTable?.models.find()
            for (const role of roles) {
                let permission = {
                    view_permission: true,
                    edit_permission: true,
                    table_slug: table?.slug,
                    field_id: field.id,
                    label: field.label,
                    role_id: role.guid
                }
                const fieldPermission = new fieldPermissionTable.models(permission)
                let resp = fieldPermission.save()
            }
            let event = {}
            let tableRes = {}
            let fields = []
            tableRes.slug = table.slug

            let type = converter(field.type);
            if (field.slug !== "guid") {
                fields.push({
                    slug: field.slug,
                    type: type,
                })
            }


            tableRes.fields = fields
            event.payload = tableRes
            event.project_id = data.project_id
            await sendMessageToTopic(con.TopicFieldCreateV1, event)


            return response;
        } catch (err) {
            throw err
        }

    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']

            const fieldBeforUpdate = await Field.findOne(
                {
                    id: data.id,
                }
            )
            if (con.DYNAMIC_TYPES.includes(data.type) && data.autofill_field && data.autofill_table) {
                let autoFillTable = await Table.findOne({
                    slug: data.autofill_table
                })
                let autoFillFieldSlug = "", autoFillField = {}
                if (data.autofill_field.includes(".")) {
                    let splitedAutofillField = data.autofill_field.split(".")
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
                    autoFillFieldSlug = data.autofill_field
                }
                autoFillField = await Field.findOne({
                    slug: autoFillFieldSlug,
                    table_id: autoFillTable?.id
                })
                if (autoFillField) {
                    data.type = autoFillField.type
                    data.attributes = autoFillField.attributes
                }
            }
            const field = await Field.updateOne(
                {
                    id: data.id,
                },
                {
                    $set: data
                }
            )

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


            let event = {}
            let fieldRes = {}
            let fieldToAnalytics = {}
            let type = converter(data.type);
            fieldRes.table_slug = table.slug
            fieldRes.older_field_name = fieldBeforUpdate.slug

            if (field.slug !== "guid") {
                fieldToAnalytics = {
                    slug: data.slug,
                    type: type,
                }
            }
            fieldRes.field = fieldToAnalytics
            event.payload = fieldRes

            event.project_id = data.project_id
            await sendMessageToTopic(con.TopicFieldUpdateV1, event)

            return field;
        } catch (err) {
            throw err
        }

    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

            let table = {};
            if (data.table_id === "") {
                table = await Table.findOne({
                    slug: data.table_slug
                });
                data.table_id = table.id;
            }
            let query = {
                name: RegExp(data.search, "i"),
                table_id: data.table_id,
            }
            with_many_relations = data.with_many_relation
            with_one_relations = data.with_one_relation
            const fields = await Field.find(
                {
                    name: RegExp(data.search, "i"),
                    table_id: data.table_id,
                    // label: {"$ne": "IT'S RELATION"}
                },
                null,
                {
                    sort: { created_at: -1 }
                }
            ).skip(data.offset)
                .limit(data.limit);

            let many_relation_fields = [];
            if (with_many_relations) {

                const relations = await Relation.find({
                    $or: [{
                        $and: [{
                            table_to: table.slug
                        }, {
                            type: "Many2One"
                        }]
                    },
                    {
                        $and: [{
                            table_to: table.slug
                        }, {
                            type: "Many2Many"
                        }]
                    }
                    ]
                })

                for (const relation of relations) {
                    let relationTable = await Table.findOne({ slug: relation.table_from })

                    let relationFields = await Field.find(
                        {
                            table_id: relationTable.id
                        },
                        {
                            createdAt: 0,
                            updatedAt: 0,
                            created_at: 0,
                            updated_at: 0,
                            _id: 0,
                            __v: 0
                        })
                    for (const field of relationFields) {
                        let changedField = {}
                        if (field.type == "LOOKUP") {
                            let viewFields = []
                            childRelation = await Relation.findOne({ table_from: relationTable.slug, table_to: field.slug.slice(0, -3) })
                            if (childRelation) {
                                for (const view_field of childRelation.view_fields) {
                                    let viewField = await Field.findOne(
                                        {
                                            id: view_field
                                        },
                                        {
                                            createdAt: 0,
                                            updatedAt: 0,
                                            created_at: 0,
                                            updated_at: 0,
                                            _id: 0,
                                            __v: 0
                                        })
                                    if (viewField.attributes) {
                                        viewField.attributes = struct.decode(viewField.attributes)
                                    }
                                    viewFields.push(viewField._doc)
                                }
                            }

                            field._doc.view_fields = viewFields
                            let childRelationTable = await Table.findOne({ slug: field.slug.slice(0, -3) })
                            field._doc.table_label = relationTable.label
                            field.label = childRelationTable.label
                            changedField = field
                            changedField._doc.path_slug = relationTable.slug + "_id_data" + "." + field.slug
                            changedField._doc.table_slug = relationTable.slug
                            many_relation_fields.push(changedField._doc)
                        } else {
                            if (field.attributes) {
                                field.attributes = struct.decode(field.attributes)
                            }
                            field._doc.table_label = relationTable.label
                            changedField = field
                            changedField._doc.path_slug = relationTable.slug + "_id_data" + "." + field.slug
                            many_relation_fields.push(changedField._doc)
                        }
                    }

                }
            }
            let one_relation_fields = [];
            if (with_one_relations) {

                const relations = await Relation.find({
                    $or: [{
                        $and: [{
                            table_from: table.slug
                        }, {
                            type: "Many2One"
                        }]
                    },
                    {
                        $and: [{
                            table_from: table.slug
                        }, {
                            type: "Recursive"
                        }]
                    }
                    ]
                })

                for (const relation of relations) {
                    let relationTable = await Table.findOne({ slug: relation.table_to })
                    let relationFields = await Field.find(
                        {
                            table_id: relationTable.id
                        },
                        {
                            createdAt: 0,
                            updatedAt: 0,
                            created_at: 0,
                            updated_at: 0,
                            _id: 0,
                            __v: 0
                        })
                    for (const field of relationFields) {
                        let changedField = {}
                        if (field.type == "LOOKUP") {
                            let viewFields = []
                            childRelation = await Relation.findOne({ table_from: relationTable.slug, table_to: field.slug.slice(0, -3) })
                            if (childRelation) {
                                for (const view_field of childRelation.view_fields) {
                                    let viewField = await Field.findOne(
                                        {
                                            id: view_field
                                        },
                                        {
                                            createdAt: 0,
                                            updatedAt: 0,
                                            created_at: 0,
                                            updated_at: 0,
                                            _id: 0,
                                            __v: 0
                                        })
                                    if (viewField.attributes) {
                                        viewField.attributes = struct.decode(viewField.attributes)
                                    }
                                    viewFields.push(viewField._doc)
                                }
                            }

                            field._doc.view_fields = viewFields
                            let childRelationTable = await Table.findOne({ slug: field.slug.slice(0, -3) })
                            field._doc.table_label = relationTable.label
                            field.label = childRelationTable.label
                            changedField = field
                            changedField._doc.path_slug = relationTable.slug + "_id_data" + "." + field.slug
                            changedField._doc.table_slug = relationTable.slug
                            one_relation_fields.push(changedField._doc)
                        } else {
                            if (field.attributes) {
                                field.attributes = struct.decode(field.attributes)
                            }
                            field._doc.table_label = relationTable.label
                            field._doc.label = field._doc.label + " (" + relationTable.label + ")"
                            changedField = field
                            changedField._doc.path_slug = relationTable.slug + "_id_data" + "." + field.slug
                            one_relation_fields.push(changedField._doc)
                        }
                    }

                }
            }

            const response = struct.encode({
                one_relation_fields: one_relation_fields,
                many_relation_fields: many_relation_fields,
            });

            
            const count = await Field.countDocuments(query);
            return { fields: fields, count: count, data: response };
        } catch (err) {
            throw err
        }
    }),

    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']

            const deletedField = await Field.findOne({ id: data.id })
            const table = await Table.findOne({ id: deletedField.table_id })
            const field = await Field.deleteOne({ id: data.id });
            const fieldPermissionTable = (await ObjectBuilder(true, data.project_id))["field_permission"]
            const response = await fieldPermissionTable?.models.deleteMany({
                field_id: data.id
            })

            let event = {}
            let fieldRes = {}
            let fieldToAnalytics = {}
            let type = converter(deletedField.type);
            fieldRes.table_slug = table.slug
            if (field.slug !== "guid") {
                fieldToAnalytics = {
                    slug: deletedField.slug,
                    type: type,
                }
            }
            fieldRes.field = fieldToAnalytics
            event.payload = fieldRes

            event.project_id = data.project_id
            await sendMessageToTopic(con.TopicFieldDeleteV1, event)

            return field;

        } catch (err) {
            throw err
        }

    }),
};

module.exports = fieldStore;
