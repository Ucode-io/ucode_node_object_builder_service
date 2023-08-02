const catchWrapDb = require("../../helper/catchWrapDb");
const converter = require("../../helper/converter");
const tableVersion = require("../../helper/table_version");
const con = require("../../config/kafkaTopics");
const sendMessageToTopic = require("../../config/kafka");
const { v4 } = require("uuid");
const { struct } = require("pb-util");
const relationFieldChecker = require("../../helper/relationFieldChecker");
const ObjectBuilder = require("../../models/object_builder");
const cfg = require("../../config/index");
const mongoPool = require("../../pkg/pool");
const AddPermission = require("../../helper/addPermission");
const TabSchema = require("../../schemas/tab");

let NAMESPACE = "storage.relation";

let relationStore = {
    createAll: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Relation = mongoConn.models["Relation"];

            for (const relationReq of data.relations) {
                const relation = new Relation(relationReq);
                relation.table_from = data.id;
                var response = relation.save();
            }
            return response;
        } catch (err) {
            throw err;
        }
    }),
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Table = mongoConn.models["Table"];
            const Field = mongoConn.models["Field"];
            const View = mongoConn.models["View"];
            const Relation = mongoConn.models["Relation"];

            const roleTable = (await ObjectBuilder(true, data.project_id))[
                "role"
            ];
            const roles = await roleTable?.models.find();

            let table = {};
            let field = {};
            let result = {};
            if (!data["id"]) {
                data["id"] = v4();
            }
            switch (data.type) {
                case "One2Many":
                    data.field_from = "id";
                    data.field_to = data.table_from + "_id";
                    // table = await Table.findOne({
                    //     slug: data.table_to,
                    //     deleted_at: "1970-01-01T18:00:00.000+00:00",
                    // });
                    table = await tableVersion(mongoConn, { slug: data.table_to, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                    result = await relationFieldChecker(data.field_to, table.id, data.project_id)
                    if (result.exists) {
                        data.field_to = result.lastField;
                    }
                    field = new Field({
                        table_id: table.id,
                        slug: data.field_to,
                        label:
                            "FROM " + data.table_from + " TO " + data.table_to,
                        type: "LOOKUP",
                        relation_id: data.id,
                    });
                    let response = await field.save();

                    const fieldPermissionTableOne = (
                        await ObjectBuilder(true, data.project_id)
                    )["field_permission"];
                    for (const role of roles) {
                        let fieldPermission = {
                            field_id: response.id,
                            table_slug: data.table_to,
                            view_permission: true,
                            edit_permission: true,
                            guid: v4(),
                            role_id: role.guid,
                            label:
                                "FROM " +
                                data.table_from +
                                " TO " +
                                data.table_to,
                        };

                        const fieldPermissionWithModel =
                            new fieldPermissionTableOne.models(fieldPermission);
                        fieldPermissionWithModel.save();
                    }

                    console.log(
                        "response from field create while creating relation",
                        response
                    );
                    break;
                case 'Many2Dynamic':
                    data.field_from = data.relation_field_slug
                    data.field_to = "id"
                    // table = await Table.findOne({
                    //     slug: data.table_from,
                    //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                    // });
                    table = await tableVersion(mongoConn, { slug: data.table_from }, data.version_id, true)
                    field = new Field({
                        table_id: table.id,
                        slug: data.relation_field_slug,
                        label: "FROM " + data.table_from + " TO DYNAMIC",
                        type: "DYNAMIC",
                        relation_id: data.id,
                    });
                    let output = await field.save();

                    const fieldPermissionTableDynamic = (
                        await ObjectBuilder(true, data.project_id)
                    )["field_permission"];
                    for (const role of roles) {
                        let fieldPermission = {
                            field_id: output.id,
                            table_slug: data.table_from,
                            view_permission: true,
                            edit_permission: true,
                            guid: v4(),
                            role_id: role.guid,
                            label: "FROM " + data.table_from + " TO DYNAMIC",
                        };

                        const fieldPermissionWithModel =
                            new fieldPermissionTableDynamic.models(
                                fieldPermission
                            );
                        fieldPermissionWithModel.save();
                    }

                    console.log(
                        "response from field create while creating relation",
                        output
                    );
                    break;
                case "Many2Many":
                    data.field_from = data.table_to + "_ids";
                    data.field_to = data.table_from + "_ids";
                    // let tableTo = await Table.findOne({
                    //     slug: data.table_to,
                    //     deleted_at: "1970-01-01T18:00:00.000+00:00",
                    // });
                    let tableTo = await tableVersion(mongoConn, { slug: data.table_to, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                    result = await relationFieldChecker(data.field_to, tableTo.id, data.project_id)
                    if (result.exists) {
                        data.field_to = result.lastField;
                    }
                    field = new Field({
                        table_id: tableTo.id,
                        required: false,
                        slug: data.field_to,
                        label:
                            "FROM " + data.table_from + " TO " + data.table_to,
                        type: "LOOKUPS",
                        relation_id: data.id,
                    });
                    let res = await field.save();

                    const fieldPermissionTableMany1 = (
                        await ObjectBuilder(true, data.project_id)
                    )["field_permission"];
                    for (const role of roles) {
                        let fieldPermission = {
                            field_id: res.id,
                            table_slug: data.table_to,
                            view_permission: true,
                            edit_permission: true,
                            guid: v4(),
                            role_id: role.guid,
                            label:
                                "FROM " +
                                data.table_from +
                                " TO " +
                                data.table_to,
                        };

                        const fieldPermissionWithModel =
                            new fieldPermissionTableMany1.models(
                                fieldPermission
                            );
                        fieldPermissionWithModel.save();
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
                    //     slug: data.table_from,
                    //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                    // });
                    tableFrom = await tableVersion(mongoConn, { slug: data.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                    result = await relationFieldChecker(data.field_from, tableFrom.id, data.project_id)
                    if (result.exists) {
                        data.field_from = result.lastField;
                    }
                    field = new Field({
                        table_id: tableFrom.id,
                        required: false,
                        slug: data.field_from,
                        label:
                            "FROM " + data.table_from + " TO " + data.table_to,
                        type: "LOOKUPS",
                        relation_id: data.id,
                    });
                    res = await field.save();

                    const fieldPermissionTableMany2 = (
                        await ObjectBuilder(true, data.project_id)
                    )["field_permission"];
                    for (const role of roles) {
                        let fieldPermission = {
                            field_id: res.id,
                            table_slug: data.table_from,
                            view_permission: true,
                            edit_permission: true,
                            guid: v4(),
                            role_id: role.guid,
                            label:
                                "FROM " +
                                data.table_from +
                                " TO " +
                                data.table_to,
                        };

                        const fieldPermissionWithModel =
                            new fieldPermissionTableMany2.models(
                                fieldPermission
                            );
                        fieldPermissionWithModel.save();
                    }

                    console.log(
                        "response from field create while creating relation",
                        res
                    );
                    // await sendMessageToTopic(
                    //     con.TopicRelationToCreateV1,
                    //     eventTo
                    // );
                    type = converter(field.type);
                    let fieldsTo = [];
                    let eventFrom = {};
                    tableRes.slug = tableFrom.slug;
                    fieldsTo.push({
                        slug: field.slug,
                        type: type,
                    });
                    tableRes.fields = fieldsTo;
                    eventFrom.payload = tableRes;
                    // await sendMessageToTopic(
                    //     con.TopicRelationFromCreateV1,
                    //     eventFrom
                    // );
                    break;
                case "Recursive":
                    data.recursive_field = data.table_from + "_id";
                    data.field_from = "id";
                    data.field_to = data.table_from + "_id";
                    // table = await Table.findOne({
                    //     slug: data.table_from,
                    //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                    // });
                    table = await tableVersion(mongoConn, { slug: data.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                    result = await relationFieldChecker(data.recursive_field, table.id, data.project_id)
                    if (result.exists) {
                        data.recursive_field = result.lastField;
                    }
                    field = new Field({
                        table_id: table.id,
                        required: false,
                        slug: data.recursive_field,
                        label:
                            "FROM " +
                            data.table_from +
                            " TO " +
                            data.table_from,
                        type: "LOOKUP",
                        relation_id: data.id,
                    });
                    let responsee = await field.save();

                    const fieldPermissionTableRecursive = (
                        await ObjectBuilder(true, data.project_id)
                    )["field_permission"];
                    for (const role of roles) {
                        let fieldPermission = {
                            field_id: responsee.id,
                            table_slug: data.table_from,
                            view_permission: true,
                            edit_permission: true,
                            guid: v4(),
                            role_id: role.guid,
                            label:
                                "FROM " +
                                data.table_from +
                                " TO " +
                                data.table_from,
                        };

                        const fieldPermissionWithModel =
                            new fieldPermissionTableRecursive.models(
                                fieldPermission
                            );
                        fieldPermissionWithModel.save();
                    }

                    console.log(
                        "response from field create while creating recursive relation======>",
                        responsee
                    );

                    let typeRecursive = converter(field.type);
                    let tableRecursive = {};
                    let event = {};
                    let fields = [];
                    tableRecursive.slug = data.table_from;
                    fields.push({
                        slug: field.slug,
                        type: typeRecursive,
                    });
                    tableRecursive.fields = fields;
                    event.payload = tableRecursive;
                    // await sendMessageToTopic(
                    //     con.TopicRecursiveRelationCreateV1,
                    //     event
                    // );
                    break;
                case "Many2One":
                case "One2One":
                    data.field_from = data.table_to + "_id";
                    data.field_to = "id";
                    // table = await Table.findOne({
                    //     slug: data.table_from,
                    //     deleted_at: "1970-01-01T18:00:00.000+00:00",
                    // });
                    table = await tableVersion(mongoConn, { slug: data.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                    result = await relationFieldChecker(data.field_from, table.id, data.project_id)
                    if (result.exists) {
                        data.field_from = result.lastField;
                    }
                    field = new Field({
                        table_id: table.id,
                        slug: data.field_from,
                        label:
                            "FROM " + data.table_from + " TO " + data.table_to,
                        type: "LOOKUP",
                        relation_id: data.id,
                    });
                    let resp = await field.save();

                    const fieldPermissionTableOne1 = (
                        await ObjectBuilder(true, data.project_id)
                    )["field_permission"];
                    for (const role of roles) {
                        let fieldPermission = {
                            field_id: resp.id,
                            table_slug: data.table_from,
                            view_permission: true,
                            edit_permission: true,
                            guid: v4(),
                            role_id: role.guid,
                            label:
                                "FROM " +
                                data.table_from +
                                " TO " +
                                data.table_to,
                        };

                        const fieldPermissionWithModel =
                            new fieldPermissionTableOne1.models(
                                fieldPermission
                            );
                        fieldPermissionWithModel.save();
                    }

                    console.log(
                        "response from field create while creating relation",
                        resp
                    );
                    let typeMany2One = converter(field.type);
                    let tableMany2One = {};
                    let eventMany2One = {};
                    let fieldsMany2One = [];
                    tableMany2One.slug = data.table_from;
                    fieldsMany2One.push({
                        slug: field.slug,
                        type: typeMany2One,
                    });
                    tableMany2One.fields = fieldsMany2One;
                    eventMany2One.payload = tableMany2One;
                    // await sendMessageToTopic(
                    //     con.TopicMany2OneRelationCreateV1,
                    //     eventMany2One
                    // );
                    break;
                default:
            }
            const relation = new Relation(data);
            const response = await relation.save();
            let tableSlugs = [data.table_slug];
            if (relation.type === "Many2Dynamic") {
                for (const dynamicTable of relation.dynamic_tables) {
                    data.id = v4();
                    data.type = data.view_type;
                    data["relation_id"] = relation.id;
                    data["name"] = data.title;
                    data["name_uz"] = data.title_uz;
                    data["name_en"] = data.title_en
                    data["relation_table_slug"] = dynamicTable.table_slug;
                    if (!data.columns || !data.columns.length) {
                        data.columns = [];
                    }
                    const view = new View(data);
                    const responseView = await view.save();
                    tableSlugs.push(dynamicTable.table_slug);
                }
            } else {
                data.id = v4();
                data.type = data.view_type;
                data["relation_id"] = relation.id;
                data["name"] = data.title;
                data["name_uz"] = data.title_uz;
                data["name_en"] = data.title_en;
                const view = new View(data);
                const responseView = await view.save();
                tableSlugs.push(data.table_to);
            }

            const resp = await Table.updateMany(
                {
                    slug: { $in: tableSlugs },
                },
                {
                    $set: {
                        is_changed: true,
                    },
                }
            );

            return response;
        } catch (err) {
            throw err;
        }
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Table = mongoConn.models["Table"];
            const View = mongoConn.models["View"];
            const Relation = mongoConn.models["Relation"];

            const relationBeforeUpdate = await Relation.findOne({id: data.id})
            if(relationBeforeUpdate && relationBeforeUpdate.is_system) {
                throw new Error("This relation is system relation");
            }

            const relation = await Relation.updateOne(
                {
                    id: data.id,
                },
                {
                    $set: data,
                }
            );

            const resp = await Table.updateOne(
                {
                    slug: { $in: [data.table_from, data.table_to] },
                },
                {
                    $set: {
                        is_changed: true,
                    },
                }
            );
            const isViewExists = await View.findOne({
                $and: [
                    {
                        relation_table_slug: data.relation_table_slug,
                    },
                    {
                        relation_id: data.id,
                    },
                ],
            });
            let viewRelationPermissions = (await ObjectBuilder(true, data.project_id))["view_relation_permission"]
            const res = await viewRelationPermissions.models.updateMany({ relation_id: data.id, table_slug: data.relation_table_slug }, { $set: { label: data.title } })
            if (isViewExists) {
                console.log(" >>>> is data ", data)
                const view = await View.updateOne(
                    {
                        $and: [
                            { relation_table_slug: data.relation_table_slug },
                            { relation_id: data.id },
                        ],
                    },
                    {
                        $set: {
                            name: data.title,
                            quick_filters: data.quick_filters,
                            group_fields: data.group_fields,
                            columns: data.columns,
                            is_editable: data.is_editable,
                            relation_table_slug: data.relation_table_slug,
                            relation_id: data.id,
                            type: data.view_type,
                            summaries: data.summaries,
                            default_values: data.default_values,
                            action_relations: data.action_relations,
                            default_limit: data.default_limit,
                            multiple_insert: data.multiple_insert,
                            multiple_insert_field: data.multiple_insert_field,
                            updated_fields: data.updated_fields,
                            function_path: data.function_path,
                            default_editable: data.default_editable,
                            creatable: data.creatable,
                            function_path: data.function_path,
                            name_uz: data.title_uz,
                            name_en: data.title_en,
                        },
                    }
                );
            } else {
                data.type = data.view_type;
                data["name"] = data.title;
                data["name_uz"] = data.title_uz;
                data["name_en"] = data.title_en;
                data["relation_id"] = data.id;
                data.id = v4();
                const view = new View(data);
                const response = await view.save();
            }

            return relation;
        } catch (err) {
            throw err;
        }
    }),
    getAllForViewRelation: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Table = mongoConn.models["Table"];
            const Field = mongoConn.models["Field"];
            const View = mongoConn.models["View"];
            const Relation = mongoConn.models["Relation"];

            if (data.table_slug === "") {
                // let table = await Table.findOne({
                //     id: data.table_id
                // });
                let table = await tableVersion(mongoConn, { id: data.table_id }, data.version_id, true)
                data.table_slug = table.slug;
            }
            const relations = await Relation.find(
                {
                    $or: [
                        {
                            table_from: data.table_slug,
                        },
                        {
                            table_to: data.table_slug,
                        },
                        {
                            "dynamic_tables.table_slug": data.table_slug,
                        },
                    ],
                },
                null,
                {
                    sort: { created_at: -1 },
                }
            )
                .skip(data.offset)
                .limit(data.limit)
                .populate("fields")
                .lean();

            let responseRelations = [];
            for (let i = 0; i < relations.length; i++) {
                let tableFrom = await Table.findOne({
                    slug: relations[i].table_from,
                })
                if (relations[i].type === "Many2Dynamic") {
                    for (const dynamic_table of relations[i].dynamic_tables) {
                        if (dynamic_table.table_slug === data.table_slug || tableFrom.slug === data.table_slug) {
                            // let tableTo = await Table.findOne({
                            //     slug: dynamic_table.table_slug,
                            // })
                            let tableTo = await tableVersion(mongoConn, { slug: dynamic_table.table_slug }, data.version_id, true)
                            let view = await View.findOne({
                                $and: [
                                    { relation_table_slug: data.table_slug },
                                    { relation_id: relations[i].id },
                                ],
                            });
                            viewFieldsInDynamicTable = [];
                            for (const fieldId of dynamic_table.view_fields) {
                                let view_field = await Field.findOne(
                                    {
                                        id: fieldId,
                                    },
                                    {
                                        created_at: 0,
                                        updated_at: 0,
                                        createdAt: 0,
                                        updatedAt: 0,
                                        _id: 0,
                                        __v: 0,
                                    }
                                );
                                if (view_field) {
                                    if (view_field.attributes) {
                                        view_field.attributes = struct.decode(
                                            view_field.attributes
                                        );
                                    }
                                    viewFieldsInDynamicTable.push(
                                        view_field._doc
                                    );
                                }
                            }
                            let responseRelation = {
                                id: relations[i].id,
                                table_from: tableFrom,
                                table_to: tableTo,
                                type: relations[i].type,
                                view_fields: viewFieldsInDynamicTable,
                                editable: relations[i].editable,
                                dynamic_tables: relations[i].dynamic_tables,
                                relation_field_slug:
                                    relations[i].relation_field_slug,
                                auto_filters: relations[i].auto_filters,
                                is_user_id_default:
                                    relations[i].is_user_id_default,
                                cascadings: relations[i].cascadings,
                                object_id_from_jwt:
                                    relations[i].object_id_from_jwt,
                                cascading_tree_table_slug:
                                    relations[i].cascading_tree_table_slug,
                                cascading_tree_field_slug:
                                    relations[i].cascading_tree_field_slug,
                                relation_buttons: relations[i].relation_buttons
                            };
                            if (view) {
                                responseRelation["title"] = view.name;
                                responseRelation["columns"] = view.columns;
                                responseRelation["quick_filters"] =
                                    view.quick_filters;
                                responseRelation["group_fields"] =
                                    view.group_fields;
                                responseRelation["is_editable"] =
                                    view.is_editable;
                                responseRelation["relation_table_slug"] =
                                    view.relation_table_slug;
                                responseRelation["view_type"] = view.type;
                                responseRelation["summaries"] = view.summaries;
                                responseRelation["relation_id"] =
                                    view.relation_id;
                                responseRelation["default_values"] =
                                    view.default_values;
                                responseRelation["action_relations"] =
                                    view.action_relations;
                                responseRelation["default_limit"] =
                                    view.default_limit;
                                responseRelation["multiple_insert"] =
                                    view.multiple_insert;
                                responseRelation["multiple_insert_field"] =
                                    view.multiple_insert_field;
                                responseRelation["updated_fields"] =
                                    view.updated_fields;
                                responseRelation["default_editable"] = view.default_editable;
                                responseRelation["creatable"] = view.creatable;
                                responseRelation["function_path"] = view.function_path;
                                responseRelation["title_uz"] = view.name_uz;
                                responseRelation["title_en"] = view.name_en;
                            }
                            responseRelations.push(responseRelation);
                        }
                    }
                    continue;
                }
                // let tableTo = await Table.findOne({
                //     slug: relations[i].table_to
                // })
                let tableTo = await tableVersion(mongoConn, { slug: relations[i].table_to }, data.version_id, true)
                let view = await View.findOne({
                    $and: [
                        { relation_table_slug: data.table_slug },
                        { relation_id: relations[i].id },
                    ],
                });
                let responseRelation = {
                    id: relations[i].id,
                    table_from: tableFrom,
                    table_to: tableTo,
                    type: relations[i].type,
                    view_fields: relations[i].fields,
                    editable: relations[i].editable,
                    dynamic_tables: relations[i].dynamic_tables,
                    relation_field_slug: relations[i].relation_field_slug,
                    auto_filters: relations[i].auto_filters,
                    is_user_id_default: relations[i].is_user_id_default,
                    cascadings: relations[i].cascadings,
                    object_id_from_jwt: relations[i].object_id_from_jwt,
                    cascading_tree_table_slug:
                        relations[i].cascading_tree_table_slug,
                    cascading_tree_field_slug:
                        relations[i].cascading_tree_field_slug,
                    relation_buttons: relations[i].relation_buttons
                };
                if (view) {
                    responseRelation["title"] = view.name;
                    responseRelation["columns"] = view.columns;
                    responseRelation["quick_filters"] = view.quick_filters;
                    responseRelation["group_fields"] = view.group_fields;
                    responseRelation["is_editable"] = view.is_editable;
                    responseRelation["relation_table_slug"] =
                        view.relation_table_slug;
                    responseRelation["view_type"] = view.type;
                    responseRelation["summaries"] = view.summaries;
                    responseRelation["relation_id"] = view.relation_id;
                    responseRelation["default_values"] = view.default_values;
                    responseRelation["action_relations"] =
                        view.action_relations;
                    responseRelation["default_limit"] = view.default_limit;
                    responseRelation["multiple_insert"] = view.multiple_insert;
                    responseRelation["multiple_insert_field"] =
                        view.multiple_insert_field;
                    responseRelation["updated_fields"] = view.updated_fields;
                    responseRelation["default_editable"] = view.default_editable;
                    responseRelation["creatable"] = view.creatable;
                    responseRelation["function_path"] = view.function_path;
                    responseRelation["title_uz"] = view.name_uz;
                    responseRelation["title_en"] = view.name_en;
                }
                responseRelations.push(responseRelation);
            }

            const count = await Relation.countDocuments({
                table_from: data.table_slug,
            });

            return { relations: responseRelations, count: count };
        } catch (err) {
            throw err;
        }
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Table = mongoConn.models["Table"];
            const View = mongoConn.models["View"];
            const Relation = mongoConn.models["Relation"];

            if (data.table_slug === "") {
                // let table = await Table.findOne({
                //     id: data.table_id
                // });
                let table = await tableVersion(mongoConn, { id: data.table_id }, data.version_id, true)
                data.table_slug = table.slug;
            }
            const relations = await Relation.find(
                {
                    $or: [
                        {
                            table_from: data.table_slug,
                        },
                        {
                            table_to: data.table_slug,
                        },
                        {
                            "dynamic_tables.table_slug": data.table_slug,
                        },
                    ],
                },
                null,
                {
                    sort: { created_at: -1 },
                }
            )
                .skip(data.offset)
                .limit(data.limit)
                .populate("fields")
                .lean();

            let responseRelations = [];
            for (let i = 0; i < relations.length; i++) {
                // let tableFrom = await Table.findOne({
                //     slug: relations[i].table_from
                // })
                let tableFrom = await tableVersion(mongoConn, { slug: relations[i].table_from }, data.version_id, true)
                if (relations[i].type === "Many2Dynamic") {
                    let tableTo;
                    for (const dynamic_table of relations[i].dynamic_tables) {
                        if (dynamic_table.table_slug === data.table_slug) {
                            // tableTo = await Table.findOne({
                            //     slug: dynamic_table.table_slug
                            // })
                            tableTo = await tableVersion(mongoConn, { slug: dynamic_table.table_slug }, data.version_id, true)
                        }
                    }
                    let responseRelation = {
                        id: relations[i].id,
                        table_from: tableFrom,
                        field_from: relations[i].field_from,
                        field_to: relations[i].field_to,
                        type: relations[i].type,
                        view_fields: relations[i].fields,
                        editable: relations[i].editable,
                        dynamic_tables: relations[i].dynamic_tables,
                        relation_field_slug: relations[i].relation_field_slug,
                        auto_filters: relations[i].auto_filters,
                        is_user_id_default: relations[i].is_user_id_default,
                        cascadings: relations[i].cascadings,
                        object_id_from_jwt: relations[i].object_id_from_jwt,
                        cascading_tree_table_slug:
                            relations[i].cascading_tree_table_slug,
                        cascading_tree_field_slug:
                            relations[i].cascading_tree_field_slug,
                    };
                    if (tableTo) {
                        responseRelation["table_to"] = tableTo;
                    }
                    let view = await View.findOne({
                        $and: [
                            { relation_table_slug: data.table_slug },
                            { relation_id: relations[i].id },
                        ],
                    });
                    if (view) {
                        responseRelation["title"] = view.name;
                        responseRelation["columns"] = view.columns;
                        responseRelation["quick_filters"] = view.quick_filters;
                        responseRelation["group_fields"] = view.group_fields;
                        responseRelation["is_editable"] = view.is_editable;
                        responseRelation["relation_table_slug"] =
                            view.relation_table_slug;
                        responseRelation["view_type"] = view.type;
                        responseRelation["summaries"] = view.summaries;
                        responseRelation["relation_id"] = view.relation_id;
                        responseRelation["default_values"] =
                            view.default_values;
                        responseRelation["action_relations"] =
                            view.action_relations;
                        responseRelation["default_limit"] = view.default_limit;
                        responseRelation["multiple_insert"] =
                            view.multiple_insert;
                        responseRelation["multiple_insert_field"] =
                            view.multiple_insert_field;
                        responseRelation["updated_fields"] =
                            view.updated_fields;
                        responseRelation["title_uz"] = view.name_uz;
                        responseRelation["title_en"] = view.name_en;
                    }
                    responseRelations.push(responseRelation);
                    continue;
                }
                // let tableTo = await Table.findOne({
                //     slug: relations[i].table_to
                // })
                let tableTo = await tableVersion(mongoConn, { slug: relations[i].table_to }, data.version_id, true)
                let view = await View.findOne({
                    $and: [
                        { relation_table_slug: data.table_slug },
                        { relation_id: relations[i].id },
                    ],
                });
                let responseRelation = {
                    id: relations[i].id,
                    table_from: tableFrom,
                    table_to: tableTo,
                    field_from: relations[i].field_from,
                    field_to: relations[i].field_to,
                    type: relations[i].type,
                    view_fields: relations[i].fields,
                    editable: relations[i].editable,
                    dynamic_tables: relations[i].dynamic_tables,
                    relation_field_slug: relations[i].relation_field_slug,
                    auto_filters: relations[i].auto_filters,
                    is_user_id_default: relations[i].is_user_id_default,
                    cascadings: relations[i].cascadings,
                    object_id_from_jwt: relations[i].object_id_from_jwt,
                    cascading_tree_table_slug:
                        relations[i].cascading_tree_table_slug,
                    cascading_tree_field_slug:
                        relations[i].cascading_tree_field_slug,
                };
                if (view) {
                    responseRelation["title"] = view.name;
                    responseRelation["columns"] = view.columns;
                    responseRelation["quick_filters"] = view.quick_filters;
                    responseRelation["group_fields"] = view.group_fields;
                    responseRelation["is_editable"] = view.is_editable;
                    responseRelation["relation_table_slug"] =
                        view.relation_table_slug;
                    responseRelation["view_type"] = view.type;
                    responseRelation["summaries"] = view.summaries;
                    responseRelation["relation_id"] = view.relation_id;
                    responseRelation["default_values"] = view.default_values;
                    responseRelation["action_relations"] =
                        view.action_relations;
                    responseRelation["default_limit"] = view.default_limit;
                    responseRelation["multiple_insert"] = view.multiple_insert;
                    responseRelation["multiple_insert_field"] =
                        view.multiple_insert_field;
                    responseRelation["updated_fields"] = view.updated_fields;
                    responseRelation["title_uz"] = view.name_uz;
                    responseRelation["title_en"] = view.name_en;
                }
                responseRelations.push(responseRelation);
            }
            const count = await Relation.countDocuments({
                table_from: data.table_slug,
            });

            return { relations: responseRelations, count: count };
        } catch (err) {
            throw err;
        }
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Table = mongoConn.models["Table"];
            const Field = mongoConn.models["Field"];
            const View = mongoConn.models["View"];
            const Relation = mongoConn.models["Relation"];
            const Tab = mongoConn.models["Tab"];

            const relation = await Relation.findOne({ id: data.id });
            if(relation && relation.is_system) {
                throw new Error("This relation is system relation")
            }
            let table, resp, field = {}
            let tableResp = {}
            let event = {}
            let fields = []
            if (relation.type === 'One2Many') {
                // table = await Table.findOne({
                //     slug: relation.table_to,
                //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                // });
                table = await tableVersion(mongoConn, { slug: relation.table_to, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                // resp = await Field.deleteOne({
                //     table_id: table.id,
                //     slug: relation.field_to,
                //     relation_id: relation.id
                // });
                field.slug = relation.field_from
                fields.push(field)
                tableResp.slug = table.slug
                tableResp.fields = fields
                event.payload = tableResp
                // await sendMessageToTopic(con.TopicRelationDeleteV1, event)
            } else if (relation.type === 'Many2Many') {
                // table = await Table.findOne({
                //     slug: relation.table_to,
                //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                // });
                table = await tableVersion(mongoConn, { slug: relation.table_to, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                resp = await Field.deleteOne({
                    table_id: table.id,
                    slug: relation.field_to,
                    relation_id: relation.id,
                });
                field.slug = relation.field_to
                fields.push(field)
                tableResp.slug = table.slug
                tableResp.fields = fields
                event.payload = tableResp
                // await sendMessageToTopic(con.TopicRelationDeleteV1, event)
                // table = await Table.findOne({
                //     slug: relation.table_from,
                //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                // });
                table = await tableVersion(mongoConn, { slug: relation.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                resp = await Field.deleteOne({
                    table_id: table.id,
                    slug: relation.field_from,
                    relation_id: relation.id,
                });
                field.slug = relation.field_from;
                fields.push(field);
                tableResp.slug = table.slug;
                tableResp.fields = fields;
                event.payload = tableResp;
                // await sendMessageToTopic(con.TopicRelationDeleteV1, event);
            } else if (relation.type === "Recursive") {
                // table = await Table.findOne({
                //     slug: relation.table_from,
                //     deleted_at: '1970-01-01T18:00:00.000+00:00'
                // });
                table = await tableVersion(mongoConn, { slug: relation.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                resp = await Field.deleteOne({
                    table_id: table.id,
                    slug: relation.field_to,
                    relation_id: relation.id,
                });
                field.slug = relation.field_to;
                fields.push(field);
                tableResp.slug = table.slug;
                tableResp.fields = fields;
                event.payload = tableResp;
                // await sendMessageToTopic(con.TopicRelationDeleteV1, event);
            } else {
                // table = await Table.findOne({
                //     slug: relation.table_from,
                //     deleted_at: '1970-01-01T18:00:00.000+00:00'
                // });
                table = await tableVersion(mongoConn, { slug: relation.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                resp = await Field.deleteOne({
                    table_id: table.id,
                    slug: relation.field_from,
                    relation_id: relation.id,
                });
                field.slug = relation.field_from;
                fields.push(field);
                tableResp.slug = table.slug;
                tableResp.fields = fields;
                event.payload = tableResp;
                // await sendMessageToTopic(con.TopicRelationDeleteV1, event);
            }
            const res = await Table.updateOne(
                {
                    slug: { $in: [relation.table_from, relation.table_to] },
                },
                {
                    $set: {
                        is_changed: true,
                    },
                }
            );
            await View.deleteMany({
                relation_id: relation.id,
            });
            resp = await Relation.deleteOne({ id: data.id });
            let count = await Tab.countDocuments({ relation_id: data.id })
            count && await Tab.deleteMany({ relation_id: data.id })
            return resp;
        } catch (err) {
            throw err;
        }
    }),
    getSingleViewForRelation: catchWrapDb(`${NAMESPACE}.getSingleViewForRelation`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Field = mongoConn.models["Field"];
            const View = mongoConn.models["View"];
            const Relation = mongoConn.models["Relation"];

            let tableQuery = {}
            if (data.table_slug) {
                tableQuery.table_slug = data.table_slug;
            } else if (data.table_id) {
                tableQuery.id = data.table_id;
            }
            let table = await tableVersion(mongoConn, tableQuery, data.version_id, true)
            if (table) {
                data.table_slug = table.slug
                data.table_id = table.id
            }
            const relation = await Relation.findOne(
                {
                    id: data.id
                },
                null,
                {
                    sort: { created_at: -1 },
                }
            ).populate("fields").lean();
            if (!relation) {
                return {};
            }
            let tableFrom = await tableVersion(mongoConn, { slug: relation.table_from }, data.version_id, true)
            if (relation.type === "Many2Dynamic") {
                for (const dynamic_table of relation.dynamic_tables) {
                    if (dynamic_table.table_slug === data.table_slug || tableFrom.slug === data.table_slug) {
                        let tableTo = await tableVersion(mongoConn, { slug: dynamic_table.table_slug }, data.version_id, true)
                        let view = await View.findOne({
                            $and: [
                                { relation_table_slug: data.table_slug },
                                { relation_id: relation.id },
                            ],
                        });
                        viewFieldsInDynamicTable = [];
                        for (const fieldId of dynamic_table.view_fields) {
                            let view_field = await Field.findOne(
                                {
                                    id: fieldId,
                                },
                                {
                                    created_at: 0,
                                    updated_at: 0,
                                    createdAt: 0,
                                    updatedAt: 0,
                                    _id: 0,
                                    __v: 0,
                                }
                            );
                            if (view_field) {
                                if (view_field.attributes) {
                                    view_field.attributes = struct.decode(
                                        view_field.attributes
                                    );
                                }
                                viewFieldsInDynamicTable.push(
                                    view_field._doc
                                );
                            }
                        }
                        let responseRelation = {
                            id: relation.id,
                            table_from: tableFrom,
                            table_to: tableTo,
                            type: relation.type,
                            view_fields: viewFieldsInDynamicTable,
                            editable: relation.editable,
                            dynamic_tables: relation.dynamic_tables,
                            relation_field_slug:
                                relation.relation_field_slug,
                            auto_filters: relation.auto_filters,
                            is_user_id_default:
                                relation.is_user_id_default,
                            cascadings: relation.cascadings,
                            object_id_from_jwt:
                                relation.object_id_from_jwt,
                            cascading_tree_table_slug:
                                relation.cascading_tree_table_slug,
                            cascading_tree_field_slug:
                                relation.cascading_tree_field_slug,
                        };
                        if (view) {
                            responseRelation["title"] = view.name;    
                            responseRelation["columns"] = view.columns;
                            responseRelation["quick_filters"] =
                                view.quick_filters;
                            responseRelation["group_fields"] =
                                view.group_fields;
                            responseRelation["is_editable"] =
                                view.is_editable;
                            responseRelation["relation_table_slug"] =
                                view.relation_table_slug;
                            responseRelation["view_type"] = view.type;
                            responseRelation["summaries"] = view.summaries;
                            responseRelation["relation_id"] =
                                view.relation_id;
                            responseRelation["default_values"] =
                                view.default_values;
                            responseRelation["action_relations"] =
                                view.action_relations;
                            responseRelation["default_limit"] =
                                view.default_limit;
                            responseRelation["multiple_insert"] =
                                view.multiple_insert;
                            responseRelation["multiple_insert_field"] =
                                view.multiple_insert_field;
                            responseRelation["updated_fields"] =
                                view.updated_fields;
                            responseRelation["title_uz"] = view.name_uz;
                            responseRelation["title_en"] = view.name_en;
                        }
                    }
                }
            }
            let tableTo = await tableVersion(mongoConn, { slug: relation.table_to }, data.version_id, true)
            let view = await View.findOne({
                $and: [
                    { relation_table_slug: data.table_slug },
                    { relation_id: relation.id },
                ],
            });
            let responseRelation = {
                id: relation.id,
                table_from: tableFrom,
                table_to: tableTo,
                type: relation.type,
                view_fields: relation.fields,
                editable: relation.editable,
                dynamic_tables: relation.dynamic_tables,
                relation_field_slug: relation.relation_field_slug,
                auto_filters: relation.auto_filters,
                is_user_id_default: relation.is_user_id_default,
                cascadings: relation.cascadings,
                object_id_from_jwt: relation.object_id_from_jwt,
                cascading_tree_table_slug:
                    relation.cascading_tree_table_slug,
                cascading_tree_field_slug:
                    relation.cascading_tree_field_slug,
            };
            if (view) {
                responseRelation["title"] = view.name;
                responseRelation["columns"] = view.columns;
                responseRelation["quick_filters"] = view.quick_filters;
                responseRelation["group_fields"] = view.group_fields;
                responseRelation["is_editable"] = view.is_editable;
                responseRelation["relation_table_slug"] =
                    view.relation_table_slug;
                responseRelation["view_type"] = view.type;
                responseRelation["summaries"] = view.summaries;
                responseRelation["relation_id"] = view.relation_id;
                responseRelation["default_values"] = view.default_values;
                responseRelation["action_relations"] =
                    view.action_relations;
                responseRelation["default_limit"] = view.default_limit;
                responseRelation["multiple_insert"] = view.multiple_insert;
                responseRelation["multiple_insert_field"] =
                    view.multiple_insert_field;
                responseRelation["updated_fields"] = view.updated_fields;
                responseRelation["title_uz"] = view.name_uz;
                responseRelation["title_en"] = view.name_en;
            }
            const relationTabWithPermission = await AddPermission.toRelationTab(responseRelation, data.role_id, data.table_slug, data.project_id)
            return { relation: relationTabWithPermission };
        } catch (err) {
            throw err;
        }
    }),
};

module.exports = relationStore;
