const catchWrapDb = require("../../helper/catchWrapDb");
const converter = require("../../helper/converter");
let tableVersion = require("../../helper/table_version");
const { v4 } = require("uuid");
const { struct } = require("pb-util");
const relationFieldChecker = require("../../helper/relationFieldChecker");
const ObjectBuilder = require("../../models/object_builder");
const mongoPool = require("../../pkg/pool");
const AddPermission = require("../../helper/addPermission");
const os = require('os');

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
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models["Table"]
            const Field = mongoConn.models["Field"]
            const View = mongoConn.models["View"]
            const Relation = mongoConn.models["Relation"]
            const Tab = mongoConn.models['Tab']
            const Section = mongoConn.models['Section']
            const Layout = mongoConn.models['Layout']
            const ViewRelationPermissionTable = (await ObjectBuilder(true, data.project_id))['view_relation_permission']
            let layout_id = "", layout = null, insertManyRelationPermissions = [], field_id = ""

            const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
            const roles = await roleTable?.models.find()

            let table = null
            let field = {}
            let result = {}
            if (!data["id"]) {
                data["id"] = v4()
            }
            
            switch (data.type) {
                case 'Many2Dynamic':
                    
                    data.field_from = data.relation_field_slug
                    data.field_to = "id"
                    table = await Table.findOne({
                        slug: data.table_from,
                        deleted_at: "1970-01-01T18:00:00.000+00:00"
                    });
               
                    field = new Field({
                        id: data.relation_field_id,
                        table_id: table.id,
                        slug: data.relation_field_slug,
                        label: "FROM " + data.table_from + " TO DYNAMIC",
                        type: "DYNAMIC",
                        relation_id: data.id,
                    });
                    let output = await field.save();
                    field_id = output.id

                    layout = await Layout.findOne({table_id: table.id})
                    if (layout) {
                        layout_id = layout.id
                        let tab = await Tab.findOne({layout_id: layout.id, type: 'section'})
                        if (!tab) {
                            tab = await Tab.create({
                                order: 1,
                                label: "Tab",
                                icon: "",
                                type: "section",
                                table_slug: table?.slug,
                                attributes: {},
                                layout_id: layout.id,
                            })
                        }
        
                        const section = await Section.find({tab_id: tab.id}).sort({created_at: -1})
                        if(!section.length) {
                            await Section.create({
                                id: v4(),
                                order: section.length + 1,
                                column: "SINGLE",
                                label: "Info",
                                icon: "",
                                fields: [
                                    {
                                        id: output.id,
                                        order: 1,
                                        field_name: output.label,
                                        relation_type: "Many2Dynamic",
                                        is_visible_layout:  true,
                                        show_label: true
                                    }
                                ],
                                table_id: table.id,
                                attributes: {},
                                tab_id: tab.id
                            })
                        }
        
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
                                                    id: output.id,
                                                    order: count_columns + 1,
                                                    field_name: output.label,
                                                    relation_type: "Many2Dynamic",
                                                    is_visible_layout:  true,
                                                    show_label: true
                                                }
                                            ]
                                        }
                                    }
                                )
                            } else {
                                await Section.create({
                                    id: v4(),
                                    order: section.length + 1,
                                    column: "SINGLE",
                                    label: "Info",
                                    icon: "",
                                    fields: [
                                        {
                                            id: output.id,
                                            order: 1,
                                            field_name: output.label,
                                            relation_type: "Many2Dynamic",
                                            is_visible_layout:  true,
                                            show_label: true
                                        }
                                    ],
                                    table_id: table.id,
                                    attributes: {},
                                    tab_id: tab.id
                                })
                            }
                        }
                    }

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
                    break;
                case "Many2Many":                  
                    data.field_from = data.table_to + "_ids";
                    data.field_to = data.table_from + "_ids";
                    let tableTo = await Table.findOne({
                        slug: data.table_to,
                        deleted_at: "1970-01-01T18:00:00.000+00:00",
                    });
                    table = tableTo
                    
                    let  = await tableVersion(mongoConn, { slug: data.table_to, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                    result = await relationFieldChecker(data.field_to, tableTo.id, data.project_id, "LOOKUPS")
                    if (result.exists) {
                        data.field_to = result.lastField;
                    }
                    field = new Field({
                        id: data.relation_field_id,
                        table_id: tableTo.id,
                        required: false,
                        slug: data.field_to,
                        label:
                            "FROM " + data.table_from + " TO " + data.table_to,
                        type: "LOOKUPS",
                        relation_id: data.id,
                    });
                    let res = await field.save();
                    field_id = res.id
                    
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
                    tableFrom = await Table.findOne({
                        slug: data.table_from,
                        deleted_at: "1970-01-01T18:00:00.000+00:00"
                    });
                    table = tableFrom

                    layout = await Layout.findOne({table_id: table.id})
                    
                    if (layout) {
                        
                        layout_id = layout.id
                        let tab = await Tab.findOne({layout_id: layout.id, type: 'section'})
                        if (!tab) {
                            tab = await Tab.create({
                                order: 1,
                                label: "Tab",
                                icon: "",
                                type: "section",
                                table_slug: table?.slug,
                                attributes: {},
                                layout_id: layout.id,
                            })
                        }
                        
                        const section = await Section.find({tab_id: tab.id}).sort({created_at: -1})
                        if(!section.length) {
                            
                            await Section.create({
                                id: v4(),
                                order: section.length + 1,
                                column: "SINGLE",
                                label: "Info",
                                icon: "",
                                fields: [
                                    {
                                        id: `${data.table_from}#${data.id}`,
                                        order: 1,
                                        field_name: data.label,
                                        relation_type: "Many2Many",
                                        is_visible_layout:  true,
                                        show_label: true
                                    }
                                ],
                                table_id: table.id,
                                attributes: {},
                                tab_id: tab.id
                            })
                        }
                        
                        if(section[0]) {
                            
                            const count_columns = section[0].fields ? section[0].fields.length : 0
                            if(count_columns < (table.section_column_count || 3)) {
                                const a = await Section.findOneAndUpdate(
                                    {
                                        id: section[0].id
                                    }, 
                                    {
                                        $set: {
                                            fields: [
                                                ...(count_columns ? section[0].fields : []),
                                                {
                                                    id: `${data.table_from}#${data.id}`,
                                                    order: count_columns + 1,
                                                    field_name: data.label,
                                                    relation_type: "Many2Many",
                                                    is_visible_layout:  true,
                                                    show_label: true
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        new: true
                                    }
                                )
                                
                            } else {
                                const a = await Section.create({
                                    id: v4(),
                                    order: section.length + 1,
                                    column: "SINGLE",
                                    label: "Info",
                                    icon: "",
                                    fields: [
                                        {
                                            id: `${data.table_from}#${data.id}`,
                                            order: 1,
                                            field_name: data.label,
                                            relation_type: "Many2Many",
                                            is_visible_layout:  true,
                                            show_label: true
                                        }
                                    ],
                                    table_id: table.id,
                                    attributes: {},
                                    tab_id: tab.id
                                })
                                
                            }
                        }
                    }
                 
                    result = await relationFieldChecker(data.field_from, tableFrom.id, data.project_id, "LOOKUPS")
                    if (result.exists) {
                        data.field_from = result.lastField;
                    }
                    field = new Field({
                        id: data.relation_to_field_id,
                        table_id: tableFrom.id,
                        required: false,
                        slug: data.field_from,
                        label:
                            "FROM " + data.table_from + " TO " + data.table_to,
                        type: "LOOKUPS",
                        relation_id: data.id,
                    });
                    res = await field.save();
                    field_id = res.id

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

                    type = converter(field.type);
                    let fieldsTo = [];
                    tableRes.slug = tableFrom.slug;
                    fieldsTo.push({
                        slug: field.slug,
                        type: type,
                    });
                    tableRes.fields = fieldsTo;
                    break;
                case "Recursive":
                    data.recursive_field = data.table_from + "_id";
                    data.field_from = "id";
                    data.field_to = data.table_from + "_id";
                    table = await Table.findOne({
                        slug: data.table_from,
                        deleted_at: "1970-01-01T18:00:00.000+00:00"
                    });
                   
                    result = await relationFieldChecker(data.recursive_field, table.id, data.project_id, "LOOKUP")
                    if (result.exists) {
                        data.recursive_field = result.lastField;
                    }
                    field = new Field({
                        id: data.relation_field_id,
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
                    field_id = responsee.id

                    layout = await Layout.findOne({table_id: table.id})
                    if (layout) {
                        
                        layout_id = layout.id
                        let tab = await Tab.findOne({layout_id: layout.id, type: 'section'})
                        if (!tab) {
                            tab = await Table.create({
                                order: 1,
                                label: "Tab",
                                icon: "",
                                type: "section",
                                table_slug: table?.slug,
                                attributes: {},
                            })
                        }
                        
                        const section = await Section.find({tab_id: tab.id}).sort({created_at: -1})
                        if(!section.length) {
                            
                            await Section.create({
                                id: v4(),
                                order: section.length + 1,
                                column: "SINGLE",
                                label: "Info",
                                icon: "",
                                fields: [
                                    {
                                        id: `${data.table_from}#${data.id}`,
                                        order: 1,
                                        field_name: data.label,
                                        relation_type: "Many2One",
                                        is_visible_layout:  true,
                                        show_label: true
                                    }
                                ],
                                table_id: table.id,
                                attributes: {},
                                tab_id: tab.id
                            })
                        }
        
                        if(section[0]) {
                            
                            const count_columns = section[0].fields ? section[0].fields.length : 0
                            if(count_columns < (table.section_column_count || 3)) {
                                const a = await Section.findOneAndUpdate(
                                    {
                                        id: section[0].id
                                    }, 
                                    {
                                        $set: {
                                            fields: [
                                                ...(count_columns ? section[0].fields : []),
                                                {
                                                    id: `${data.table_from}#${data.id}`,
                                                    order: count_columns + 1,
                                                    field_name: data.label,
                                                    relation_type: "Many2One",
                                                    is_visible_layout:  true,
                                                    show_label: true
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        new: true
                                    }
                                )
                                
                            } else {
                                const a = await Section.create({
                                    id: v4(),
                                    order: section.length + 1,
                                    column: "SINGLE",
                                    label: "Info",
                                    icon: "",
                                    fields: [
                                        {
                                            id: `${data.table_from}#${data.id}`,
                                            order: 1,
                                            field_name: data.label,
                                            relation_type: "Many2One",
                                            is_visible_layout:  true,
                                            show_label: true
                                        }
                                    ],
                                    table_id: table.id,
                                    attributes: {},
                                    tab_id: tab.id
                                })
                                
                            }
                        }
                    }

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

                    let typeRecursive = converter(field.type);
                    let tableRecursive = {};
                    let fields = [];
                    tableRecursive.slug = data.table_from;
                    fields.push({
                        slug: field.slug,
                        type: typeRecursive,
                    });
                    tableRecursive.fields = fields;
                    break;
                case "Many2One":
 
                case "One2One":
                    data.field_from = data.table_to + "_id";
                    data.field_to = "id";
                    table = await Table.findOne({
                        slug: data.table_from,
                        deleted_at: "1970-01-01T18:00:00.000+00:00",
                    });
                    // table = await tableVersion(mongoConn, { slug: data.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                    result = await relationFieldChecker(data.field_from, table.id, data.project_id, "LOOKUP")
                    if (result.exists) {
                        data.field_from = result.lastField;
                    }
                    field = new Field({
                        id: data.relation_field_id,
                        table_id: table.id,
                        slug: data.field_from,
                        label:
                            "FROM " + data.table_from + " TO " + data.table_to,
                        type: "LOOKUP",
                        relation_id: data.id,
                    });
                    let resp = await field.save();
                    field_id = resp.id

                    layout = await Layout.findOne({table_id: table.id})
                    if (layout) {
                        
                        layout_id = layout.id
                        let tab = await Tab.findOne({layout_id: layout.id, type: 'section'})
                        if (!tab) {
                            tab = await Tab.create({
                                order: 1,
                                label: "Tab",
                                icon: "",
                                type: "section",
                                table_slug: table?.slug,
                                layout_id: layout.id,
                                attributes: {},
                            })
                        }
                        
                        const section = await Section.find({tab_id: tab.id}).sort({created_at: -1})
                        if(!section.length) {
                            
                            await Section.create({
                                id: v4(),
                                order: section.length + 1,
                                column: "SINGLE",
                                label: "Info",
                                icon: "",
                                fields: [
                                    {
                                        id: `${data.table_to}#${data.id}`,
                                        order: 1,
                                        field_name: data.label,
                                        relation_type: "Many2One",
                                        is_visible_layout:  true,
                                        show_label: true
                                    }
                                ],
                                table_id: table.id,
                                attributes: {},
                                tab_id: tab.id
                            })
                        }
                        
                        if(section[0]) {
                            
                            const count_columns = section[0].fields ? section[0].fields.length : 0
                            if(count_columns < (table.section_column_count || 3)) {
                                const a = await Section.findOneAndUpdate(
                                    {
                                        id: section[0].id
                                    }, 
                                    {
                                        $set: {
                                            fields: [
                                                ...(count_columns ? section[0].fields : []),
                                                {
                                                    id: `${data.table_to}#${data.id}`,
                                                    order: count_columns + 1,
                                                    field_name: data.label,
                                                    relation_type: "Many2One",
                                                    is_visible_layout:  true,
                                                    show_label: true
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        new: true
                                    }
                                )

                            } else {
                                
                                const a = await Section.create({
                                    id: v4(),
                                    order: section.length + 1,
                                    column: "SINGLE",
                                    label: "Info",
                                    icon: "",
                                    fields: [
                                        {
                                            id: `${data.table_to}#${data.id}`,
                                            order: 1,
                                            field_name: data.label,
                                            relation_type: "Many2One",
                                            is_visible_layout:  true,
                                            show_label: true
                                        }
                                    ],
                                    table_id: table.id,
                                    attributes: {},
                                    tab_id: tab.id
                                })
                                
                            }
                        }
                    }

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

                    let typeMany2One = converter(field.type);
                    let tableMany2One = {};
                    let fieldsMany2One = [];
                    tableMany2One.slug = data.table_from;
                    fieldsMany2One.push({
                        slug: field.slug,
                        type: typeMany2One,
                    });
                    tableMany2One.fields = fieldsMany2One;
                    break;
                default:
            }

            const relation = await Relation.create(data)
            
            let tableSlugs = [data.table_slug];
            if (relation.type === "Many2Dynamic") {
                for (const dynamicTable of relation.dynamic_tables) {
                    data.id = v4();
                    data.type = data.view_type;
                    data["relation_id"] = relation.id;
                    data["name"] = data.title;
                    data["relation_table_slug"] = dynamicTable?.table_slug;
                    if (!data.columns || !data.columns.length) {
                        data.columns = [];
                    }
                    data["attributes"] = data.attributes || {}
                    const view = new View(data);
                    const responseView = await view.save();
                    tableSlugs.push(dynamicTable?.table_slug);
                }
            } else {
                let tableTo = await Table.findOne({slug: data.table_to})
                let tableFrom = await Table.findOne({slug: data.table_from})

                data.id = v4();
                data.relation_table_slug = data.relation_table_slug
                data.type = data.view_type;
                data["relation_id"] = relation.id;
                data["name"] = data.label;
                data["attributes"] = data.attributes || {}
                const view = new View(data);
                await view.save();
                tableSlugs.push(data.table_to);

                const layout = await Layout.findOne({table_id: tableTo.id})

                if(layout) {
                    let tabs = await Tab.find({layout_id: layout.id})
                
                    const c = await Tab.create({
                        id: v4(),
                        order: tabs.length + 1,
                        label: tableFrom?.label || "Relation tab" + data.table_from,
                        icon: "",
                        type: "relation",
                        layout_id: layout.id,
                        relation_id: relation.id,
                    })

                    for (const role of roles) {
                        let relationPermission = await ViewRelationPermissionTable?.models?.findOne({ role_id: role.guid, table_slug: tableTo.slug, relation_id: relation.id })
                        if (!relationPermission) {
                            insertManyRelationPermissions.push({
                                role_id: role.guid,
                                table_slug: tableTo.slug,
                                relation_id: relation.id,
                                view_permission: true,
                                create_permission: true,
                                edit_permission: true,
                                delete_permission: true,
                            })
                        }
                    }

                    insertManyRelationPermissions.length && await ViewRelationPermissionTable?.models?.insertMany(insertManyRelationPermissions)
                }                
            }


            await Table.updateMany(
                { slug: { $in: tableSlugs } },
                {
                    $set: {
                        is_changed: true,
                        is_changed_by_host: {
                            [os.hostname()]: true
                        }
                    },
                }
            );
         
            relation.attributes = data.attributes || {}

            return relation;
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
            const Field = mongoConn.models["Field"]

            const beforeUpdate = await Relation.findOne({id: data.id}).lean()
            if(!beforeUpdate) {
                throw new Error("Relation not found")
            }

            if(!data.relation_table_slug) {
                throw new Error("relation_table_slug required");
            }
            const relation = await Relation.findOneAndUpdate(
                {
                    id: data.id,
                },
                {
                    $set: data,
                },
                {
                    new: true
                }
            ).lean();

            const resp = await Table.findOneAndUpdate(
                {
                    slug: { $in: [data.table_from, data.table_to] },
                },
                {
                    $set: {
                        is_changed: true,
                        [`is_changed_by_host`]: {
                            [os.hostname()]: true
                        }
                    },
                },
                {
                    new: true
                }
            );

            const tableFrom = await Table.findOne({ 
                slug: data.table_from,
            }).lean()

            const tableTo = await Table.findOne({ 
                slug: data.table_to,
            }).lean()

            const viewFields = await Field.find({ 
                id: { $in: relation.view_fields },
            }).lean()
            
            const isViewExists = await View.findOne({
                $and: [
                    {
                        relation_id: data.id,
                    },
                ],
            });
            let viewRelationPermissions = (await ObjectBuilder(true, data.project_id))["view_relation_permission"]
            await viewRelationPermissions.models.updateMany({ relation_id: data.id, table_slug: data.relation_table_slug }, { $set: { label: data.title } })
            if (isViewExists) {
                beforeUpdate.attributes = isViewExists.attributes
                
                await View.findOneAndUpdate(
                    {
                        $and: [
                            // { relation_table_slug: data.relation_table_slug },
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
                            view_fields: data.view_fields,
                            attributes: data.attributes,
                        },
                    }
                );
                
            } else {
                data.type = data.view_type;
                data["name"] = data.title;
                data["name_uz"] = data.title_uz;
                data["name_en"] = data.title_en;
                data["relation_id"] = data.id;
                data["attributes"] = data.attributes
                data.id = v4();
                const view = new View(data);
                await view.save();
            }

            relation.attributes = data.attributes
            relation.table_from = tableFrom
            relation.table_to = tableTo
            relation.view_fields = viewFields


            relation.table_from = tableFrom
            relation.table_to = tableTo
            relation.view_fields = viewFields

            return relation;
        } catch (err) {
            throw err;
        }
    }),
    getAllForViewRelation: catchWrapDb(`${NAMESPACE}.getAllForViewRelation`, async (data) => {
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
                                    // { relation_table_slug: data.table_slug },
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
                                responseRelation["attributes"] = view.attributes;

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
                        // { relation_table_slug: data.table_slug },
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
                    responseRelation["attributes"] = view.attributes;
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
    getByID: catchWrapDb(`${NAMESPACE}.getByID`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Table = mongoConn.models["Table"];
            const View = mongoConn.models["View"];
            const Relation = mongoConn.models["Relation"];

            const relations = await Relation.find(
                {
                    id: data.id
                },
                null,
                {
                    sort: { created_at: -1 },
                }
                ).populate("fields").lean();

            if(!relations.length) {
                throw new Error("Relation not found with given id")
                return
            }

            if (!data.table_slug) {
                data.table_slug = relations[0].table_from;
            }

            let responseRelations = [];
            for (let i = 0; i < relations.length; i++) {
                let tableFrom = await Table.findOne({
                    slug: relations[i].table_from
                })
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
                        relation_buttons: relations[i].relation_buttons,
                    };
                    if (tableTo) {
                        responseRelation["table_to"] = tableTo;
                    }
                    let view = await View.findOne({
                        $and: [
                            // { relation_table_slug: data.table_slug },
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
                        responseRelation["creatable"] = view.creatable;
                        responseRelation["default_editable"] = view.default_editable;
                        responseRelation["function_path"] = view.function_path;
                        responseRelation["attributes"] = view.attributes;
                    }
                    responseRelations.push(responseRelation);
                    continue;
                }
                let tableTo = await Table.findOne({
                    slug: relations[i].table_to
                })
                let view = await View.findOne({
                    $and: [
                        // { relation_table_slug: data.table_slug },
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
                    responseRelation["creatable"] = view.creatable;
                    responseRelation["default_editable"] = view.default_editable;
                    responseRelation["function_path"] = view.function_path;
                    responseRelation["attributes"] = view.attributes;
                }

                responseRelations.push(responseRelation);
            }
            return responseRelations[0] ;
        } catch (err) {
            throw err;
        }
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            // 
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
                        is_system: relations[i].is_system,
                        relation_buttons: relations[i].relation_buttons,
                    };
                    if (tableTo) {
                        responseRelation["table_to"] = tableTo;
                    }
                    let view = await View.findOne({
                        $and: [
                            // { relation_table_slug: data.table_slug },
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
                        responseRelation["creatable"] = view.creatable;
                        responseRelation["default_editable"] = view.default_editable;
                        responseRelation["function_path"] = view.function_path;
                        responseRelation["attributes"] = view.attributes;
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
                        // { relation_table_slug: data.table_slug },
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
                    relation_buttons: relations[i].relation_buttons
                };
                if (view) {
                    // 
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
                    responseRelation["creatable"] = view.creatable;
                    responseRelation["default_editable"] = view.default_editable;
                    responseRelation["function_path"] = view.function_path;
                    responseRelation["attributes"] = view.attributes;
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
            const History = mongoConn.models['object_builder_service.version_history']

            const relation = await Relation.findOne({ id: data.id });
            if(!relation) {
                throw new Error("Relation not found")
            } else if(relation && relation.is_system) {
                throw new Error("This relation is system relation")
            }

            let field = await Field.findOne({relation_id: data.id})
            if(!field) {
                throw new Error("Field not found")
            }

            let table, resp
            let tableResp = {}
            let fields = []

            if (relation.type === 'One2Many') {
                table = await tableVersion(mongoConn, { slug: relation.table_to, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                field.slug = relation.field_from
                fields.push(field)
                tableResp.slug = table.slug
                tableResp.fields = fields
            } else if (relation.type === 'Many2Many') {
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
            } else if (relation.type === "Recursive") {
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
            } else {
                table = await tableVersion(mongoConn, { slug: relation.table_from, deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                resp = await Field.deleteOne({
                    table_id: table.id,
                    slug: relation.field_from,
                    relation_id: relation.id,
                })


                field.slug = relation.field_from
                fields.push(field)
                tableResp.slug = table.slug
                tableResp.fields = fields
            }

            await View.deleteMany({
                relation_id: relation.id,
            });

            const existsColumnView = await View.findOne({table_slug: relation.table_from}).lean()
            let columns = [], is_exists = false
            if(existsColumnView && existsColumnView.columns && existsColumnView.columns.length) {
                for(let id of existsColumnView.columns) {
                    if(id == field.id) {
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

            await Table.updateMany(
                {
                    slug: { $in: [relation.table_from, relation.table_to] },
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

            resp = await Relation.findOneAndDelete({ id: data.id });
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
                tableQuery.slug = data.table_slug;
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
                                // { relation_table_slug: data.table_slug },
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
                            responseRelation["attributes"] = view.attributes;
                        }
                    }
                }
            }
            let tableTo = await tableVersion(mongoConn, { slug: relation.table_to }, data.version_id, true)
            let view = await View.findOne({
                $and: [
                    // { relation_table_slug: data.table_slug },
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
                responseRelation["attributes"] = view.attributes;
            }
            const relationTabWithPermission = await AddPermission.toRelationTab(responseRelation, data.role_id, data.table_slug, data.project_id)
            return { relation: relationTabWithPermission };
        } catch (err) {
            throw err;
        }
    }),
    CopyRelations: catchWrapDb(`${NAMESPACE}.CopyRelations`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Relation = mongoConn.models["Relation"];
            const View = mongoConn.models["View"];

            const relation_ids = data.relations.map(el => el.id)
            const view_ids = data.views.map(el => el.id)

            await Relation.deleteMany({ id: { $in: relation_ids } })
            await View.deleteMany({ id: { $in: view_ids } })

            await Relation.insertMany(data.relations)
            await View.insertMany(data.views)

            return {};
        } catch (err) {
            throw err;
        }
    }),
    getIds: catchWrapDb(`${NAMESPACE}.getIds`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id);
            const Relation = mongoConn.models["Relation"];

            let ids = []

            let query = {
                table_from: data.table_from,
                table_to: data.table_to
            }

            if (data.type) {
                query = {
                    table_from: data.table_from,
                    table_to: data.table_to,
                    type: data.type
                }
            }

            let relations = await Relation.find(query)

            for (let r of relations) {
                ids.push(r.id)
            }

            return {
                ids: ids
            }

        } catch (err) {
            throw err;
        }
    })
};

module.exports = relationStore;
