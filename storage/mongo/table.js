const catchWrapDb = require("../../helper/catchWrapDb");
const ObjectBuilder = require("../../models/object_builder");
const relationStore = require("./relation");
const fieldStore = require("./field");
const { v4 } = require("uuid");
const { struct } = require('pb-util');
const os = require("os")
const layoutStorage = require("./layout")
const { STATIC_TABLE_IDS, FIELD_TYPES } = require("../../helper/constants")
const mongoPool = require('../../pkg/pool');

let NAMESPACE = "storage.table";

let tableStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models["Relation"]

            if (!data.id) {
                data.id = v4()
            }

            let permissionRecord = {}
            data.is_changed_by_host = { [os.hostname()]: true }

            let table = await Table.create(data);
            const recordPermissionTable = (await ObjectBuilder(true, data.project_id))["record_permission"]
            const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
            const roles = await roleTable?.models.find()
            for (const role of roles) {
                permissionRecord = {
                    delete: "Yes",
                    write: "Yes",
                    table_slug: table?.slug,
                    update: "Yes",
                    read: "Yes",
                    is_have_condition: false,
                    role_id: role.guid,
                    guid: v4(),
                    pdf_action: "Yes",
                    add_field: "Yes",
                    language_btn: "Yes",
                    view_create: "Yes",
                    automation: "Yes",
                    settings: "Yes",
                    share_modal: "Yes",
                    delete_all: "Yes",
                    add_filter: "Yes",
                    header: "Yes",
                    field_filter: "Yes",
                    fix_column: "Yes",
                    tab_group: "Yes",
                    columns: "Yes",
                    group: "Yes",
                    excel_menu: "Yes",
                    search_button: "Yes",
                }
                const recordPermission = new recordPermissionTable.models(permissionRecord)
                recordPermission.save()
            }

            const default_layout = {
                project_id: data.project_id,
                id: table.id,
                layouts: [{
                    id: data.layout_id,
                    table_id: table.id,
                    order: 1,
                    label: "Layout",
                    icon: "",
                    is_default: true,
                    type: "PopupLayout",
                    attributes: {},
                    is_visible_section: false,
                    is_modal: true,
                    tabs: [{
                        order: 1,
                        label: "Tab",
                        icon: "",
                        type: "section",
                        table_slug: table.slug,
                        attributes: {},
                        sections: [{
                            order: 1,
                            column: "SINGLE",
                            label: "Info",
                            icon: "",
                            fields: [],
                            table_id: table.id,
                            attributes: {}
                        }]  
                    }]
                }]
            }

            await layoutStorage.createAll(default_layout)
            let attributes = struct.decode(data.attributes)


            if (data.is_login_table && data.is_login_table === true) {
                const loginStrategyMap = {}
                let loginStrategies = attributes?.auth_info?.login_strategy
                let authInfo = {
                    "role_id":          "role_id",
                    "client_type_id":   "client_type_id",
                    "login_strategy":   loginStrategies
                }

                loginStrategies.forEach(strategy => {
                    switch (strategy) {
                        case "phone":
                            if (loginStrategyMap[strategy]){
                                authInfo["phone"] = loginStrategyMap[strategy]
                                break;
                            }

                            let phoneObj = {
                                "attributes":   { "fields": { "label_en": {"stringValue": "Phone", "kind": "stringValue" } } },
                                "table_id":     data.id,
                                "default":      "",
                                "label":        "Phone",
                                "slug":         "phone",
                                "type":         "INTERNATION_PHONE",
                                "required":     false,
                                "show_label":   true,
                                "project_id":   data.project_id
                            }

                            try {
                                fieldStore.createForLoginTable(phoneObj)
                            } catch(err) {
                                console.error(`error when create phone ${err}`)
                            }
                            authInfo["phone"] = "phone"
                            break;
                        case "login":
                            if (loginStrategyMap[strategy]){
                                authInfo["login"] = loginStrategyMap[strategy]
                                authInfo["password"] = "password"
                                break;
                            }

                            let loginObj = {
                                "attributes":   { "fields": { "label_en": { "stringValue": "Login", "kind": "stringValue" } } },
                                "table_id":     data.id,
                                "default":      "",
                                "label":        "Login",
                                "slug":         "login",
                                "type":         "SINGLE_LINE",
                                "required":     false,
                                "show_label":   true,
                                "project_id":   data.project_id
                            }

                            let passwordObj = {
                                "attributes":   { "fields": { "label_en": { "stringValue": "Password", "kind": "stringValue" } } },
                                "table_id":     data.id,
                                "default":      "",
                                "label":        "Password",
                                "slug":         "password",
                                "type":         "PASSWORD",
                                "required":     false,
                                "show_label":   true,
                                "project_id":   data.project_id
                            }

                            try {
                                fieldStore.createForLoginTable(loginObj)
                                fieldStore.createForLoginTable(passwordObj)
                            } catch(err){
                                console.error(`error when create login and password ${err}`)
                            }

                            authInfo["login"] = "login"
                            authInfo["password"] = "password"
                            break;
                        case "email":
                            if (loginStrategyMap[strategy]){
                                authInfo["email"] = loginStrategyMap[strategy]
                                break;
                            }

                            let emailObj = {
                                "attributes":   { "fields": { "label_en": { "stringValue": "Email", "kind": "stringValue" } } },
                                "table_id":     data.id,
                                "default":      "",
                                "label":        "Email",
                                "slug":         "email",
                                "type":         "EMAIL",
                                "required":     false,
                                "show_label":   true,
                                "project_id":   data.project_id
                            }

                            try {
                                fieldStore.createForLoginTable(emailObj)
                            } catch(err){
                                console.error(`error when create email field ${err}`)
                            }
                            authInfo["email"] = "email"
                            break;
                        default:
                            console.log(`Unknown strategy: ${strategy}`);
                    }
                });

                let label = {
                    id:         v4(),
                    table_id:   data.id,
                    required:   false,
                    slug:       "user_id_auth",
                    label:      "User ID Auth",
                    default:    "",
                    type:       "SINGLE_LINE",
                    index:      "string",
                    attributes: {
                        fields: {
                            label_en: { stringValue: "User Id Auth", kind: "stringValue" },
                            label: { stringValue: "", kind: "stringValue" },
                            defaultValue: { stringValue: "", kind: "stringValue" }
                        }
                    },
                    is_visible:     false,
                    is_system:      true,
                    autofill_field: "",
                    autofill_table: "",
                    created_at:     new Date(),
                    updated_at:     new Date(),
                    __v:            0
                }

                try {
                    await Field.updateOne(
                        { table_id: data.id, slug: "user_id_auth" },
                        { $set: label },
                        { upsert: true }
                    )
                } catch(err) {
                    console.error(`error when create user_id_auth ${err}`)
                }

                const clientTypeObj = {
                    table_from:             data.slug,
                    table_to:               "client_type",
                    type:                   "Many2One",
                    view_fields:            ["04d0889a-b9ba-4f5c-8473-c8447aab350d"],
                    relation_table_slug:    "client_type",
                    label:                  "Client Type",
                    project_id:             data.project_id,
                    attributes: {
                        fields: {
                            label_en: { stringValue: "Client Type", kind: "stringValue" },
                            label_to_en: { stringValue: data.label, kind: "stringValue" },
                            table_editable: { boolValue: false, kind: "boolValue" },
                            enable_multi_language: { boolValue: false, kind: "boolValue" }
                        }
                    }
                };

                const roleObj = {
                    table_from:             data.slug,
                    table_to:               'role',
                    type:                   'Many2One',
                    view_fields:            ['c12adfef-2991-4c6a-9dff-b4ab8810f0df'],
                    relation_table_slug:    'role',
                    label:                  'Role',
                    project_id:             data.project_id,
                    attributes: {
                        fields: {
                            label_en: { stringValue: "Role", kind: "stringValue" },
                            label_to_en: { stringValue: data.label, kind: "stringValue" },
                            table_editable: { boolValue: false, kind: "boolValue" },
                            enable_multi_language: { boolValue: false, kind: "boolValue" },
                        }
                    }                    
                }

                try {
                    const clientTypeRelation = await Relation.findOne({
                        table_from: data.slug,
                        field_from: 'client_type_id',
                        table_to:   'client_type',
                        field_to:   'id'
                    })
    
                    if (!clientTypeRelation) {
                        await relationStore.create(clientTypeObj)
                    }
                } catch(err){
                    console.error(`when create client_type relation ${err}`)
                }

                try {
                    const roleRelation = await Relation.findOne({
                        table_from: data.slug,
                        field_from: 'role_id',
                        table_to:   'role',
                        field_to:   'id'
                    })
    
    
                    if (!roleRelation) {
                        await relationStore.create(roleObj)
                    }

                } catch(err){
                    console.error(`error when create role relation ${err}`)
                }

                let updatedAttributes = {
                    "auth_info": authInfo,
                    "label": data.label,
                    "label_en": data.label
                }

                data.attributes = struct.encode(updatedAttributes)

                table = await Table.findOneAndUpdate({ id: data.id }, { $set: data }, { new: true } )
            }

            
            return {
                id: table.id,
                record_permission: permissionRecord,
                slug: table.slug
            };
        } catch (err) {
            throw err
        }
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {   
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models["Relation"]

            data.is_changed = true
            data.is_changed_by_host = { [os.hostname()]: true }

            const isSystemTable = await Table.findOne( { id: data.id } )

            if (isSystemTable && isSystemTable.is_system) {
                throw new Error("This table is system table")
            }

            let table = await Table.findOneAndUpdate( { id: data.id }, { $set: data }, { new: true } )
            
            const recordPermissionTable = (await ObjectBuilder(true, data.project_id))["record_permission"]
            const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
            const roles = await roleTable?.models.find()

            for (const role of roles) {
                let is_exist_record = await recordPermissionTable.models.findOne({
                    $and: [
                        { table_slug: table?.slug },
                        { role_id: role.guid }
                    ]
                }).lean()
                if (!is_exist_record) {
                    let permissionRecord = {
                        delete: "Yes",
                        write: "Yes",
                        table_slug: table?.slug,
                        update: "Yes",
                        read: "Yes",
                        is_have_condition: false,
                        role_id: role.guid,
                        guid: v4()
                    }
                    const recordPermission = new recordPermissionTable.models(permissionRecord)
                    recordPermission.save()
                }
            }

            let attributes = struct.decode(data.attributes)

            // Get Old Table LoginStrategy
            const oldAttributes = struct.decode(isSystemTable?.attributes)
            const oldAuthInfo = oldAttributes?.auth_info
            const loginStrategyMap = {}

            if (oldAuthInfo){
                for (let strategy of oldAuthInfo?.login_strategy){
                    loginStrategyMap[strategy] = oldAuthInfo[strategy]
                }
            }

            if (data.is_login_table && data.is_login_table === true) {
                let loginStrategies = attributes?.auth_info?.login_strategy
                let authInfo = {
                    "client_type_id": "client_type_id",
                    "login_strategy": loginStrategies,
                    "role_id": "role_id"
                }

                loginStrategies.forEach(strategy => {
                    switch (strategy) {
                        case "phone":
                            if (loginStrategyMap[strategy]){
                                authInfo["phone"] = loginStrategyMap[strategy]
                                break;
                            }

                            let phoneObj = {
                                "attributes": {
                                  "fields": {
                                        "label_en": {
                                            "stringValue": "Phone",
                                            "kind": "stringValue"
                                        }
                                    }
                                },
                                "default": "",
                                "label": "Phone",
                                "required": false,
                                "slug": "phone",
                                "table_id": data.id,
                                "type": "INTERNATION_PHONE",
                                "show_label": true,
                                "project_id": data.project_id
                            }

                            fieldStore.createForLoginTable(phoneObj)
                            authInfo["phone"] = "phone"
                            break;
                        case "login":
                            if (loginStrategyMap[strategy]){
                                authInfo["login"] = loginStrategyMap[strategy]
                                authInfo["password"] = "password"
                                break;
                            }

                            let loginObj = {
                                "attributes": {
                                    "fields": {
                                        "label_en": {
                                            "stringValue": "Login",
                                            "kind": "stringValue"
                                        }
                                    }
                                },
                                "default": "",
                                "label": "Login",
                                "required": false,
                                "slug": "login",
                                "table_id": data.id,
                                "type": "SINGLE_LINE",
                                "show_label": true,
                                "project_id": data.project_id
                            }

                            let passwordObj = {
                                "attributes": {
                                    "fields": {
                                        "label_en": {
                                            "stringValue": "Password",
                                            "kind": "stringValue"
                                        }
                                    }
                                },
                                "default": "",
                                "label": "Password",
                                "required": false,
                                "slug": "password",
                                "table_id": data.id,
                                "type": "PASSWORD",
                                "show_label": true,
                                "project_id": data.project_id
                            }

                            fieldStore.createForLoginTable(loginObj)
                            fieldStore.createForLoginTable(passwordObj)

                            authInfo["login"] = "login"
                            authInfo["password"] = "password"
                            break;
                        case "email":
                            if (loginStrategyMap[strategy]){
                                authInfo["email"] = loginStrategyMap[strategy]
                                break;
                            }

                            let emailObj = {
                                "attributes": {
                                    "fields": {
                                        "label_en": {
                                            "stringValue": "Email",
                                            "kind": "stringValue"
                                        }
                                    }
                                },
                                "default": "",
                                "label": "Email",
                                "required": false,
                                "slug": "email",
                                "table_id": data.id,
                                "type": "EMAIL",
                                "show_label": true,
                                "project_id": data.project_id
                            }

                            fieldStore.createForLoginTable(emailObj)
                            authInfo["email"] = "email"
                            break;
                        default:
                            console.log(`Unknown strategy: ${strategy}`);
                    }
                });

                const label = {
                    id: v4(),
                    table_id: data.id,
                    required: false,
                    slug: "user_id_auth",
                    label: "User ID Auth",
                    default: "",
                    type: "SINGLE_LINE",
                    index: "string",
                    attributes: {
                        fields: {
                            label_en: { stringValue: "User Id Auth", kind: "stringValue" },
                            label: { stringValue: "", kind: "stringValue" },
                            defaultValue: { stringValue: "", kind: "stringValue" }
                        }
                    },
                    is_visible: false,
                    is_system: true,
                    autofill_field: "",
                    autofill_table: "",
                    created_at: new Date(),
                    updated_at: new Date(),
                    __v: 0
                }

                await Field.updateOne(
                    { table_id: data.id, slug: "user_id_auth" },
                    { $set: label },
                    { upsert: true }
                )

                const clientTypeObj = {
                    table_from: data.slug,
                    table_to: "client_type",
                    type: "Many2One",
                    view_fields: ["04d0889a-b9ba-4f5c-8473-c8447aab350d"],
                    relation_table_slug: "client_type",
                    label: "Client Type",
                    project_id: data.project_id,
                    attributes: {
                        fields: {
                            label_en: { stringValue: "Client Type", kind: "stringValue" },
                            label_to_en: { stringValue: data.label, kind: "stringValue" },
                            table_editable: { boolValue: false, kind: "boolValue" },
                            enable_multi_language: { boolValue: false, kind: "boolValue" }
                        }
                    }
                };

                const roleObj = {
                    table_from: data.slug,
                    table_to: 'role',
                    type: 'Many2One',
                    view_fields: ['c12adfef-2991-4c6a-9dff-b4ab8810f0df'],
                    relation_table_slug: 'role',
                    label: 'Role',
                    project_id: data.project_id,
                    attributes: {
                        fields: {
                            label_en: { stringValue: "Role", kind: "stringValue" },
                            label_to_en: { stringValue: data.label, kind: "stringValue" },
                            table_editable: { boolValue: false, kind: "boolValue" },
                            enable_multi_language: { boolValue: false, kind: "boolValue" },
                        }
                    }                    
                }

                const clientTypeRelation = await Relation.findOne({
                    table_from: data.slug,
                    field_from: 'client_type_id',
                    table_to: 'client_type',
                    field_to: 'id'
                })

                if (!clientTypeRelation) {
                    await relationStore.create(clientTypeObj)
                }

                const roleRelation = await Relation.findOne({
                    table_from: data.slug,
                    field_from: 'role_id',
                    table_to: 'role',
                    field_to: 'id'
                })


                if (!roleRelation) {
                    await relationStore.create(roleObj)
                }

                let updatedAttributes = {
                    "auth_info": authInfo,
                    "label": data.label,
                    "label_en": data.label
                }

                data.attributes = struct.encode(updatedAttributes)

                table = await Table.findOneAndUpdate(
                    { id: data.id }, { $set: data }, { new: true },
                )
            }
            return table;
        } catch (err) {
            throw err
        }
    }),
    get: catchWrapDb(`${NAMESPACE}.find`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']

            const table = await Table.findOne({
                id: req.id,
                deleted_at: "1970-01-01T18:00:00.000+00:00",
            });

            return table;
        } catch (err) {
            throw err
        }
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableVersion = mongoConn.models['Table.version']
            const TablePermissions = (await ObjectBuilder(true, data.project_id))['record_permission']

            let query = {
                deleted_at: "1970-01-01T18:00:00.000+00:00",
                label: RegExp(data.search, "i"),
                id: { $nin: STATIC_TABLE_IDS }
            }

            if (data.folder_id) {
                query.folder_id = data.folder_id
            }
            if (data.is_login_table) {
                query.is_login_table = data.is_login_table
            }

            let tables = [], tableSlugs = [];
            if (data.role_id) {
                let tablePermissions = await TablePermissions.models.find({ role_id: data.role_id, read: 'Yes' }).populate({ path: 'role_id_data' })
                let isDefaultAdmin = false
                for (const permission of tablePermissions) {
                    if (permission?.role_id_data?.name === 'DEFAULT ADMIN') {
                        isDefaultAdmin = true;
                        break;
                    }
                    tableSlugs.push(permission.table_slug)
                };
                if (!tableSlugs.length && !isDefaultAdmin) {
                    return { tables: [], count: 0 }
                } else {
                    if (!isDefaultAdmin) {
                        query["slug"] = { $in: tableSlugs }
                    }
                }
            }

            tables = await Table.find(
                query,
                null,
                {
                    sort: { created_at: -1 }
                }
            )
                .skip(data.offset)
                .limit(data.limit)


            const count = await Table.countDocuments(query);
            return { tables, count };
        } catch (err) {
            throw err
        }

    }),
    getByID: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableVersion = mongoConn.models['Table.version']
            const TableHistory = mongoConn.models['Table.history']

            let params = {$or: [{ id: data.id }, {slug: data.id}]}
            let table = null
            if (data.version_id) {
                params.version_id = data.version_id
                table = await TableVersion.findOne(params).lean()

            } else {
                table = await Table.findOne(params).lean()

            }

            if (table) {
                table.exists = true
                const history = await TableHistory.findOne({ guid: table.commit_guid }).lean()
                if (history) {
                    history.id = history.guid
                    history.version_ids = []
                    let version_ids = await TableVersion.find({ commit_guid: history.guid })
                    for (let el of version_ids) {
                        history.version_ids.push(el.version_id)
                    }

                    table.commit_info = {
                        id: history.guid,
                        version_ids: version_ids,
                        commit_type: history.commit_type,
                        created_at: history.created_at,
                        name: history.name
                    }
                }
            } else {
                table = {exists: false}
            }

            return table
        } catch (err) {
            throw err
        }
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Layout = mongoConn.models['Layout']
            const Tab = mongoConn.models['Tab']
            const Section = mongoConn.models['Section']
            const Relation = mongoConn.models['Relation']
            const Menu = mongoConn.models['object_builder_service.menu']
            const View = mongoConn.models["View"]
            
            const table = await Table.findOne( { id: data.id } )

            if (table.is_system){
                throw new Error("system table can not be deleted")
            }

            if (!table) {
                throw new Error("Table not found")
            }

            const collection = (await ObjectBuilder(true, data.project_id))[table.slug]
           
            await Table.findOneAndDelete( { id: data.id } );

            const layouts = await Layout.find({table_id: data.id})
            const layout_ids = layouts.map(el => el.id)

            const tabs = await Tab.find({layout_id: {$in: layout_ids}})
            const tab_ids = tabs.map(el => el.id)

            await Section.deleteMany({ tab_id: { $in: tab_ids } })
            await Tab.deleteMany({ id: { $in: tab_ids } })
            await Layout.findOneAndDelete({ id: {$in: layout_ids} })

            const getRelations = await Relation.find({
                $or: [
                    { table_from: table.slug },
                    { table_to: table.slug }
                ]
            });

            let relation_ids = []
            const params = {}
            params["table_id"] = data.id
            if (getRelations.length) {
                for (const relation of getRelations) {
                    relation_ids.push(relation.id)
                }
                params["relation_id"] = { $in: relation_ids }
            }

            await Field.deleteMany( { table_id: params["table_id"] } );

            if (relation_ids.length) {
                await Field.deleteMany( { relation_id: params["relation_id"] } );
            }

            await Relation.deleteMany({
                $or: [
                    { table_from: table.slug },
                    { table_to: table.slug }
                ]
            });

            const fieldPermissionTable = (await ObjectBuilder(true, data.project_id))["field_permission"]
            await fieldPermissionTable?.models.deleteMany( { table_slug: table.slug } )
            const tablePermission = (await ObjectBuilder(true, data.project_id))["record_permission"]
            await tablePermission?.models?.deleteMany({ table_slug: table.slug })
            await View.deleteMany( { table_slug: table.slug } )


            await collection.models.collection.drop()
            await Menu.deleteMany( { table_id: table.id } )
           
            return table;
        } catch (err) {
            throw err
        }

    }),
    GetListTableHistory: catchWrapDb(`${NAMESPACE}.GetListTableHistory`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table.history']
            const TableVersion = mongoConn.models['Table.version']

            const histories = await TableHistory.find({ id: data.table_id }).sort({ created_at: -1 })
            const versions = await TableVersion.aggregate([
                {
                    $match: {
                        id: data.table_id
                    }
                },
                {
                    $group: {
                        _id: "$commit_guid",
                        itemSold: {
                            $push: {
                                version_id: "$version_id",
                            }
                        }
                    },
                }
            ])

            let map_versions = {}
            for (let el of versions) {
                map_versions[el._id] = el.itemSold.map(el => el.version_id)
            }
            let result = []
            for (let el of histories) {

                result.push({
                    name: el.name,
                    version_ids: map_versions[el.guid],
                    id: el.guid,
                    created_at: el.created_at,
                    commit_type: el.commit_type
                })
            }

            return { items: result };
        } catch (err) {
            throw err
        }

    }),
    GetTableHistoryById: catchWrapDb(`${NAMESPACE}.GetTableHistoryById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table.history']
            const TableVersion = mongoConn.models['Table.version']

            const table = await TableHistory.findOne({ guid: data.id }).lean()
            if (!table) {
                throw new Error("Table not found with given parameters")
            }
            const version_ids = await TableVersion.find({ commit_guid: table.guid }, { version_id: 1 })
            table.version_ids = []
            table.id = table.guid
            for (let el of version_ids) {
                table.version_ids.push(el.version_id)
            }
            return table
        } catch (err) {
            let ids = []
            throw err
        }

    }),
    RevertTableHistory: catchWrapDb(`${NAMESPACE}.RevertTableHistory`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table.history']

            let table = await TableHistory.findOne({ guid: data.id }).lean()
            if (!table) {
                throw new Error("Table not found with given parameters")
            }

            delete table._id,
                delete table.guid
            table.version_ids = []
            table.commit_type = data.commit_type
            table.name = data.name
            table.action_time = new Date()
            table.created_at = new Date()
            let reverted = await TableHistory.create(table)

            const deleted = await Table.findOneAndDelete({
                id: reverted.id,
            })
            if (!deleted) {
                await TableHistory.findOneAndDelete({ guid: reverted.guid })
                throw new Error("Table not deleted with given parameters")
            }

            let payload = Object.assign({}, reverted._doc)

            delete payload._id
            delete payload.guid
            payload.commit_guid = reverted.guid
            payload.version_ids = []

            const new_table = await Table.create(payload)

            let resp = Object.assign({}, reverted._doc)
            resp.id = resp.guid
            resp.created_at = resp.created_at

            return resp
        } catch (err) {
            throw err
        }

    }),
    InsertVersionsToCommit: catchWrapDb(`${NAMESPACE}.InsertVersionsToCommit`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table.history']
            const TableVersion = mongoConn.models['Table.version']

            const history = await TableHistory.findOne({ guid: data.id }).lean()

            const deleted = await TableVersion.deleteMany({ version_id: { $in: data.version_ids } })

            let payload = []
            for (let el of data.version_ids) {
                payload.push({
                    id: history.id,
                    label: history.label,
                    slug: history.slug,
                    description: history.description,
                    show_in_menu: history.show_in_menu,
                    is_changed: history.is_changed,
                    icon: history.icon,
                    subtitle_field_slug: history.subtitle_field_slug,
                    version_id: el,
                    commit_guid: history.guid
                })
            }

            await TableVersion.insertMany(payload)
            history.id = history.guid
            history.version_ids = data.version_ids
            return history
        } catch (err) {
            throw err
        }
    }),
    CreateAll: catchWrapDb(`${NAMESPACE}.CreateAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const TableModel = mongoConn.models['Table']
            const AllTables = (await ObjectBuilder(true, data.project_id))
            const RecordPermissionModel = AllTables["record_permission"]
            const RoleModel = AllTables["role"]

            const roles = await RoleModel?.models.find().lean()

            let record_permissions = [];
            for (const table of data.tables) {
                for (const role of roles) {
                    record_permissions.push({
                        delete: "Yes",
                        write: "Yes",
                        table_slug: table?.slug,
                        update: "Yes",
                        read: "Yes",
                        is_have_condition: false,
                        role_id: role.guid,
                        guid: v4()
                    })
                }
            }

            await TableModel.deleteMany({id: {$in: data.table_ids}})
            await RecordPermissionModel.models.deleteMany({table_slug: {$in: data.table_slugs}})

            await TableModel.insertMany(data.tables)
            await RecordPermissionModel.models.insertMany(record_permissions)

            return data.tables;
        } catch (err) {
            throw err
        }

    }),
    getTablesByLabel: catchWrapDb(`${NAMESPACE}.getTablesByLabel`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']

            const tables = await Table.find({label: data.label})

            return {
                tables
            };
        } catch (err) {
            throw err
        }
    }),
    getFieldsByTable: catchWrapDb(`${NAMESPACE}.getFieldsByTable`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id)

            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']

            const table = await Table.findOne({label: data.table_label})

            const fields = await Field.find({table_id: table.id})

            return {
                fields: fields,
                table: table
            }
        } catch (err) {
            throw err
        }
    }),
    getChart: catchWrapDb(`${NAMESPACE}.getChart`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
    
            const Table = mongoConn.models['Table'];
            const Field = mongoConn.models['Field'];
            const Relation = mongoConn.models['Relation'];
    
            const tables = {};
            const tableIds = [];
            const tableSlugs = [];
            const tablesCursor = await Table.find({
                $or: [
                    { is_system: null },
                    { slug: { $in: ['role', 'client_type'] } }
                ]
            });
    
            for (const table of tablesCursor) {
                tables[table.id] = {
                    id: table.id,
                    label: table.label,
                    slug: table.slug.replace(/-/g, '_') 
                };
                tableIds.push(table.id);
                tableSlugs.push(table.slug);
            }
    
            const fields = {};
            const fieldSlugSet = new Set();
            const fieldsCursor = await Field.find({
                table_id: { $in: tableIds }
            });
    
            for (const field of fieldsCursor) {
                const key = `${field.table_id}_${field.slug}`;
                if (fieldSlugSet.has(key)) continue;
                fieldSlugSet.add(key);
    
                if (!fields[field.table_id]) {
                    fields[field.table_id] = [];
                }
    
                fields[field.table_id].push({
                    slug: field.slug.replace(/-/g, '_'),
                    type: FIELD_TYPES[field.type],
                });
            }
    
            const relations = [];
            const relationsCursor = await Relation.find({
                is_system: null,
                table_to: { $in: tableSlugs },
                table_from: { $in: tableSlugs }
            });
    
            for (const rel of relationsCursor) {
                relations.push({
                    tableFrom: rel.table_from.replace(/-/g, '_'),  
                    tableTo: rel.table_to.replace(/-/g, '_'),   
                    fieldFrom: rel.field_from.replace(/-/g, '_'), 
                    fieldTo: rel.field_to.replace(/-/g, '_'),
                    type: rel.type,
                });
            }
    
            let dbml = '';
    
            for (const tableId in tables) {
                const table = tables[tableId];
                dbml += `Table ${table.slug} {\n`;
    
                if (fields[tableId]) {
                    for (const field of fields[tableId]) {
                        dbml += `  ${field.slug} ${field.type}\n`;
                    }
                }
    
                dbml += '}\n\n';
            }
    
            for (const rel of relations) {
                if (rel.type === 'Recursive') {
                    dbml += `Ref: ${rel.tableFrom}.${rel.fieldTo} > ${rel.tableTo}.guid\n`;
                } else {
                    dbml += `Ref: ${rel.tableFrom}.${rel.fieldFrom} > ${rel.tableTo}.guid\n`;
                }
            }
    
            return {
                dbml: dbml
            };
        } catch(err) {
            throw err;
        }
    })
    
};

module.exports = tableStore;
