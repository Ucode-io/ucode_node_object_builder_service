const catchWrapDb = require('../../helper/catchWrapDb');
const tableVersion = require('../../helper/table_version')
const sectionStorage = require('./section')
const relationStorage = require('./relation');
const mongoPool = require('../../pkg/pool');
const AddPermission = require('../../helper/addPermission');
const { struct } = require('pb-util');
const { v4 } = require("uuid");
const ObjectBuilder = require('../../models/object_builder');


let NAMESPACE = 'layout'


let layoutStore = {
    createAll: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Tab = mongoConn.models['Tab']
            const Table = mongoConn.models['Table']
            const Section = mongoConn.models['Section']
            const Layout = mongoConn.models['Layout']

            const resp = await Table.findOneAndUpdate({
                id: data.table_id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                }, {
                new: true
            })

            let layouts = [], sections = [], tabs = [];
            for (const layoutReq of data.layouts) {
                layoutReq.id = v4()
                let layout = new Layout(layoutReq);
                layout.table_id = data.id;
                // console.log("\n.>>> layout ", layout)
                layouts.push(layout);
                for (const tabReq of layoutReq.tabs) {
                    tabReq.id = v4()
                    let tab = new Tab(tabReq);
                    tab.layout_id = layout.id;
                    // console.log("\n>>>>> tab", tab)
                    tabs.push({
                        id: tab.id,
                        order: tab.order,
                        label: tab.label,
                        icon: tab.icon,
                        type: tab.type,
                        layout_id: layout.id,
                        relation_id: tab.relation_id,
                        table_slug: resp?.slug,
                        attributes: tab.attributes,
                    });
                    for (const sectionReq of tabReq.sections) {
                        sectionReq.id = v4()
                        const section = new Section(sectionReq);
                        section.tab_id = tab.id;
                        // console.log("\n>>>>> section", section)
                        sections.push(section);
                    }
                }
            }
            await Layout.insertMany(layouts)
            await Tab.insertMany(tabs)
            await Section.insertMany(sections)

            return;
        } catch (err) {
            throw err
        }
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            // console.log(":::::::::::TEST:::::::::::::::::::1")
            const mongoConn = await mongoPool.get(data.project_id)
            const Tab = mongoConn.models['Tab']
            const Table = mongoConn.models['Table']
            const Section = mongoConn.models['Section']
            const Layout = mongoConn.models['Layout']
            const RoleTable = (await ObjectBuilder(true, data.project_id))['role']
            const viewRelationPermissionTable = (await ObjectBuilder(true, data.project_id))['view_relation_permission']
            const roles = await RoleTable?.models?.find({}).lean()
            let layoutIds = [], tabIds = [], insertManyRelationPermissions = [];
            const resp = await Table.findOneAndUpdate({
                id: data.table_id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                }, {
                new: true
            })

            for (const layout of data.layouts) {
                for (const tab of layout.tabs) {
                    tabIds.push(tab.id)
                }
                layoutIds.push(layout.id)
            }
            // console.log(":::::::::::TEST:::::::::::::::::::2")
            // console.log(tabIds, layoutIds)
            if (tabIds.length) {
                const b = await Section.deleteMany(
                    {
                        tab_id: { $in: tabIds },
                    }
                )
                // console.log(b);
            }
            // console.log(":::::::::::TEST:::::::::::::::::::3",)
            if (layoutIds.length) {
                const a = await Tab.deleteMany(
                    {
                        layout_id: { $in: layoutIds }
                    }
                )
                // console.log(a);
            }
            // console.log(":::::::::::TEST:::::::::::::::::::4")
            const c = await Layout.deleteMany(
                {
                    table_id: data.table_id,
                }
            )
            // console.log(c);
            // console.log(":::::::::::TEST:::::::::::::::::::5")
            let layouts = [], sections = [], tabs = [], relationIds = [];
            for (const layoutReq of data.layouts) {
                layoutReq.id = v4()
                const layout = new Layout(layoutReq);
                layouts.push(layout);
                for (const tabReq of layoutReq.tabs) {
                    tabReq.id = v4()
                    tabReq.table_slug = resp?.slug
                    const tab = new Tab(tabReq);
                    tab.layout_id = layout.id;
                    tabs.push(tab);
                    if (tab.type === 'section') {
                        for (const sectionReq of tabReq.sections) {
                            sectionReq.id = v4()
                            const section = new Section(sectionReq);
                            section.tab_id = tab.id;
                            sections.push(section);
                        }
                    } else if (tab.type === 'relation') {
                        relationIds.push(tab.relation_id)
                    }
                }
            }

            for (const role of roles) {
                for (const relation_id of relationIds) {
                    let relationPermission = await viewRelationPermissionTable?.models?.findOne({ role_id: role.guid, table_slug: resp.slug, relation_id: relation_id })
                    if (!relationPermission) {
                        insertManyRelationPermissions.push({
                            role_id: role.guid,
                            table_slug: resp.slug,
                            relation_id: relation_id,
                            view_permission: true,
                            create_permission: true,
                            edit_permission: true,
                            delete_permission: true,
                        })
                    }
                }
            }
            insertManyRelationPermissions.length && await viewRelationPermissionTable?.models?.insertMany(insertManyRelationPermissions)
            // console.log(":::::::::::TEST:::::::::::::::::::6", tabs)
            await Layout.insertMany(layouts)
            await Tab.insertMany(tabs)
            await Section.insertMany(sections)
            // console.log(":::::::::::TEST:::::::::::::::::::7")
            return;
        } catch (err) {
            throw err
        }

    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async function (data) {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Field = mongoConn.models['Field']
            const Layout = mongoConn.models['Layout']
            const View = mongoConn.models['View']
            const Relation = mongoConn.models['Relation']

            let table = {};
            if (data.table_id === "") {
                table = await tableVersion(mongoConn, { slug: data.table_slug }, data.version_id, true);
                data.table_id = table.id;
            }

            const layouts = await Layout.find(
                {
                    table_id: data.table_id,
                },
                null,
                {
                    sort: { created_at: -1 }
                }
            );
            let sections = [], tabs = [], fields = [];
            layouts.forEach(l => {
                tabs = [...tabs, ...l.tabs];
            })
            tabs.forEach(tab => {
                sections = [...sections, ...tab.sections]
            })
            sections.forEach(section => {
                fields = [...fields, section.fields]
            })
            let relationFields = [], simpleFields = [], simpleFieldIds = [], simpleFieldOrder = {}
            fields.forEach(field => {
                if (field.id.includes('#')) {
                    relationFields.push(field)
                } else {
                    simpleFields.push(field)
                    simpleFieldIds.push(field.id)
                    simpleFieldOrder[field.id] = field.order
                }
            })
            let fieldRes = await Field.find({ id: { $in: simpleFieldIds } })
            fieldRes.forEach(f => {
                f.order = simpleFieldOrder[f.id]
            })
            for (const relField of relationFields) {
                let field = {}
                field.order = relField.order
                field.label = relField.field_name
                field.relation_type = relField.relation_type
                let relationID = relField.id.split("#")[1]
                const fieldResp = await Field.findOne({
                    relation_id: relationID,
                    table_id: data.table_id
                })
                if (fieldResp) {
                    field.slug = fieldResp.slug
                    field.required = fieldResp.required
                }
                const relation = await Relation.findOne({ id: relationID })
                if (relation) {
                    view_of_relation = await View.findOne({
                        relation_id: relation.id,
                        relation_table_slug: data.table_slug
                    })
                }

            }
            for (const section of sections) {
                let fieldsRes = [], fieldsWithPermissions = []
                for (const fieldReq of section.fields) {
                    let guid;
                    let field = {};
                    let encodedAttributes = {};
                    if (fieldReq.id.includes("#")) {
                        field.id = fieldReq.id
                        field.label = fieldReq.field_name
                        field.order = fieldReq.order
                        field.relation_type = fieldReq.relation_type
                        let relationID = fieldReq.id.split("#")[1]
                        const fieldResp = await Field.findOne({
                            relation_id: relationID,
                            table_id: data.table_id
                        })
                        if (fieldResp) {
                            field.slug = fieldResp.slug
                            field.required = fieldResp.required
                        }

                        // const relation = await Relation.findOne({ id: relationID })
                        const piplines = [
                            {
                                '$match': {
                                    'id': '9e68c18a-1ddb-4dfd-af5a-8a44b0fa10b4'
                                }
                            }, {
                                '$lookup': {
                                    'from': 'views',
                                    'let': {
                                        'relationId': relationID,
                                        'tableSlug': data.table_slug
                                    },
                                    'pipeline': [
                                        {
                                            '$match': {
                                                '$expr': {
                                                    '$and': [
                                                        {
                                                            '$eq': [
                                                                '$relation_id', '$$relationId'
                                                            ]
                                                        }, {
                                                            '$eq': [
                                                                '$relation_table_slug', '$$tableSlug'
                                                            ]
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    'as': 'view'
                                }
                            }, {
                                '$unwind': {
                                    'path': '$view',
                                    'preserveNullAndEmptyArrays': true
                                }
                            }, {
                                '$lookup': {
                                    'from': 'fields',
                                    'localField': 'view.view_fields',
                                    'foreignField': 'id',
                                    'as': 'view_fields'
                                }
                            }, {
                                '$addFields': {
                                    'default_values': '$view.default_values'
                                }
                            }, {
                                '$project': {
                                    'view_fields.__v': 0,
                                    'view_fields._id': 0,
                                    'view_fields.created_at': 0,
                                    'view_fields.updated_at': 0,
                                    'created_at': 0,
                                    'updated_at': 0,
                                    'view': 0,
                                    '__v': 0,
                                    '_id': 0
                                }
                            }
                        ]
                        const relation = await Relation.aggregate(piplines)

                        let tableFields = await Field.find({ table_id: data.table_id })
                        let autofillFields = []
                        for (const field of tableFields) {
                            if (field.autofill_field && field.autofill_table && field.autofill_table === fieldReq.id.split("#")[0]) {
                                let autofill = {
                                    field_from: field.autofill_field,
                                    field_to: field.slug,
                                    automatic: field.automatic,
                                }
                                autofillFields.push(autofill)
                            }
                        }
                        let originalAttributes = {}
                        let dynamicTables = [];
                        if (relation?.type === "Many2Dynamic") {
                            if (relation.dynamic_tables.length) {
                                let dynamicTableToAttribute;
                                for (const dynamic_table of relation.dynamic_tables) {
                                    const dynamicTableInfo = await tableVersion(mongoConn, { slug: dynamic_table.table_slug }, data.version_id, true)
                                    dynamicTableToAttribute = dynamic_table
                                    dynamicTableToAttribute["table"] = dynamicTableInfo._doc
                                    viewFieldsInDynamicTable = [], viewFields = []
                                    if (dynamicTableToAttribute.view_fields && dynamicTableToAttribute.view_fields.length) {
                                        viewFields = await Field.find(
                                            {
                                                id: { $in: dynamicTableToAttribute.view_fields }
                                            },
                                            {
                                                created_at: 0,
                                                updated_at: 0,
                                                createdAt: 0,
                                                updatedAt: 0,
                                                _id: 0,
                                                __v: 0
                                            })
                                    }
                                    if (viewFields.length) {
                                        viewFields.forEach(field => {
                                            if (field.attributes) {
                                                field.attributes = struct.decode(field.attributes)
                                            }
                                            viewFieldsInDynamicTable.push(field._doc)
                                        })
                                    }
                                    dynamicTableToAttribute.view_fields = viewFieldsInDynamicTable
                                    dynamicTables.push(dynamicTableToAttribute)
                                }
                                relation.dynamic_tables = dynamicTables
                            }
                        }
                        relation.autofill = autofillFields
                        originalAttributes = JSON.stringify(originalAttributes)
                        originalAttributes = JSON.parse(originalAttributes)

                        encodedAttributes = struct.encode(originalAttributes)
                        field.attributes = encodedAttributes
                        fieldsRes.push(field)
                    }
                }
                // this function add field permission for each field by role iddynamicTableInfo
                fieldsWithPermissions = await AddPermission.toField(fieldsRes, data.role_id, table.slug, data.project_id)
                section.fields = fieldsWithPermissions
                sectionsResponse.push(section)
            }
            return { sections: sectionsResponse };
        } catch (error) {

        }
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async function (data) {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Layout = mongoConn.models['Layout']
            const Tab = mongoConn.models['Tab']
            const Field = mongoConn.models['Field']
            const View = mongoConn.models['View']
            const Relation = mongoConn.models['Relation']

            let table = {};
            if (data.table_id === "") {
                table = await tableVersion(mongoConn, { slug: data.table_slug }, data.version_id, true);
                data.table_id = table.id;
            } else {
                table = await tableVersion(mongoConn, { id: data.table_id }, data.version_id, true);
                data.table_slug = table.slug
            }
            let payload = {
                table_id: data.table_id,
            }
            if (data.is_default) {
                payload.is_default = true;
            }

            const layouts = await Layout.find(
                payload,
                null,
                {
                    sort: { created_at: -1 }
                }
            ).lean();

            const layout_ids = []
            for (let layout of layouts) {
                layout_ids.push(layout.id);
                let summaryFields = [];
                // this login for layout's summary field
                if (layout.summary_fields && layout.summary_fields.length) {
                    for (const fieldReq of layout.summary_fields) {
                        let guid;
                        let field = {};
                        let encodedAttributes = {};
                        if (fieldReq.id.includes("#")) {
                            field.id = fieldReq.id
                            field.label = fieldReq.field_name
                            field.order = fieldReq.order
                            field.relation_type = fieldReq.relation_type
                            let relationID = fieldReq.id.split("#")[1]
                            const fieldResp = await Field.findOne({
                                relation_id: relationID,
                                table_id: data.table_id
                            })
                            if (fieldResp) {
                                field.slug = fieldResp.slug
                                field.required = fieldResp.required
                            }

                            const relation = await Relation.findOne({ id: relationID })
                            let fieldAsAttribute = []
                            let view_of_relation;
                            if (relation) {
                                for (const fieldID of relation.view_fields) {
                                    let field = await Field.findOne({
                                        id: fieldID
                                    },
                                        {
                                            created_at: 0,
                                            updated_at: 0,
                                            createdAt: 0,
                                            updatedAt: 0,
                                            _id: 0,
                                            __v: 0
                                        }).lean();
                                    fieldAsAttribute.push(field)
                                }
                                view_of_relation = await View.findOne({
                                    relation_id: relation.id,
                                    relation_table_slug: data.table_slug
                                })

                            }

                            let tableFields = await Field.find({ table_id: data.table_id })
                            let autofillFields = []
                            for (const field of tableFields) {
                                if (field.autofill_field && field.autofill_table && field.autofill_table === fieldReq.id.split("#")[0]) {
                                    let autofill = {
                                        field_from: field.autofill_field,
                                        field_to: field.slug,
                                        automatic: field.automatic,
                                    }
                                    autofillFields.push(autofill)
                                }
                            }
                            let originalAttributes = {}
                            let dynamicTables = [];
                            if (relation?.type === "Many2Dynamic") {
                                if (relation.dynamic_tables.length) {
                                    let dynamicTableToAttribute;
                                    for (const dynamic_table of relation.dynamic_tables) {
                                        const dynamicTableInfo = await tableVersion(mongoConn, { slug: dynamic_table.table_slug }, data.version_id, true)
                                        dynamicTableToAttribute = dynamic_table
                                        dynamicTableToAttribute["table"] = dynamicTableInfo._doc
                                        viewFieldsInDynamicTable = []
                                        for (const fieldId of dynamicTableToAttribute.view_fields) {
                                            let view_field = await Field.findOne(
                                                {
                                                    id: fieldId
                                                },
                                                {
                                                    created_at: 0,
                                                    updated_at: 0,
                                                    createdAt: 0,
                                                    updatedAt: 0,
                                                    _id: 0,
                                                    __v: 0
                                                }
                                            )
                                            if (view_field) {
                                                if (view_field.attributes) {
                                                    view_field.attributes = struct.decode(view_field.attributes)
                                                }
                                                viewFieldsInDynamicTable.push(view_field._doc)
                                            }
                                        }
                                        dynamicTableToAttribute.view_fields = viewFieldsInDynamicTable
                                        dynamicTables.push(dynamicTableToAttribute)
                                    }
                                    originalAttributes = {
                                        autofill: autofillFields,
                                        view_fields: fieldAsAttribute,
                                        auto_filters: relation?.auto_filters,
                                        relation_field_slug: relation?.relation_field_slug,
                                        dynamic_tables: dynamicTables,
                                        is_user_id_default: relation?.is_user_id_default,
                                        object_id_from_jwt: relation?.object_id_from_jwt,
                                        cascadings: relation?.cascadings,
                                        cascading_tree_table_slug: relation?.cascading_tree_table_slug,
                                        cascading_tree_field_slug: relation?.cascading_tree_field_slug
                                    }
                                }
                            } else {
                                originalAttributes = {
                                    autofill: autofillFields,
                                    view_fields: fieldAsAttribute,
                                    auto_filters: relation?.auto_filters,
                                    is_user_id_default: relation?.is_user_id_default,
                                    object_id_from_jwt: relation?.object_id_from_jwt,
                                    cascadings: relation?.cascadings,
                                    cascading_tree_table_slug: relation?.cascading_tree_table_slug,
                                    cascading_tree_field_slug: relation?.cascading_tree_field_slug
                                }
                            }

                            if (view_of_relation) {
                                if (view_of_relation.default_values && view_of_relation.default_values.length) {
                                    originalAttributes["default_values"] = view_of_relation.default_values
                                }
                            }
                            originalAttributes = JSON.stringify(originalAttributes)
                            originalAttributes = JSON.parse(originalAttributes)

                            encodedAttributes = struct.encode(originalAttributes)
                            field.attributes = encodedAttributes
                            summaryFields.push(field)
                        } else if (fieldReq.id.includes("@")) {
                            field.id = fieldReq.id
                        } else {
                            guid = fieldReq.id
                            field = await Field.findOne({
                                id: guid
                            });
                            if (field) {
                                field.order = fieldReq.order;
                                field.column = fieldReq.column;
                                field.id = fieldReq.id;
                                field.relation_type = fieldReq.relation_type;
                                summaryFields.push(field);
                            }
                        }
                    }
                    let fieldsWithPermissions = await AddPermission.toField(summaryFields, data.role_id, table.slug, data.project_id)
                    layout.summary_fields = fieldsWithPermissions
                }
            }

            const tabs = await Tab.find({ layout_id: { $in: layout_ids } }).lean()

            const map_tab = {}
            for (let tab of tabs) {
                if (tab.type === "section") {

                    const { sections } = await sectionStorage.getAll({
                        project_id: data.project_id,
                        tab_id: tab.id,
                        role_id: data.role_id,
                        table_slug: table.slug
                    })

                    tab.sections = sections
                } else if (tab.type === "relation" && tab.relation_id) {
                    const { relation } = await relationStorage.getSingleViewForRelation(
                        {
                            id: tab.relation_id,
                            project_id: data.project_id,
                            role_id: data.role_id,
                            table_slug: table.slug
                        })
                    // console.log("relations:", relation);
                    tab.relation = relation ? relation : {}
                }

                if (map_tab[tab.layout_id]) {
                    map_tab[tab.layout_id].push(tab)
                } else {
                    map_tab[tab.layout_id] = [tab]
                }
            }

            if (Object.keys(map_tab).length > 0) {
                for (let layout of layouts) {
                    layout.tabs = map_tab[layout.id]
                }
            }

            return { layouts: layouts }

        } catch (error) {
            console.error(error)
            throw error
        }
    })

}

module.exports = layoutStore;