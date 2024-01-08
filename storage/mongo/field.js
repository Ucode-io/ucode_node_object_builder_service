const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const topics = require("../../config/kafkaTopics");
const con = require("../../helper/constants");
const sendMessageToTopic = require("../../config/kafka");
const converter = require("../../helper/converter");
const Relation = require("../../models/relation");
const { struct } = require('pb-util');
const ObjectBuilder = require("../../models/object_builder");
const mongoPool = require('../../pkg/pool');
const tableVersion = require('../../helper/table_version');
const { VERSION_SOURCE_TYPES_MAP, ACTION_TYPE_MAP } = require("../../helper/constants")
const os = require('os')


let NAMESPACE = "storage.field";

let fieldStore = {
    createAll: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const History = mongoConn.models['object_builder_service.version_history']

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
                if(fieldReq.is_system) {
                    fieldReq.is_system = false
                }
                if (con.DYNAMIC_TYPES.includes(fieldReq.type) && fieldReq.autofill_field && fieldReq.autofill_table) {
                    // let autoFillTable = await Table.findOne({
                    //     slug: fieldReq.autofill_table,

                    // })
                    let autoFillTable = await tableVersion(mongoConn, { slug: fieldReq.autofill_table }, data.version_id, true)
                    let autoFillFieldSlug = "", autoFillField = {}
                    if (fieldReq.autofill_field.includes(".")) {
                        let splitedAutofillField = fieldReq.autofill_field.split(".")
                        // autoFillTable = await Table.findOne({
                        //     slug: splitedAutofillField[0],

                        // })
                        autoFillTable = await tableVersion(mongoConn, { slug: splitedAutofillField[0] }, data.version_id, true)
                        let splitedTable = splitedAutofillField[0].split("_")
                        let tableSlug = ""
                        for (let i = 0; i < splitedTable.length - 2; i++) {
                            tableSlug = tableSlug + "_" + splitedTable[i]
                        }
                        tableSlug = tableSlug.slice(1, tableSlug.length)
                        // autoFillTable = await Table.findOne({
                        //     slug: tableSlug,

                        // })
                        autoFillTable = await tableVersion(mongoConn, { slug: tableSlug }, data.version_id, true)
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
                if (fieldReq.id) {
                    field.id = fieldReq.id
                }
                var response = field.save();
                // const table = await Table.findOne({
                //     id: data.id,

                // })
                const table = await tableVersion(mongoConn, { id: data.id }, data.version_id, true)
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
                        is_changed: true,
                        [`is_changed_by_host.${os.hostname()}`]: true
                    }
                })

            // await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.FIELD, action_type: ACTION_TYPE_MAP.CREATE, current: table })

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
            const Tab = mongoConn.models['Tab']
            const Section = mongoConn.models['Section']
            const Layout = mongoConn.models['Layout']
            const History = mongoConn.models['object_builder_service.version_history']

            if(!data.id) {
                data.id = v4()
            }

            if (con.DYNAMIC_TYPES.includes(data.type) && data.autofill_field && data.autofill_table) {
                let autoFillTableSlug = data.autofill_table
                if (data.autofill_table.includes("#")) {
                    autoFillTableSlug = data.autofill_table.split("#")[0]
                }
                let autoFillTable = await tableVersion(mongoConn, { slug: autoFillTableSlug }, data.version_id, true)
                let autoFillFieldSlug = "", autoFillField = {}
                if (data.autofill_field.includes(".")) {
                    let splitedAutofillField = data.autofill_field.split(".")
                    let splitedTable = splitedAutofillField[0].split("_")
                    let tableSlug = ""
                    for (let i = 0; i < splitedTable.length - 2; i++) {
                        tableSlug = tableSlug + "_" + splitedTable[i]
                    }
                    tableSlug = tableSlug.slice(1, tableSlug.length)
                    autoFillTable = await tableVersion(mongoConn, { slug: tableSlug }, data.version_id, true)
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
            const field = await Field.create(data);
            const table = await Table.findOneAndUpdate(
                {
                    id: data.table_id,

                },
                {
                    $set: {
                        is_changed: true,
                        is_changed_by_host: {
                            [os.hostname()]: true
                        }
                    }
                },
                {
                    new: true
                }
            )
         
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
                fieldPermission.save()
            }
     
            const layout = await Layout.findOne({table_id: table?.id})
   
            if (layout) {
                const tab = await Tab.findOne({layout_id: layout.id, type: 'section'})
                if (tab) {
                    let section = await Section.find({tab_id: tab.id}).sort({created_at: -1})
                    if(section[0]) {
                        const count_columns = section[0].fields ? section[0].fields.length : 0
                        if(count_columns < (table.section_column_count || 3)) {
                            await Section.findOneAndUpdate(
                                {
                                    id: section[0].id
                                }, 
                                {
                                    $set: {
                                        fields: [
                                            ...(count_columns ? section[0].fields : []),
                                            {
                                                id: field.id,
                                                order: count_columns + 1,
                                                field_name: field.label,
                                            }
                                        ]
                                    }
                                }
                            )
                        } else {
                            section = await Section.create({
                                id: v4(),
                                order: section.length + 1,
                                column: "SINGLE",
                                label: "Info",
                                icon: "",
                                fields: [
                                    {
                                        id: field.id,
                                        order: 1,
                                        field_name: field.label,
                                    }
                                ],
                                table_id: table.id,
                                attributes: {},
                                tab_id: tab.id
                            })

                            await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.SECTION, action_type: ACTION_TYPE_MAP.CREATE, current: struct.encode(JSON.parse(JSON.stringify(section))) })
                        }
                    }
                }
            }
         
            await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.FIELD, action_type: ACTION_TYPE_MAP.CREATE, current: struct.encode(JSON.parse(JSON.stringify(field))) })

            return field;
        } catch (err) {
            throw err
        }

    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const History = mongoConn.models['object_builder_service.version_history']

            const fieldBeforUpdate = await Field.findOne(
                {
                    id: data.id,
                }
            ).lean()
            if(fieldBeforUpdate && fieldBeforUpdate.is_system) {
                console.log("there #1")
                throw new Error("This field is system field")
            }

            if (con.DYNAMIC_TYPES.includes(data.type) && data.autofill_field && data.autofill_table) {
                // let autoFillTable = await Table.findOne({
                //     slug: data.autofill_table,

                // })
                let autoFillTableSlug = data.autofill_table
                if (data.autofill_table.includes("#")) {
                    autoFillTableSlug = data.autofill_table.split("#")[0]
                }
                let autoFillTable = await tableVersion(mongoConn, { slug: autoFillTableSlug }, data.version_id, true)
                let autoFillFieldSlug = "", autoFillField = {}
                if (data.autofill_field.includes(".")) {
                    let splitedAutofillField = data.autofill_field.split(".")
                    let splitedTable = splitedAutofillField[0].split("_")
                    let tableSlug = ""
                    for (let i = 0; i < splitedTable.length - 2; i++) {
                        tableSlug = tableSlug + "_" + splitedTable[i]
                    }
                    tableSlug = tableSlug.slice(1, tableSlug.length)
                    // autoFillTable = await Table.findOne({
                    //     slug: tableSlug,

                    // })
                    autoFillTable = await tableVersion(mongoConn, { slug: tableSlug }, data.version_id, true)
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
            // console.log("DATA::::::::::", data)
            const field = await Field.findOneAndUpdate(
                {
                    id: data.id,
                },
                {
                    $set: data
                },
                {
                    new: true
                }
            )
            let fieldPermissions = (await ObjectBuilder(true, data.project_id))["field_permission"]
            await fieldPermissions.models.updateMany({ field_id: data.id }, { $set: { label: data.label } })

            await Table.updateOne({
                id: data.table_id,
                },
                {
                    $set: {
                        is_changed: true,
                        is_changed_by_host: {
                            [os.hostname()]: true
                        }
                    }
                }
            )

            await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.FIELD, action_type: ACTION_TYPE_MAP.UPDATE, current: struct.encode(JSON.parse(JSON.stringify(field))), previus: struct.encode(JSON.parse(JSON.stringify(fieldBeforUpdate))) })

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
            let table = {}
            if (!data.table_id) {
                table = await tableVersion(mongoConn, { slug: data.table_slug }, data.version_id, true);
                data.table_id = table.id;
            } else {
                table = await tableVersion(mongoConn, { id: data.table_id }, data.version_id, true);
                data.table_slug = table.slug
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
                    let relationTable = await tableVersion(mongoConn, { slug: relation.table_from }, data.version_id, true)

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
                            let childRelationTable = await tableVersion(mongoConn, { slug: field.slug.slice(0, -3) }, data.version_id, true)
                            field._doc.table_label = relationTable?.label
                            field.label = childRelationTable?.label
                            changedField = field
                            changedField._doc.path_slug = relationTable?.slug + "_id_data" + "." + field.slug
                            changedField._doc.table_slug = relationTable?.slug
                            many_relation_fields.push(changedField._doc)
                        } else {
                            if (field.attributes) {
                                field.attributes = struct.decode(field.attributes)
                            }
                            field._doc.table_label = relationTable?.label
                            changedField = field
                            changedField._doc.path_slug = relationTable?.slug + "_id_data" + "." + field.slug
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
                    let relationTable = await tableVersion(mongoConn, { slug: relation.table_to }, data.version_id, true)
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
                                        }).lean()

                                    if (viewField) {
                                        if (viewField.attributes) {
                                            viewField.attributes = struct.decode(viewField.attributes)
                                        }
                                        viewFields.push(viewField)
                                    }
                                }
                            }

                            field._doc.view_fields = viewFields
                            let childRelationTable = await tableVersion(mongoConn, { slug: field.slug.slice(0, -3) }, data.version_id, true)
                            field._doc.table_label = relationTable?.label
                            field.label = childRelationTable?.label
                            changedField = field
                            changedField._doc.path_slug = relationTable?.slug + "_id_data" + "." + field.slug
                            changedField._doc.table_slug = relationTable?.slug
                            one_relation_fields.push(changedField._doc)
                        } else {
                            if (field.attributes) {
                                field.attributes = struct.decode(field.attributes)
                            }
                            field._doc.table_label = relationTable?.label
                            field._doc.label = field._doc?.label + " (" + relationTable?.label + ")"
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
    getAllForItems: catchWrapDb(`${NAMESPACE}.getAllForItems`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']
            const allTables = (await ObjectBuilder(true, req.project_id))
            const tableInfo = allTables[req.collection]
            if (!tableInfo) {
                throw new Error("table not found")
            }
            let fields = tableInfo.fields
            let tableRelationFields = {}

            fields.length && fields.forEach(field => {
                if (field.relation_id) {
                    tableRelationFields[field.relation_id] = field
                }
            })
            let relationsFields = []

            //new code

            if (req.with_relations) {
                let relation_table_to_slugs = [];
                for (const relation of relations) {
                    if (relation.type !== "Many2Dynamic") {
                        if (
                            relation.type === "Many2Many" &&
                            relation.table_to === req.table_slug
                        ) {
                            relation.table_to = relation.table_from;
                        }
                        relation_table_to_slugs.push(relation.table_to);
                    }
                }
                let relationTableIds = [];
                let relationTablesMap = {};
                if (relation_table_to_slugs.length > 0) {
                    let relationTables = await tableVersion(
                        mongoConn,
                        { slug: { $in: relation_table_to_slugs } },
                        req.version_id,
                        false
                    );
                    for (const relationTable of relationTables) {
                        relationTableIds.push(relationTable.id);
                        if (!relationTablesMap[relationTable.slug]) {
                            relationTablesMap[relationTable.slug] = relationTable;
                        }
                    }
                }
                let relationFieldSlugsR = [];
                let relationFieldsMap = {};
                if (relationTableIds.length > 0) {
                    const relationFieldsR = await Field.find(
                        {
                            table_id: { $in: relationTableIds },
                        },
                        {
                            createdAt: 0,
                            updatedAt: 0,
                            created_at: 0,
                            updated_at: 0,
                            _id: 0,
                            __v: 0,
                        }
                    );

                    for (const field of relationFieldsR) {
                        if (field.type == "LOOKUP" || field.type == "LOOKUPS") {
                            let table_slug;
                            if (field.type === "LOOKUP") {
                                table_slug = field.slug.slice(0, -3);
                            } else {
                                table_slug = field.slug.slice(0, -4);
                            }
                            relationFieldSlugsR.push(table_slug);
                        }
                        if (relationFieldsMap[field.table_id]) {
                            relationFieldsMap[field.table_id].push(field)
                        } else {
                            relationFieldsMap[field.table_id] = [field]
                        }
                    }
                }

                let childRelationsMap = {};
                let view_field_ids = [];
                if (relation_table_to_slugs.length > 0 && relationFieldSlugsR.length > 0) {
                    const childRelations = await Relation.find({
                        table_from: { $in: relation_table_to_slugs },
                        table_to: { $in: relationFieldSlugsR },
                    });
                    for (const childRelation of childRelations) {
                        if (!childRelationsMap[childRelation.table_from + "_" + childRelation.table_to]) {
                            childRelationsMap[childRelation.table_from + "_" + childRelation.table_to] = childRelation;
                        }
                        for (const view_field_id of childRelation.view_fields) {
                            view_field_ids.push(view_field_id);
                        }
                    }
                }
                let viewFieldsMap = {};
                if (view_field_ids.length > 0) {
                    const viewFields = await Field.find(
                        {
                            id: { $in: view_field_ids },
                        },
                        {
                            createdAt: 0,
                            updatedAt: 0,
                            created_at: 0,
                            updated_at: 0,
                            _id: 0,
                            __v: 0,
                        }
                    );
                    for (const view_field of viewFields) {
                        viewFieldsMap[view_field.id] = view_field;
                    }
                }
                let childRelationTablesMap = {};
                if (relationFieldSlugsR.length > 0) {
                    const childRelationTables = await tableVersion(
                        mongoConn,
                        { slug: { $in: relationFieldSlugsR } },
                        req.version_id,
                        false
                    );
                    for (const childRelationTable of childRelationTables) {
                        if (!childRelationTablesMap[childRelationTable.slug]) {
                            childRelationTablesMap[childRelationTable.slug] = childRelationTable;
                        }
                    }
                }

                for (const relation of relations) {
                    if (relation.type !== "Many2Dynamic") {
                        if (
                            relation.type === "Many2Many" &&
                            relation.table_to === req.table_slug
                        ) {
                            relation.table_to = relation.table_from;
                        }
                        let relationTable = relationTablesMap[relation.table_to];
                        const tableRelationFields = relationFieldsMap[relationTable?.id]
                        if (tableRelationFields) {
                            for (const field of tableRelationFields) {
                                let changedField = {};
                                if (field.type == "LOOKUP" || field.type == "LOOKUPS") {
                                    let viewFields = [];
                                    let table_slug;
                                    if (field.type === "LOOKUP") {
                                        table_slug = field.slug.slice(0, -3);
                                    } else {
                                        table_slug = field.slug.slice(0, -4);
                                    }

                                    const childRelation = childRelationsMap[relationTable.slug + "_" + table_slug];
                                    if (childRelation) {
                                        for (const view_field of childRelation.view_fields) {
                                            let viewField = viewFieldsMap[view_field]
                                            if (viewField) {
                                                if (viewField.attributes && viewField.attributes.fields) {
                                                    viewField.attributes = struct.decode(
                                                        viewField.attributes
                                                    );
                                                }
                                                viewFields.push(viewField._doc);
                                            }
                                        }
                                    }
                                    field._doc.view_fields = viewFields;
                                    let childRelationTable = childRelationTablesMap[table_slug];
                                    field._doc.table_label = relationTable?.label;
                                    field.label = childRelationTable?.label;
                                    changedField = field;
                                    changedField._doc.path_slug =
                                        relationTable?.slug + "_id_data" + "." + field.slug;
                                    changedField._doc.table_slug = table_slug;
                                    relationsFields.push(changedField._doc);
                                } else {
                                    if (field.attributes && field.attributes.fields) {
                                        field.attributes = struct.decode(field.attributes);
                                    }
                                    field._doc.table_label = relationTable?.label;
                                    changedField = field;
                                    changedField._doc.path_slug =
                                        relationTable?.slug + "_id_data" + "." + field.slug;
                                    relationsFields.push(changedField._doc);
                                }
                            }
                        }
                    }
                }
            }

            let { fieldsWithPermissions } = await AddPermission.toField(fields, role_id_from_token, req.table_slug, req.project_id)
            let decodedFields = []

            for (const element of fieldsWithPermissions) {
                if (element.attributes && !(element.type === "LOOKUP" || element.type === "LOOKUPS" || element.type === "DYNAMIC")) {
                    let field = { ...element }
                    field.attributes = struct.decode(element.attributes) 
                    decodedFields.push(field)
                } else {
                    let elementField = { ...element }
                    if (element.attributes) {
                        elementField.attributes = struct.decode(element.attributes)
                    }
                    viewFields = []
                    if (elementField?.attributes?.view_fields?.length) {
                        if (languageSetting) {
                            elementField.attributes.view_fields = elementField.attributes.view_fields.forEach(el => {
                                if (el && el?.slug && el.slug.endsWith("_" + languageSetting) && el.enable_multilanguage) {
                                    viewFields.push(el)
                                } else if (el && !el.enable_multilanguage) {
                                    viewFields.push(el)
                                }
                            })
                        } else {
                            viewFields = elementField?.attributes?.view_fields
                        }
                    }
                    elementField.view_fields = viewFields
                    decodedFields.push(elementField)
                }
            };

            const response = struct.encode({
                fields: decodedFields,
                relation_fields: relationsFields,
            });

            return { table_slug: req.table_slug, data: response }
        } catch (err) {
            throw err
        }
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const View = mongoConn.models['View']
            const History = mongoConn.models['object_builder_service.version_history']

            const deletedField = await Field.findOne({ id: data.id }).lean()
            if(deletedField && deletedField.is_system) {
                throw new Error("This field is system field")
            }
            // const table = await Table.findOne({ id: deletedField.table_id,  })
            const table = await tableVersion(mongoConn, { id: deletedField.table_id }, data.version_id, true)
            const field = await Field.findOneAndDelete({ id: data.id }, { new: true });
            const fieldPermissionTable = (await ObjectBuilder(true, data.project_id))["field_permission"]
            const response = await fieldPermissionTable?.models.deleteMany({
                field_id: data.id
            })

            const existsColumnView = await View.findOne({table_slug: table.slug}).lean()
            let columns = [], is_exists = false
            if(existsColumnView && existsColumnView.columns && existsColumnView.columns.length) {
                for(let id of existsColumnView.columns) {
                    if(id == deletedField.id) {
                        is_exists = true
                        continue
                    } else if(id) {
                        columns.push(id)
                    }

                }

                if(is_exists) {
                    await View.findOneAndUpdate(
                        {
                            id: existsColumnView.id
                        },
                        {
                            $set: {
                                columns: columns
                            }
                        }
                    )
                }
            }

            await Table.findOneAndUpdate(
                {
                    id: table.id,
                },
                {
                    $set: {
                        is_changed: true,
                        "is_changed_by_host": {
                            [os.hostname()]: true
                        }
                    },
                }
            )

            await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.FIELD, action_type: ACTION_TYPE_MAP.DELETE, current: {}, previus: struct.encode(JSON.parse(JSON.stringify(deletedField))) })

            return field;

        } catch (err) {
            throw err
        }

    }),
    CopyFields: catchWrapDb(`${NAMESPACE}.CopyFields`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const FieldModel = mongoConn.models['Field']
            const TabledModel = mongoConn.models['Table']
            const AllTables = (await ObjectBuilder(true, data.project_id))
            const FieldPermissionModel = AllTables["field_permission"]
            const RoleModel = AllTables["role"]

            const table_map = {}
            const tables = await TabledModel.find({ id: { $in: data.table_ids } }).lean()
            tables.map(el => {
                table_map[el.id] = el.slug
            })

            const field_map = {}
            data.fields.map(el => {
                field_map[el.id] = table_map[el.table_id]
            })

            let field_permissions = [];
            const roles = await RoleModel?.models.find().lean()
            let field_ids = []
            for (const field of data.fields) {
                field_ids.push(field.id)
                for (const role of roles) {
                    field_permissions.push({
                        view_permission: true,
                        edit_permission: true,
                        table_slug: field_map[field.id],
                        field_id: field.id,
                        label: field.label,
                        role_id: role.guid
                    })
                }
            }
            await FieldModel.deleteMany({ id: { $in: field_ids } })
            await FieldPermissionModel.models.deleteMany({ field_id: { $in: field_ids } })

            await FieldModel.insertMany(data.fields)
            await FieldPermissionModel.models.insertMany(field_permissions)

            return data.fields;
        } catch (err) {
            throw err
        }

    }),
};

module.exports = fieldStore;
