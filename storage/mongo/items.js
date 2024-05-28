const { struct } = require('pb-util');
const logger = require("../../config/logger");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
const { v4 } = require("uuid");
const tableVersion = require('../../helper/table_version')
const AddPermission = require("../../helper/addPermission");
const ObjectBuilder = require("../../models/object_builder");
const FormulaFunction = require("../../helper/calculateFormulaFields");
const mongoPool = require('../../pkg/pool');
const PrepareFunction = require('../../helper/prepareFunctions');
const prepareFunction = require('../../helper/prepareFunctions');
const grpcClient = require("../../services/grpc/client");
const constants = require('../../helper/constants');
const filterRules = require('../../helper/filterRules');


let NAMESPACE = "storage.items";

let objectBuilderV2 = {
    create: catchWrapDbObjectBuilder(`${NAMESPACE}.create`, async (req) => {
        //if you will be change this function, you need to change multipleInsert function
        let allTableInfos = await ObjectBuilder(true, req.project_id)
        const tableInfo = allTableInfos[req.table_slug]
        let ownGuid = "";
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const tableData = await tableVersion(mongoConn, { slug: req.table_slug })

            let { payload, data, appendMany2ManyObjects } = await PrepareFunction.prepareToCreateInObjectBuilder(req, mongoConn)
            await payload.save();
            ownGuid = payload.guid;
            let funcs = []
            for (const appendMany2Many of appendMany2ManyObjects) {
                funcs.push(objectBuilderV2.appendManyToMany(appendMany2Many))
            }
            await Promise.all(funcs)
            if (tableData && tableData.is_login_table && !data.from_auth_service) {
                let tableAttributes = struct.decode(tableData.attributes)
                if (tableAttributes && tableAttributes.auth_info) {
                    let authInfo = tableAttributes.auth_info
                    if (!data[authInfo['client_type_id']]
                        || !data[authInfo['role_id']]
                        || !(data[authInfo['login']] || data[authInfo['email']] || data[authInfo['phone']])
                    ) {
                        throw new Error('This table is auth table. Auth information not fully given')
                    }
                    let loginTable = await allTableInfos['client_type']?.models?.findOne({
                        guid: data[authInfo['client_type_id']],
                        table_slug: tableData.slug
                    })
                    if (loginTable) {
                        let authCheckRequest = {
                            client_type_id: data['client_type_id'],
                            role_id: data['role_id'],
                            login: data[authInfo['login']],
                            email: data[authInfo['email']],
                            phone: data[authInfo['phone']],
                            project_id: data['company_service_project_id'],
                            company_id: data['company_service_company_id'],
                            password: data[authInfo['password']],
                            resource_environment_id: req.project_id,
                            invite: data['invite'],
                            environment_id: data["company_service_environment_id"]
                        }
                        const responseFromAuth = await grpcClient.createUserAuth(authCheckRequest)
                        if (responseFromAuth) {
                            data.guid = responseFromAuth.user_id
                            await tableInfo.models.updateOne({
                                guid: ownGuid
                            }, {
                                $set: { guid: responseFromAuth.user_id }
                            })
                            data.guid = responseFromAuth.user_id
                        }
                    }
                }
            }

            const object = struct.encode({ data });

            let customMessage = ""
            if (tableData) {
                const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                    code: 201,
                    table_id: tableData.id,
                    action_type: "CREATE"

                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }
            return { table_slug: req.table_slug, data: object, custom_message: customMessage };

        } catch (err) {
            await tableInfo.models.deleteOne({ guid: ownGuid })
            throw err
        }
    }),
    update: catchWrapDbObjectBuilder(`${NAMESPACE}.update`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)

            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

            let { data, appendMany2Many, deleteMany2Many } = await PrepareFunction.prepareToUpdateInObjectBuilder(req, mongoConn)
            await tableInfo.models.findOneAndUpdate({ guid: data.id }, { $set: data }, { new: true });
            let funcs = []
            for (const resAppendM2M of appendMany2Many) {
                funcs.push(objectBuilderV2.appendManyToMany(resAppendM2M))
            }
            for (const resDeleteM2M of deleteMany2Many) {
                funcs.push(objectBuilderV2.deleteManyToMany(resDeleteM2M))
            }

            await Promise.all(funcs)
            // await sendMessageToTopic(conkafkaTopic.TopicObjectUpdateV1, event)
            const table = await tableVersion(mongoConn, { slug: req.table_slug })
            let customMessage = ""
            if (table) {
                const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                    code: 200,
                    table_id: table.id,
                    action_type: "UPDATE"
                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }

            return { table_slug: req.table_slug, data: struct.encode(data), custom_message: customMessage };
        } catch (err) {
            throw err
        }
    }),
    getSingle: catchWrapDbObjectBuilder(`${NAMESPACE}.getSingle`, async (req) => {
        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const data = struct.decode(req.data)
        const tables = (await ObjectBuilder(true, req.project_id))
        const tableInfo = tables[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }
        let output = await tableInfo.models.findOne({
            guid: data.id
        },
            {
                created_at: 0,
                updated_at: 0,
                createdAt: 0,
                updatedAt: 0,
                _id: 0,
                __v: 0
        }).lean();

        if (!output) { logger.error(`failed to find object in table ${req.table_slug} with given id: ${data.id}`) };
        let isChanged = false
        let attribute_table_from_slugs = []
        let attribute_table_from_relation_ids = []
        for (const field of tableInfo.fields) {
            let attributes = struct.decode(field.attributes);
            if (field.type === "FORMULA") {
                if (attributes.table_from && attributes.sum_field) {
                    attribute_table_from_slugs.push(
                        attributes.table_from.split("#")[0]
                    );
                    attribute_table_from_relation_ids.push(
                        attributes.table_from.split("#")[1]
                    );
                }
            }
        }
        const relationFieldTables = await tableVersion(
            mongoConn,
            {
                slug: { $in: attribute_table_from_slugs },
                deleted_at: "1970-01-01T18:00:00.000+00:00",
            },
            data.version_id,
            false
        );
        let relationFieldTablesMap = {}
        let relationFieldTableIds = []
        for (const table of relationFieldTables) {
            relationFieldTablesMap[table.slug] = table
            relationFieldTableIds.push(table.id)
        }
        const relationFields = await Field.find({
            relation_id: { $in: attribute_table_from_relation_ids },
            table_id: { $in: relationFieldTableIds },
        });
        let relationFieldsMap = {}
        for (const relationField of relationFields) {
            relationFieldsMap[relationField.relation_id + "_" + relationField.table_id] = relationField
        }
        const dynamicRelations = await Relation.find({ id: { $in: attribute_table_from_relation_ids } })
        let dynamicRelationsMap = {}
        for (const dynamicRelation of dynamicRelations) {
            dynamicRelationsMap[dynamicRelation.id] = dynamicRelation
        }
        for (const field of tableInfo.fields) {
            let attributes = struct.decode(field.attributes)
            if (field.type === "FORMULA") {
                if (attributes.table_from && attributes.sum_field) {
                    let filters = {}
                    if (attributes.formula_filters) {
                        attributes.formula_filters.forEach(el => {
                            filters[el.key.split("#")[0]] = el.value
                            if (Array.isArray(el.value)) {
                                filters[el.key.split("#")[0]] = { $in: el.value }
                            }
                        })
                    }
                    // const relationFieldTable = await table.findOne({
                    //     slug: attributes.table_from.split('#')[0],
                    //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                    // })
                    const relation_id = attributes.table_from.split('#')[1]
                    const relationFieldTable = relationFieldTablesMap[attributes.table_from.split('#')[0]]
                    const relationField = relationFieldsMap[relation_id + "_" + relationFieldTable.id]
                    // const relationFieldTable = await tableVersion(mongoConn, { slug: attributes.table_from.split('#')[0], deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
                    // const relationField = await Field.findOne({
                    //     relation_id: attributes.table_from.split('#')[1],
                    //     table_id: relationFieldTable.id
                    // })
                    if (!relationField || !relationFieldTable) {
                        output[field.slug] = 0
                        continue
                    }
                    const dynamicRelation = dynamicRelationsMap[relation_id]
                    // const dynamicRelation = await Relation.findOne({ id: attributes.table_from.split('#')[1] })
                    let matchField = relationField ? relationField.slug : req.table_slug + "_id"
                    if (dynamicRelation && dynamicRelation.type === "Many2Dynamic") {
                        matchField = dynamicRelation.field_from + `.${req.table_slug}` + "_id"
                    }
                    let matchParams = {
                        [matchField]: { '$eq': data.id },
                        ...filters
                    }
                    const resultFormula = await FormulaFunction.calculateFormulaBackend(attributes, matchField, matchParams, req.project_id, tables)
                    if (resultFormula.length) {
                        if (attributes.number_of_rounds && attributes.number_of_rounds > 0) {
                            if (!isNaN(resultFormula[0].res)) {
                                resultFormula[0].res = resultFormula[0]?.res?.toFixed(attributes.number_of_rounds)
                            }
                        }
                        if (resultFormula[0]?.res && output[field.slug] !== resultFormula[0].res) {
                            output[field.slug] = resultFormula[0].res
                            isChanged = true
                        }
                    } else {
                        output[field.slug] = 0
                        isChanged = true
                    }
                }
            } else if (field.type === "FORMULA_FRONTEND") {
                if (attributes && attributes.fomula) {
                    const resultFormula = await FormulaFunction.calculateFormulaFrontend(attributes, tableInfo.fields, output)
                    if (output[field.slug] !== resultFormula) {
                        isChanged = true
                    }
                    output[field.slug] = resultFormula
                }
            }
        }
        if (isChanged) {
            await objectBuilder.update({
                table_slug: req.table_slug,
                project_id: req.project_id,
                data: struct.encode(output)
            })
        }
        const table = await tableVersion(mongoConn, { slug: req.table_slug })
        let customMessage = ""
        if (table) {
            const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                code: 200,
                table_id: table.id,
                action_type: "GET_SINGLE",
            })
            if (customErrMsg) { customMessage = customErrMsg.message }
        }

        return {
            table_slug: data.table_slug,
            data: struct.encode({
                response: output
            }),
            custom_message: customMessage
        }
    }),
    getList: catchWrapDbObjectBuilder(`${NAMESPACE}.getList`, async (req) => {
        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const View = mongoConn.models['View']
        let params = struct.decode(req?.data)
        const limit = params.limit
        const offset = params.offset
        delete params["offset"]
        delete params["limit"]
        const allTables = (await ObjectBuilder(true, req.project_id))
        const tableInfo = allTables[req.table_slug]
        let role_id_from_token = params["role_id_from_token"]
        if (!tableInfo) {
            throw new Error("table not found")
        }
        let keys = Object.keys(params)
        let order = params.order || {}
        let fields = tableInfo.fields
        let tableRelationFields = {}
        let columnIds = {}
        let relationIdsForPopulate = []
        let selectedRelations = false
        let view = await View.findOne({ id: params.view_id })
        view && view.columns && view.columns.length && view.columns.forEach(id => {
            columnIds[id] = id
            selectedRelations = true
        })
        fields.length && fields.forEach(field => {
            if (field.relation_id) {
                tableRelationFields[field.relation_id] = field
                if (columnIds[field.id] && selectedRelations) {
                    relationIdsForPopulate.push(field.relation_id)
                }
            }
        })

        const currentTable = await tableVersion(mongoConn, { slug: req.table_slug })

        if (currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: 1 }
        } else if (!currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: -1 }
        }
        const permissionTable = allTables["record_permission"]
        const permission = await permissionTable.models.findOne({
            $and: [
                {
                    role_id: params["role_id_from_token"]
                },
                {
                    table_slug: req.table_slug
                }
            ]
        })
        let relations = []
        selectedRelations ? relations = await Relation.find({
            id: { $in: relationIdsForPopulate }
        }) : relations = await Relation.find({
            $or: [{
                table_from: req.table_slug,
            },
            {
                table_to: req.table_slug,
            },
            {
                "dynamic_tables.table_slug": req.table_slug
            }
            ]
        })

        if (permission?.is_have_condition) {
            const automaticFilterTable = allTables["automatic_filter"]
            const automatic_filters = await automaticFilterTable.models.find({
                $and: [
                    {
                        role_id: params["role_id_from_token"]
                    },
                    {
                        table_slug: req.table_slug
                    },
                    {
                        method: "read"
                    }
                ]
            })
            if (automatic_filters.length) {
                for (const autoFilter of automatic_filters) {
                    if (autoFilter.not_use_in_tab && params.from_tab) {
                        continue
                    }
                    let many2manyRelation = false
                    if (autoFilter?.object_field?.includes('#')) {
                        let splitedElement = autoFilter.object_field.split('#')
                        autoFilter.object_field = splitedElement[0]
                        let obj = relations.find(el => el.id === splitedElement[1])
                        if (obj) {
                            if (obj.type === 'Many2One' && obj.table_from === req.table_slug) {
                                autoFilter.custom_field = obj.field_from
                            } else if (obj.type === 'Many2Many') {
                                many2manyRelation = true
                                if (obj.table_from === req.table_slug) {
                                    autoFilter.custom_field = obj.field_from
                                } else if (obj.table_to === req.table_slug) {
                                    autoFilter.custom_field = obj.field_to
                                }
                            }
                        }
                    }
                    if (autoFilter.custom_field === "user_id") {
                        if (autoFilter.object_field !== req.table_slug) {
                            if (!many2manyRelation) {
                                params[autoFilter.object_field + "_id"] = params["user_id_from_token"]
                            } else {
                                params[autoFilter.object_field + "ids"] = { $in: params["user_id_from_token"] }
                            }
                        }
                    } else {
                        let connectionTableSlug = autoFilter.custom_field.slice(0, autoFilter.custom_field.length - 3)
                        let objFromAuth = params?.tables?.find(obj => obj.table_slug === autoFilter.object_field)
                        if (objFromAuth) {
                            if (connectionTableSlug !== req.table_slug) {
                                if (!many2manyRelation) {
                                    params[autoFilter.custom_field] = objFromAuth.object_id
                                } else {
                                    params[autoFilter.custom_field] = { $in: params["user_id_from_token"] }
                                }
                            } else {
                                params["guid"] = objFromAuth.object_id
                            }
                        }
                    }
                }
            }
        } else {
            let objFromAuth = params?.tables?.find(obj => obj.table_slug === req.table_slug)
            if (objFromAuth) {
                params["guid"] = objFromAuth.object_id
            }
        }

        if (params.view_fields && params.search) {
            if (params.view_fields.length && params.search !== "") {

                let empty = ""
                if (typeof params.search === "string") {
                    for (let el of params.search) {
                        if (el == "(") {
                            empty += "\\("
                        } else if (el == ")") {
                            empty += "\\)"
                        } else {
                            empty += el
                        }
                    }
                    params.search = empty
                }
                let arrayOfViewFields = [];
                for (const view_field of params.view_fields) {
                    let field = fields.find(val => (val.slug === view_field))
                    let obj = {};
                    if (!constants.NUMBER_TYPES.includes(field.type) && !constants.BOOLEAN_TYPES.includes(field.type)) {
                        obj[view_field] = { $regex: new RegExp(params.search.toString(), "i") }
                        arrayOfViewFields.push(obj)
                    } else if (constants.NUMBER_TYPES.includes(field.type) && !isNaN(params.search)) {
                        obj[view_field] = params.search
                        arrayOfViewFields.push(obj)
                    }
                }
                if (arrayOfViewFields.length) {
                    params["$or"] = arrayOfViewFields
                }
            }
        }

        let tableParams = {}
        for (const key of keys) {
            if ((key === req.table_slug + "_id" || key === req.table_slug + "_ids") && params[key] !== "" && !params["is_recursive"]) {
                params["guid"] = params[key]
            }
            if (typeof params[key] === "object") {
                //please don't delete this comment
                /*
                    
                    key                     params[key]
                    "sum":                  { "_gte": 1000, "_lte": 3000 }                                             // case #1
                    "name":                 { "_constains": "a" }                                                      // case #2
                    "product_id_data":      {"number_of_count": { "_gte": 1000, "_lte": 3000 }}                        // case #2
                    "product_id_data":      { "name": { "_constains": "a" } }                                          // case #4
                */
                let value = {}
                let objectKeys = Object.keys(params[key])
                let objectValues = Object.values(params[key])
                if (objectKeys.length > 1 && objectValues.length > 1) {
                    // case #1
                    for (let i = 0; i < objectKeys.length; i++) {
                        let el = filterRules(objectKeys[i], objectValues[i])
                        value = Object.assign(value, el)
                    }
                    params[key] = value
                } else if (objectKeys.length === 1 && objectValues.length === 1 && objectKeys[0].slice(0, 1) === "_") {
                    // case #2
                    let value = filterRules(objectKeys[0], objectValues[0])
                    params[key] = value
                } else if (typeof objectValues[0] === "object") {
                    let nestedObjectKeys = Object.keys(objectValues[0])
                    let nestedObjectValues = Object.values(objectValues[0])
                    if (nestedObjectKeys.length > 1 && nestedObjectValues.length > 1) {
                        // case #3
                        for (let i = 0; i < nestedObjectKeys.length; i++) {
                            let el = filterRules(nestedObjectKeys[i], nestedObjectValues[i])
                            value = Object.assign(value, el)
                        }
                        tableParams[key] = { [objectKeys[0]]: value }
                    } else {
                        // case #4
                        value = filterRules(nestedObjectKeys[0], nestedObjectValues[0])
                        tableParams[key] = { [objectKeys[0]]: value }
                    }
                } else {
                    throw new Error("Invalid filter")
                }
            }
        }

        let { unusedFieldsSlugs } = await AddPermission.toField(fields, role_id_from_token, req.table_slug, req.project_id)

        let result = [], count;
        let populateArr = []

        // check soft deleted datas
        if (params.$or) {
            params.$and = [
                { $or: params.$or },
                {
                    $or: [
                        { deleted_at: new Date("1970-01-01T18:00:00.000+00:00") },
                        { deleted_at: null }
                    ]
                }
            ]

            delete params.$or
        } else {
            params.$or = [
                { deleted_at: new Date("1970-01-01T18:00:00.000+00:00") },
                { deleted_at: null }
            ]
        }
        if (limit !== 0) {
            if (relations.length == 0) {
                result = await tableInfo.models.find({
                    $and: [params]
                },
                    {
                        createdAt: 0,
                        updatedAt: 0,
                        created_at: 0,
                        updated_at: 0,
                        _id: 0,
                        __v: 0,
                        ...unusedFieldsSlugs
                    }, { sort: order }
                ).skip(offset)
                    .limit(limit)
                    .lean();
                count = await tableInfo.models.countDocuments(params);
            } else {
                for (const relation of relations) {
                    if (relation.type === "One2Many") {
                        relation.table_to = relation.table_from
                    } else if (relation.type === "Many2Many") {
                        continue
                    }
                    let table_to_slug = ""
                    const field = tableRelationFields[relation.id]
                    if (field) {
                        table_to_slug = field.slug + "_data"
                    }
                    if (table_to_slug === "") {
                        continue
                    }
                    if (tableParams[table_to_slug]) {
                        papulateTable = {
                            path: table_to_slug,
                            match: tableParams[table_to_slug]
                        }
                    } else {
                        if (relation.type === "Many2Dynamic") {
                            for (dynamic_table of relation.dynamic_tables) {
                                if (tableParams[relation.relation_field_slug + "." + dynamic_table.table_slug + "_id_data"]) {
                                    papulateTable = {
                                        path: table_to_slug,
                                        match: tableParams[table_to_slug]
                                    }
                                } else {
                                    papulateTable = {
                                        path: relation.relation_field_slug + "." + dynamic_table.table_slug + "_id_data",
                                    }
                                }
                                populateArr.push(papulateTable)
                            }
                            continue
                        }
                        papulateTable = {
                            path: table_to_slug,
                        }
                    }
                    populateArr.push(papulateTable)
                }
                result = await tableInfo.models.find({
                    ...params
                },
                    {
                        createdAt: 0,
                        updatedAt: 0,
                        created_at: 0,
                        updated_at: 0,
                        _id: 0,
                        __v: 0,
                        ...unusedFieldsSlugs
                    }, { sort: order }
                )
                    .skip(offset)
                    .limit(limit)
                    .populate(populateArr)
                    .lean()
                result = result.filter(obj => Object.keys(tableParams).every(key => obj[key]))
            }
        }
        count = await tableInfo.models.count(params);
        if (result && result.length) {
            let prev = result.length
            count = count - (prev - result.length)
        }

        if (params.additional_request && params.additional_request.additional_values?.length && params.additional_request.additional_field) {
            let additional_results;
            const additional_param = {};
            let result_ids = {}
            result.forEach(el => result_ids[el.guid] = 1)
            let ids = params.additional_request.additional_values.filter(el => result_ids[el] !== 1)
            if (ids.length) {
                additional_param[params.additional_request.additional_field] = { $in: ids }
                if (relations.length == 0) {
                    additional_results = await tableInfo.models.find({
                        ...additional_param
                    },
                        {
                            createdAt: 0,
                            updatedAt: 0,
                            created_at: 0,
                            updated_at: 0,
                            _id: 0,
                            __v: 0,
                            ...unusedFieldsSlugs
                        }, { sort: order }
                    )
                        .lean();
                } else {
                    additional_results = await tableInfo.models.find({
                        ...additional_param
                    },
                        {
                            createdAt: 0,
                            updatedAt: 0,
                            created_at: 0,
                            updated_at: 0,
                            _id: 0,
                            __v: 0,
                            ...unusedFieldsSlugs
                        }, { sort: order }
                    )
                        .populate(populateArr)
                        .lean()
                }
                if (additional_results.length) {
                    result = result.concat(additional_results)
                }
            }
        }
        let updatedObjects = []
        let formulaFields = tableInfo.fields.filter(val => (val.type === "FORMULA" || val.type === "FORMULA_FRONTEND"))

        let attribute_table_from_slugs = []
        let attribute_table_from_relation_ids = []
        for (const field of formulaFields) {
            let attributes = struct.decode(field.attributes);
            if (field.type === "FORMULA") {
                if (attributes.table_from && attributes.sum_field) {
                    attribute_table_from_slugs.push(
                        attributes.table_from.split("#")[0]
                    );
                    const id = attributes.table_from.split("#")[1]
                    if (id) {
                        attribute_table_from_relation_ids.push(id);
                    }
                }
            }
        }
        let relationFieldTablesMap = {}
        let relationFieldTableIds = []
        if (attribute_table_from_slugs.length > 0) {
            const relationFieldTables = await tableVersion(
                mongoConn,
                {
                    slug: { $in: attribute_table_from_slugs },
                    deleted_at: "1970-01-01T18:00:00.000+00:00",
                },
                params.version_id,
                false
            );
            for (const table of relationFieldTables) {
                relationFieldTablesMap[table.slug] = table
                relationFieldTableIds.push(table.id)
            }
        }
        let relationFieldsMap = {}
        if (attribute_table_from_relation_ids.length > 0 && relationFieldTableIds.length > 0) {
            const relationFields = await Field.find({
                relation_id: { $in: attribute_table_from_relation_ids },
                table_id: { $in: relationFieldTableIds },
            });
            for (const relationField of relationFields) {
                relationFieldsMap[relationField.relation_id + "_" + relationField.table_id] = relationField
            }
        }
        let dynamicRelationsMap = {}
        if (attribute_table_from_relation_ids.length > 0) {
            const dynamicRelations = await Relation.find({ id: { $in: attribute_table_from_relation_ids } })
            for (const dynamicRelation of dynamicRelations) {
                dynamicRelationsMap[dynamicRelation.id] = dynamicRelation
            }
        }
        for (const res of result) {
            let isChanged = false
            for (const field of formulaFields) {
                let attributes = struct.decode(field.attributes)
                if (field.type === "FORMULA") {
                    if (attributes.table_from && attributes.sum_field) {
                        let filters = {}
                        if (attributes.formula_filters) {
                            attributes.formula_filters.forEach(el => {
                                filters[el.key.split("#")[0]] = el.value
                                if (Array.isArray(el.value)) {
                                    filters[el.key.split("#")[0]] = { $in: el.value }
                                }
                            })
                        }
                        const relation_id = attributes.table_from.split('#')[1]
                        const relationFieldTable = relationFieldTablesMap[attributes.table_from.split('#')[0]]
                        const relationField = relationFieldsMap[relation_id + "_" + relationFieldTable.id]
                        if (!relationField || !relationFieldTable) {
                            res[field.slug] = 0
                            continue
                        }
                        const dynamicRelation = dynamicRelationsMap[relation_id]
                        let matchField = relationField ? relationField.slug : req.table_slug + "_id"
                        if (dynamicRelation && dynamicRelation.type === "Many2Dynamic") {
                            matchField = dynamicRelation.field_from + `.${req.table_slug}` + "_id"
                        }
                        let matchParams = {
                            [matchField]: { '$eq': res.guid },
                            ...filters
                        }
                        const resultFormula = await FormulaFunction.calculateFormulaBackend(attributes, matchField, matchParams, req.project_id, allTables)
                        if (resultFormula.length) {
                            if (attributes.number_of_rounds && attributes.number_of_rounds > 0) {
                                if (!isNaN(resultFormula[0].res)) {
                                    resultFormula[0].res = resultFormula[0]?.res?.toFixed(attributes.number_of_rounds)
                                }
                            }
                            if (resultFormula[0]?.res && res[field.slug] !== resultFormula[0].res) {
                                res[field.slug] = resultFormula[0].res
                                isChanged = true
                            }

                        } else {
                            res[field.slug] = 0
                            isChanged = true
                        }
                    }
                } else {
                    if (attributes && attributes.formula) {
                        const resultFormula = await FormulaFunction.calculateFormulaFrontend(attributes, tableInfo.fields, res)
                        if (res[field.slug] !== resultFormula) {
                            isChanged = true
                        }
                        res[field.slug] = resultFormula
                    }
                }
            }
            if (isChanged) {
                let bulk = {
                    updateOne: {
                        filter:
                            { guid: data.id },
                        update: res
                    }
                }
                updatedObjects.push(bulk)
            }
        }
        await tableInfo.models.bulkWrite(updatedObjects)
        const response = struct.encode({
            count: count,
            response: result,
        });
        const tableWithVersion = await tableVersion(mongoConn, { slug: req.table_slug })
        let customMessage = ""
        if (tableWithVersion) {
            const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                code: 200,
                table_id: tableWithVersion.id,
                action_type: "GET_LIST"
            })
            if (customErrMsg) { customMessage = customErrMsg.message }
        }
        return { table_slug: req.table_slug, data: response, is_cached: tableWithVersion.is_cached ?? false, custom_message: customMessage }
    }),
    delete: catchWrapDbObjectBuilder(`${NAMESPACE}.delete`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const data = struct.decode(req.data)
            const allTableInfo = (await ObjectBuilder(true, req.project_id))
            const tableModel = await tableVersion(mongoConn, { slug: req.table_slug, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, data.version_id, true)
            let response = await allTableInfo[req.table_slug].models.findOne({
                guid: data.id
            })
            if (response) {
                if (tableModel && tableModel.is_login_table && !data.from_auth_service) {
                    let tableAttributes = struct.decode(tableModel.attributes)

                    if (tableAttributes && tableAttributes.auth_info) {

                        let authInfo = tableAttributes.auth_info
                        if (!response[authInfo['client_type_id']] || !response[authInfo['role_id']]) {
                            throw new Error('This table is auth table. Auth information not fully given')
                        }
                        let loginTable = allTableInfo['client_type']?.models?.findOne({
                            guid: response[authInfo['client_type_id']],
                            table_slug: tableModel.slug
                        })
                        if (loginTable) {
                            let authDeleteUserRequest = {
                                client_type_id: response[authInfo['client_type_id']],
                                role_id: response[authInfo['role_id']],
                                project_id: data['company_service_project_id'],
                                user_id: response['guid'],
                                environment_id: data['company_service_environment_id']
                            }
                            await grpcClient.deleteUserAuth(authDeleteUserRequest)
                        }
                    }
                }
            }
            if (!tableModel.soft_delete) {
                response = await allTableInfo[req.table_slug].models.findOneAndDelete({ guid: data.id });
            } else if (tableModel.soft_delete) {
                response = await allTableInfo[req.table_slug].models.findOneAndUpdate({ guid: data.id }, { $set: { deleted_at: new Date() } })
            }
            return { table_slug: req.table_slug, data: response };
        } catch (err) {
            throw err
        }
    }),
    deleteMany: catchWrapDbObjectBuilder(`${NAMESPACE}.deleteMany`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const data = struct.decode(req.data)
            const allTableInfo = (await ObjectBuilder(true, req.project_id))
            const tableModel = await tableVersion(mongoConn, { slug: req.table_slug, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, data.version_id, true)
            let response = []
            if (data.ids && data.ids.length) {
                response = await allTableInfo[req.table_slug].models.find({
                    guid: { $in: data.ids }
                })
            }
            if (response && response.length) {
                let tableAttributes = struct.decode(tableModel.attributes)
                if (tableAttributes && tableAttributes.auth_info) {
                    let readyForAuth = [];
                    for (const obj of response) {
                        if (tableModel && tableModel.is_login_table && !data.from_auth_service) {

                            let authInfo = tableAttributes.auth_info
                            if (!obj[authInfo['client_type_id']] || !obj[authInfo['role_id']]) {
                                throw new Error('This table is auth table. Auth information not fully given')
                            }
                            let loginTable = allTableInfo['client_type']?.models?.findOne({
                                guid: obj[authInfo['client_type_id']],
                                table_slug: tableModel.slug
                            })
                            if (loginTable) {
                                readyForAuth.push({
                                    client_type_id: obj[authInfo['client_type_id']],
                                    role_id: obj[authInfo['role_id']],
                                    user_id: obj['guid']
                                })

                            }
                        }
                    }
                    if (response.length !== readyForAuth.length) {
                        throw new Error('This table is auth table. Auth information not fully given for delete many users')
                    }
                    await grpcClient.deleteUsersAuth({
                        users: readyForAuth,
                        project_id: data['company_service_project_id'],
                        environment_id: data['company_service_environment_id'],
                    })
                }
                if (!tableModel.soft_delete) {
                    data.ids.length && await allTableInfo[req.table_slug].models.deleteMany({ guid: { $in: data.ids } });
                } else if (tableModel.soft_delete) {
                    data.ids.length && await allTableInfo[req.table_slug].models.updateMany({ guid: { $in: data.ids } }, { $set: { deleted_at: new Date() } })
                }
            }
            return { table_slug: req.table_slug, data: {} };
        } catch (err) {
            throw err
        }
    }),
    deleteManyToMany: catchWrapDbObjectBuilder(`${NAMESPACE}.deleteManyToMany`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)

            const fromTableModel = (await ObjectBuilder(true, data.project_id))[data.table_from]
            if (!fromTableModel) {
                throw new Error("table not found")
            }
            const toTableModel = (await ObjectBuilder(true, data.project_id))[data.table_to]

            if (!toTableModel) {
                throw new Error("table not found")
            }
            const modelFrom = await fromTableModel.models.findOne({
                guid: data.id_from,
            })

            const modelTo = await toTableModel.models.findOne({
                guid: data.id_to[0],
            })

            modelFrom[data.table_to + "_ids"] = modelFrom[data.table_to + "_ids"].filter(id => id !== data.id_to[0])
            await fromTableModel.models.updateOne({
                guid: data.id_from,
            },
                {
                    $set: {
                        [data.table_to + "_ids"]: modelFrom[data.table_to + "_ids"]
                    }
                })

            modelTo[data.table_from + "_ids"] = modelTo[data.table_from + "_ids"].filter(id => id !== data.id_from)
            await toTableModel.models.updateOne({
                guid: data.id_to[0],
            },
                {
                    $set: {
                        [data.table_from + "_ids"]: modelTo[data.table_from + "_ids"]
                    }
                })
            const tableWithVersion = await tableVersion(mongoConn, { slug: data.table_from })
            let customMessage = ""
            if (tableWithVersion) {
                const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                    code: 200,
                    table_id: tableWithVersion.id,
                    action_type: "DELETE_MANY2MANY"
                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }
            return { data: data, custom_message: customMessage };
        } catch (err) {
            throw err
        }
    }),
    appendManyToMany: catchWrapDbObjectBuilder(`${NAMESPACE}.appendManyToMany`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id)
            const fromTableModel = (await ObjectBuilder(true, data.project_id))[data.table_from]
            if (!fromTableModel) {
                throw new Error("table not found")
            }
            const toTableModel = (await ObjectBuilder(true, data.project_id))[data.table_to]
            if (!toTableModel) {
                throw new Error("table not found")
            }
            const modelFrom = await fromTableModel.models.findOne({
                guid: data.id_from,
            }).lean()
            for (const el of data.id_to) {
                if (Array.isArray(modelFrom[data.table_to + "_ids"])) {
                    if (!modelFrom[data.table_to + "_ids"].includes(el)) {
                        modelFrom[data.table_to + "_ids"].push(el)
                    }
                } else {
                    modelFrom[data.table_to + "_ids"] = [el]
                }
            }

            await fromTableModel.models.updateOne({
                guid: data.id_from,
            },
                {
                    $set: {
                        [data.table_to + "_ids"]: modelFrom[data.table_to + "_ids"]
                    }
                })



            for (const el of data.id_to) {
                const modelTo = await toTableModel.models.findOne({
                    guid: el,
                }).lean()
                if (Array.isArray(modelTo[data.table_from + "_ids"])) {
                    if (!modelTo[data.table_from + "_ids"].includes(data.id_from)) {
                        modelTo[data.table_from + "_ids"].push(data.id_from)
                    }
                } else {
                    modelTo[data.table_from + "_ids"] = [data.id_from]
                }
                await toTableModel.models.updateOne({
                    guid: el,
                },
                    {
                        $set: {
                            [data.table_from + "_ids"]: modelTo[data.table_from + "_ids"]
                        }
                    })
            }
            const tableWithVersion = await tableVersion(mongoConn, { slug: data.table_from })
            let customMessage = ""
            if (tableWithVersion) {
                const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                    code: 200,
                    table_id: tableWithVersion.id,
                    action_type: "APPEND_MANY2MANY",
                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }


            return { data, custom_message: customMessage };
        } catch (err) {
            throw err
        }

    }),
    multipleUpdate: catchWrapDbObjectBuilder(`${NAMESPACE}.multipleUpdate`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const data = struct.decode(req.data)

            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
            if (!tableInfo) {
                throw new Error('Could not find collection')
            }
            let hasMany2Many = false
            if (tableInfo.fields && tableInfo.fields.length) {
                for (const field of tableInfo.fields) {
                    if (field.type === "LOOKUPS") {
                        hasMany2Many = true
                        break
                    }
                }
            }
            let appendMany2ManyItems = [], deleteMany2ManyItems = []
            if (hasMany2Many) {
                for (const id of req.ids) {
                    let { appendMany2Many, deleteMany2Many } = await prepareFunction.prepareToUpdateInObjectBuilder({
                        project_id: req.project_id,
                        table_slug: req.table_slug,
                        data: struct.encode({
                            guid: id,
                            ...data,
                        })
                    }, mongoConn)
                    appendMany2ManyItems = concat(appendMany2ManyItems, appendMany2Many)
                    deleteMany2ManyItems = concat(deleteMany2ManyItems, deleteMany2Many)
                }
            }
            let funcs = []
            for (const resAppendM2M of appendMany2ManyItems) {
                funcs.push(objectBuilderV2.appendManyToMany(resAppendM2M))
            }
            for (const resDeleteM2M of deleteMany2ManyItems) {
                funcs.push(objectBuilderV2.deleteManyToMany(resDeleteM2M))
            }
            await tableInfo.models.updateMany({
                guid: { $in: req.ids }
            }, {
                $set: data
            })
            await Promise.all(funcs)

            const response = await tableInfo.models.find({ guid: { $in: req.ids } })
            const tableWithVersion = await tableVersion(mongoConn, { slug: req.table_slug })
            let customMessage = ""
            if (tableWithVersion) {
                const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                    code: 200,
                    table_id: tableWithVersion.id,
                    action_type: "MULTIPLE_UPDATE"
                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }
            return {
                table_slug: data.table_slug,
                data: struct.encode({
                    objects: response,
                }),
                custom_message: customMessage
            };
        } catch (err) {
            throw err
        }
    }),
    multipleInsert: catchWrapDbObjectBuilder(`${NAMESPACE}.multipleUpdate`, async (req) => {
        //if you will be change this function, you need to change create function
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const table = mongoConn.models['Table']
            let tableData = await table.findOne(
                {
                    slug: req.table_slug
                }
            )
            const allTableInfos = (await ObjectBuilder(true, req.project_id))
            let isLoginTable = false
            let authInfo = {}
            if (tableData && tableData.is_login_table && !data.from_auth_service) {
                let tableAttributes = struct.decode(tableData.attributes)
                if (tableAttributes && tableAttributes.auth_info) {
                    authInfo = tableAttributes.auth_info
                    let loginTable = await allTableInfos['client_type']?.models?.findOne({
                        guid: objects[0][authInfo['client_type_id']],
                        table_slug: tableData.slug
                    })
                    if (loginTable) {
                        isLoginTable = true
                    } else {
                        throw new Error('Login table not found with given client type id', objects[0][authInfo['client_type_id']])
                    }
                }
            }


            const data = struct.decode(req.data)
            const tableInfo = allTableInfos[req.table_slug]
            let objects = [], appendMany2ManyObj = [], authCheckRequests = [], guids = []
            for (const object of data.objects) {
                //this condition used for object.guid may be exists
                if (!object.guid) {
                    object.guid = v4()
                }
                let request = {
                    data: struct.encode(object),
                    table_slug: req.table_slug,
                    project_id: req.project_id
                }
                let { payload, data, appendMany2ManyObjects } = await PrepareFunction.prepareToCreateInObjectBuilder(request, mongoConn)
                guids.push(payload.guid)
                if (isLoginTable) {
                    if (!data[authInfo['client_type_id']]
                        || !data[authInfo['role_id']]
                        || !(data[authInfo['login']] || data[authInfo['email']] || data[authInfo['phone']])
                    ) {
                        throw new Error('This table is auth table. Auth information not fully given')
                    }

                    let authCheckRequest = {
                        client_type_id: data['client_type_id'],
                        role_id: data['role_id'],
                        login: data[authInfo['login']],
                        email: data[authInfo['email']],
                        phone: data[authInfo['phone']],
                        project_id: data['company_service_project_id'],
                        company_id: data['company_service_company_id'],
                        password: data[authInfo['password']],
                        resource_environment_id: req.project_id,
                        invite: data['invite'],
                        environment_id: data["company_service_environment_id"]
                    }
                    authCheckRequests.push(authCheckRequest)
                }
                appendMany2ManyObj = appendMany2ManyObjects
                objects.push(payload)
            }
            await tableInfo.models.insertMany(objects)
            let responseFromAuth
            if (isLoginTable) {
                responseFromAuth = await grpcClient.createUsersAuth(authCheckRequests)
            }
            let bulkWriteGuids = [];
            if (responseFromAuth && responseFromAuth?.user_ids && responseFromAuth?.user_ids?.length === guids.length) {
                for (let i = 0; i < guids.length; i++) {
                    bulkWriteGuids.push({
                        updateOne: {
                            filter: { guid: el },
                            update: {
                                $set: {
                                    guid: responseFromAuth.user_ids[i]
                                }
                            }
                        }
                    })
                }
            }
            await tableInfo.models.bulkWrite(bulkWriteGuids)
            for (const appendMany2Many of appendMany2ManyObj) {
                await objectBuilderV2.appendManyToMany(appendMany2Many)
            }
            return
        } catch (err) {
            throw err
        }
    }),
}

module.exports = objectBuilderV2;
