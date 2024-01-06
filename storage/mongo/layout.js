const catchWrapDb = require('../../helper/catchWrapDb');
const tableVersion = require('../../helper/table_version')
const sectionStorage = require('./section')
const relationStorage = require('./relation')
const mongoPool = require('../../pkg/pool');
const { v4 } = require("uuid");
const AddPermission = require('../../helper/addPermission');
const { struct } = require('pb-util');
const ObjectBuilder = require('../../models/object_builder');
const { VERSION_SOURCE_TYPES_MAP, ACTION_TYPE_MAP } = require("../../helper/constants")


let NAMESPACE = 'storage.layout'


let layoutStore = {
    createAll: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Tab = mongoConn.models['Tab']
            const Table = mongoConn.models['Table']
            const Section = mongoConn.models['Section']
            const Layout = mongoConn.models['Layout']
            const History = mongoConn.models['object_builder_service.version_history']
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

            // layouts.length && await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.LAYOUT, action_type: ACTION_TYPE_MAP.BULKWRITE, current: layouts })
            // tabs.length && await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.TAB, action_type: ACTION_TYPE_MAP.BULKWRITE, current: tabs })
            // sections.length && await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.SECTION, action_type: ACTION_TYPE_MAP.BULKWRITE, current: sections })
            return;
        } catch (err) {
            throw err
        }
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            console.log("\n\n\n ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ LLLLLLLLLLLLLLL")
            const mongoConn = await mongoPool.get(data.project_id)
            const Tab = mongoConn.models['Tab']
            const Table = mongoConn.models['Table']
            const Section = mongoConn.models['Section']
            const Layout = mongoConn.models['Layout']
            const RoleTable = (await ObjectBuilder(true, data.project_id))['role']
            const viewRelationPermissionTable = (await ObjectBuilder(true, data.project_id))['view_relation_permission']
            const roles = await RoleTable?.models?.find({}).lean()
            const History = mongoConn.models['object_builder_service.version_history']
            let bulkWriteTab = [], bulkWriteSection = [], relation_ids = [], insertManyRelationPermissions = []

            let layout = await Layout.findOne({id: data.id}).lean();
            if(!layout) {
                layout = {}
                layout.id = v4()
                data.id = layout.id
            }


            const table = await Table.findOne({
                id: data.table_id,
            }).lean()
       
            let layouts = [], sections = [], tabs = [], relationIds = [];
            for (const tab of data.tabs) {
                if (tab.type === 'relation') {
                    relationIds.push(tab.relation_id)
                }
            }

            const resp = await Layout.findOneAndUpdate({id: layout.id}, {
                $set: {
                    label: data.label,
                    order: data.order,
                    type: data.type,
                    icon: data.icon,
                    is_default: data.is_default,
                    is_modal: data.is_modal,
                    is_visible_section: data.is_visible_section,
                    summary_fields: data.summary_fields,
                    attributes: data.attributes,
                    table_id: data.table_id,
                    attributes: data.attributes,
                    menu_id: data.menu_id
                }
            }, {
                upsert: true
            })

            if(data.is_default) {
                await Layout.updateMany({
                    table_id: data.table_id,
                    id: { $ne: layout.id }
                }, {
                    is_default: false
                })
            }

            const map_tabs = {}, deleted_tab_ids = [], tab_ids = [], map_sections = {}, deleted_section_ids = []
            const all_tabs = await Tab.find({layout_id: layout.id})
            all_tabs.forEach(el => {
                map_tabs[el.id] = 1
                tab_ids.push(el.id)
            })

            const all_sections = await Section.find({tab_id: {$in: tab_ids}})
            all_sections.forEach(el => {
                map_sections[el.id] = 1
            })

            for(let i=0; i<data.tabs.length; i++) {
                let tab = data.tabs[i]

                tab.id = tab.id || v4()

                if(tab.type === "relation") {
                    relation_ids.push(tab.relation_id)
                }

                if (map_tabs[tab.id]) {
                    map_tabs[tab.id] = 2
                }

                bulkWriteTab.push({
                    updateOne: {
                        filter: {
                            id: tab.id
                        },
                        update: {
                            label: tab.label,
                            layout_id: tab.layout_id || data.id,
                            relation_id: tab.relation_id,
                            type: tab.type,
                            order: i,
                            icon: tab.icon,
                            attributes: tab.attributes
                        },
                        upsert: true
                    }
                })

                tabs.push({
                    id: tab.id,
                    label: tab.label,
                    layout_id: tab.layout_id || data.id,
                    relation_id: tab.relation_id,
                    type: tab.type,
                    order: data.order,
                    icon: tab.icon,
                    attributes: tab.attributes
                })

                for(let section of tab.sections) {

                    section.id = section.id || v4()

                    if (map_sections[section.id]) {
                        map_sections[section.id] = 2
                    }

                    bulkWriteSection.push({
                        updateOne: {
                            filter: {
                                id: section.id
                            }, 
                            update: {
                                tab_id: tab.id,
                                order: section.order,
                                column: section.column,
                                label: section.label,
                                fields: section.fields,
                                icon: section.icon,
                                is_summary_section: section.is_summary_section,
                                attributes: section.attributes
                            },
                            upsert: true
                        }
                    })

                    sections.push({
                        id: section.id,
                        tab_id: tab.id,
                        order: section.order,
                        column: section.column,
                        label: section.label,
                        fields: section.fields,
                        icon: section.icon,
                        is_summary_section: section.is_summary_section,
                        attributes: section.attributes
                    })
                }
            }

            for(let key in map_tabs) {
                if(map_tabs[key] == 1) {
                    deleted_tab_ids.push(key)
                }
            }

            for(let key in map_sections) {
                if(map_sections[key] == 1) {
                    deleted_section_ids.push(key)
                }
            }



            for (const role of roles) {
                for (const relation_id of relation_ids) {
                    let relationPermission = await viewRelationPermissionTable?.models?.findOne({ role_id: role.guid, table_slug: table.slug, relation_id: relation_id })
                    if (!relationPermission) {
                        insertManyRelationPermissions.push({
                            role_id: role.guid,
                            table_slug: table.slug,
                            relation_id: relation_id,
                            view_permission: true,
                            create_permission: true,
                            edit_permission: true,
                            delete_permission: true,
                        })
                    }
                }
            }

            deleted_tab_ids.length && await Tab.deleteMany({id: {$in: deleted_tab_ids}})
            deleted_section_ids.length && await Section.deleteMany({id: {$in: deleted_section_ids}})
            bulkWriteTab.length && await Tab.bulkWrite(bulkWriteTab)
            bulkWriteSection.length && await Section.bulkWrite(bulkWriteSection)

            insertManyRelationPermissions.length && await viewRelationPermissionTable?.models?.insertMany(insertManyRelationPermissions)

            await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.LAYOUT, action_type: ACTION_TYPE_MAP.UPDATE, current: struct.encode(JSON.parse(JSON.stringify(resp))), previus: struct.encode(JSON.parse(JSON.stringify(layout))), is_used: { [data.env_id]: true } })
            await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.TAB, action_type: ACTION_TYPE_MAP.BULKWRITE, current: struct.encode(JSON.parse(JSON.stringify(tabs))), previus: struct.encode(JSON.parse(JSON.stringify(all_tabs))), is_used: { [data.env_id]: true } })
            await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.SECTION, action_type: ACTION_TYPE_MAP.BULKWRITE, current: struct.encode(JSON.parse(JSON.stringify(sections))), previus: struct.encode(JSON.parse(JSON.stringify(all_sections))), is_used: { [data.env_id]: true } })

            return {}
        } catch (err) {
            throw err
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
            console.log("~~~~> test #1")
            if (!data.table_id) {
                table = await tableVersion(mongoConn, { slug: data.table_slug }, data.version_id, true);
                data.table_id = table.id;
            } else {
                table = await tableVersion(mongoConn, { id: data.table_id }, data.version_id, true);
                data.table_slug = table.slug
            }
            console.log("~~~~> test #2")
            let payload = {
                table_id: data.table_id,
            }
            if (data.is_default) {
                payload.is_default = true;
            }
            if(data.menu_id) {
                payload.menu_id = data.menu_id;
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
                            if(!relation) continue
                            let fieldAsAttribute = []
                            let view_of_relation;
                            view_of_relation = await View.findOne({
                                relation_id: relation.id,
                                relation_table_slug: data.table_slug
                            })
                            let viewFieldIds = relation.view_fields
                            if (view_of_relation) {
                                if (view_of_relation.view_fields && view_of_relation.view_fields.length) {
                                    viewFieldIds = view_of_relation.view_fields
                                }
                            }
                            
                            if (relation) {
                                for (const fieldID of viewFieldIds) {
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
                                    if (field) {
                                        if (data.language_setting && field.enable_multilanguage) {
                                            if (field?.slug.endsWith("_" + data.language_setting)) {
                                                fieldAsAttribute.push(field)
                                            } else {
                                                continue
                                            }
                                        } else {
                                            fieldAsAttribute.push(field)
                                        }
                                    }
                                }

                                field.is_editable = view_of_relation?.is_editable
                            }
                            let tableFields = await Field.find({ table_id: data.table_id })
                            let autofillFields = []
                            for (const field of tableFields) {
                                let autoFillTable = field.autofill_table
                                let splitedAutoFillTable = []
                                if (field?.autofill_table?.includes('#')) {
                                    splitedAutoFillTable = field.autofill_table.split('#')
                                    autoFillTable = splitedAutoFillTable[0]
                                }
                                if (field.autofill_field && autoFillTable && autoFillTable === fieldReq.id.split("#")[0]) {
                                    let autofill = {
                                        field_from: field.autofill_field,
                                        field_to: field.slug,
                                        automatic: field.automatic,
                                    }
                                    if (fieldResp.slug === splitedAutoFillTable[1]) {
                                        autofillFields.push(autofill)
                                    }
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
                                        let viewFieldsOfDynamicRelation = dynamicTableToAttribute.view_fields;
                                        const viewOfDynamicRelation = await View.findOne({
                                            relation_id: relation.id,
                                            relation_table_slug: dynamic_table.table_slug
                                        })
                                        if (viewOfDynamicRelation && viewOfDynamicRelation.view_fields && viewOfDynamicRelation.view_fields.length) {
                                            viewFieldsOfDynamicRelation = viewOfDynamicRelation.view_fields
                                        }

                                        dynamicTableToAttribute["table"] = dynamicTableInfo._doc
                                        viewFieldsInDynamicTable = []
                                        for (const fieldId of viewFieldsOfDynamicRelation) {
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
                                                if (data.language_setting && view_field.enable_multilanguage) {
                                                    if (view_field.slug.endsWith("_" + data.language_setting)) {
                                                        viewFieldsInDynamicTable.push(view_field._doc)
                                                    } else {
                                                        continue
                                                    }
                                                } else {
                                                    viewFieldsInDynamicTable.push(view_field._doc)
                                                }

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
                                        cascading_tree_field_slug: relation?.cascading_tree_field_slug,
                                        function_path: view_of_relation?.function_path
                                    }
                                }
                            } else {
                                if (view_of_relation) {
                                    originalAttributes = { ...struct.decode(view_of_relation.attributes || {}) }
                                }
                                originalAttributes = {
                                    ...originalAttributes,
                                    autofill: autofillFields,
                                    view_fields: fieldAsAttribute,
                                    auto_filters: relation?.auto_filters,
                                    is_user_id_default: relation?.is_user_id_default,
                                    object_id_from_jwt: relation?.object_id_from_jwt,
                                    cascadings: relation?.cascadings,
                                    cascading_tree_table_slug: relation?.cascading_tree_table_slug,
                                    cascading_tree_field_slug: relation?.cascading_tree_field_slug,
                                    function_path: view_of_relation?.function_path,
                                }
                            }

                            if (view_of_relation) {

                                if (view_of_relation.default_values && view_of_relation.default_values.length) {
                                    originalAttributes["default_values"] = view_of_relation.default_values
                                }
                                originalAttributes["creatable"] = view_of_relation.creatable
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
                    let { fieldsWithPermissions } = await AddPermission.toField(summaryFields, data.role_id, table.slug, data.project_id)
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
                        table_slug: table.slug,
                        language_setting: data.language_setting || undefined,
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
                    let arrayToSort = map_tab[tab.layout_id]
                    arrayToSort.sort((a, b) => a.order - b.order)
                    map_tab[tab.layout_id] = arrayToSort
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
    }),
    GetSingleLayout: catchWrapDb(`${NAMESPACE}.GetSingleLayout`, async function (data) {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Layout = mongoConn.models['Layout']
            const Tab = mongoConn.models['Tab']
            const Field = mongoConn.models['Field']
            const View = mongoConn.models['View']
            const Relation = mongoConn.models['Relation']
            const Table = mongoConn.models['Table']

            if(!data.menu_id) {
                throw new Error("menu_id is required")
            }

            if(!data.table_id) {
                let table = await Table.findOne({slug: data.table_slug}).lean() || {}
                data.table_id = table.id
            }

            if(!data.table_id) {
                throw new Error("Table not found")
            }
           
            let layout = await Layout.findOne({menu_id: data.menu_id, table_id: data.table_id}).lean();
            if(!layout) {
                layout = await Layout.findOne({table_id: data.table_id, is_default: true}).lean()
                if(!layout) return {}
            }

            let table = await tableVersion(mongoConn, { id: layout.table_id }, data.version_id, true);
            data.table_slug = table.slug
            data.table_id = table.id


            let summaryFields = [];
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
                        if(!relation) continue
                        let fieldAsAttribute = []
                        let view_of_relation;
                        view_of_relation = await View.findOne({
                            relation_id: relation.id,
                            relation_table_slug: data.table_slug
                        })
                        let viewFieldIds = relation.view_fields
                        if (view_of_relation) {
                            if (view_of_relation.view_fields && view_of_relation.view_fields.length) {
                                viewFieldIds = view_of_relation.view_fields
                            }
                        }
                        
                        if (relation) {
                            for (const fieldID of viewFieldIds) {
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
                                if (field) {
                                    if (data.language_setting && field.enable_multilanguage) {
                                        if (field?.slug.endsWith("_" + data.language_setting)) {
                                            fieldAsAttribute.push(field)
                                        } else {
                                            continue
                                        }
                                    } else {
                                        fieldAsAttribute.push(field)
                                    }
                                }
                            }

                            field.is_editable = view_of_relation?.is_editable
                        }
                        let tableFields = await Field.find({ table_id: data.table_id })
                        let autofillFields = []
                        for (const field of tableFields) {
                            let autoFillTable = field.autofill_table
                            let splitedAutoFillTable = []
                            if (field?.autofill_table?.includes('#')) {
                                splitedAutoFillTable = field.autofill_table.split('#')
                                autoFillTable = splitedAutoFillTable[0]
                            }
                            if (field.autofill_field && autoFillTable && autoFillTable === fieldReq.id.split("#")[0]) {
                                let autofill = {
                                    field_from: field.autofill_field,
                                    field_to: field.slug,
                                    automatic: field.automatic,
                                }
                                if (fieldResp.slug === splitedAutoFillTable[1]) {
                                    autofillFields.push(autofill)
                                }
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
                                    let viewFieldsOfDynamicRelation = dynamicTableToAttribute.view_fields;
                                    const viewOfDynamicRelation = await View.findOne({
                                        relation_id: relation.id,
                                        relation_table_slug: dynamic_table.table_slug
                                    })
                                    if (viewOfDynamicRelation && viewOfDynamicRelation.view_fields && viewOfDynamicRelation.view_fields.length) {
                                        viewFieldsOfDynamicRelation = viewOfDynamicRelation.view_fields
                                    }

                                    dynamicTableToAttribute["table"] = dynamicTableInfo._doc
                                    viewFieldsInDynamicTable = []
                                    for (const fieldId of viewFieldsOfDynamicRelation) {
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
                                            if (data.language_setting && view_field.enable_multilanguage) {
                                                if (view_field.slug.endsWith("_" + data.language_setting)) {
                                                    viewFieldsInDynamicTable.push(view_field._doc)
                                                } else {
                                                    continue
                                                }
                                            } else {
                                                viewFieldsInDynamicTable.push(view_field._doc)
                                            }

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
                                    cascading_tree_field_slug: relation?.cascading_tree_field_slug,
                                    function_path: view_of_relation?.function_path
                                }
                            }
                        } else {
                            if (view_of_relation) {
                                originalAttributes = { ...struct.decode(view_of_relation.attributes || {}) }
                            }
                            originalAttributes = {
                                ...originalAttributes,
                                autofill: autofillFields,
                                view_fields: fieldAsAttribute,
                                auto_filters: relation?.auto_filters,
                                is_user_id_default: relation?.is_user_id_default,
                                object_id_from_jwt: relation?.object_id_from_jwt,
                                cascadings: relation?.cascadings,
                                cascading_tree_table_slug: relation?.cascading_tree_table_slug,
                                cascading_tree_field_slug: relation?.cascading_tree_field_slug,
                                function_path: view_of_relation?.function_path,
                            }
                        }

                        if (view_of_relation) {

                            if (view_of_relation.default_values && view_of_relation.default_values.length) {
                                originalAttributes["default_values"] = view_of_relation.default_values
                            }
                            originalAttributes["creatable"] = view_of_relation.creatable
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
                let { fieldsWithPermissions } = await AddPermission.toField(summaryFields, data.role_id, table.slug, data.project_id)
                layout.summary_fields = fieldsWithPermissions
            }

            const tabs = await Tab.find({ layout_id: layout.id }).lean()
            console.log(">>> Layout Data ", data)
            for (let tab of tabs) {
                if (tab.type === "section") {

                    const { sections } = await sectionStorage.getAll({
                        project_id: data.project_id,
                        tab_id: tab.id,
                        role_id: data.role_id,
                        table_slug: table.slug,
                        language_setting: data.language_setting || undefined,
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
            }
            
            tabs.sort((a, b) => a.order - b.order)
            layout.tabs = tabs
            return layout 

        } catch (error) {
            console.error(error)
            throw error
        }
    }),
    RemoveLayout: catchWrapDb(`${NAMESPACE}.GetSingleLayout`, async function (data) {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Layout = mongoConn.models['Layout']
            const Tab = mongoConn.models['Tab']
            const Section = mongoConn.models['Section']
            const History = mongoConn.models['object_builder_service.version_history']

            const layout = await Layout.findOne({ id: data.id })
            if(!layout) throw new Error('Layout not found with givern id')

            const tabs = await Tab.find({layout_id: data.id})
            const tab_ids = tabs.map(el => el.id)

            await Section.deleteMany({ tab_id: { $in: tab_ids } })
            await Tab.deleteMany({ id: { $in: tab_ids } })
            await Layout.findOneAndDelete({ id: data.id })

            await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.LAYOUT, action_type: ACTION_TYPE_MAP.DELETE, previus: struct.encode(JSON.parse(JSON.stringify(layout))), is_used: { [data.env_id]: true } })

            return {}

        } catch (error) {
            console.error(error)
            throw error
        }
    })
}


module.exports = layoutStore;