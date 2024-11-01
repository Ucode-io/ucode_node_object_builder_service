const XLSX = require('xlsx');
const fs = require('fs');
const Minio = require('minio');
const { struct } = require('pb-util');
const cfg = require("../../config/index");
const logger = require("../../config/logger");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
const { v4 } = require("uuid");
const con = require("../../helper/constants");
const tableVersion = require('../../helper/table_version')
var fns_format = require('date-fns/format');
const { format } = require('date-fns');
var { addDays } = require('date-fns');
const AddPermission = require("../../helper/addPermission");
const RangeDate = require("../../helper/rangeDate");
const ObjectBuilder = require("../../models/object_builder");
const FormulaFunction = require("../../helper/calculateFormulaFields");
const mongoPool = require('../../pkg/pool');
const PrepareFunction = require('../../helper/prepareFunctions');
const prepareFunction = require('../../helper/prepareFunctions');
const grpcClient = require("../../services/grpc/client");
const constants = require('../../helper/constants');
const pluralize = require('pluralize');

const TableStorage = require('./table')
const FieldStorage = require('./field')
const RelationStorage = require('./relation')
const MenuStorage = require('./menu');
const { OrderUpdate } = require('../../helper/board_order')
const updateISODateFunction = require('../../helper/updateISODate');

let NAMESPACE = "storage.object_builder";

let objectBuilder = {
    create: catchWrapDbObjectBuilder(`${NAMESPACE}.create`, async (req) => {
        //if you will be change this function, you need to change multipleInsert function
        const startMemoryUsage = process.memoryUsage();
        
        let allTableInfos = await ObjectBuilder(true, req.project_id)
        const tableInfo = allTableInfos[req.table_slug]
        let ownGuid = "";
        try {
            if (req.blocked_builder) {
                const mongoConn = await mongoPool.get(req.project_id)
                const incrementInfo = mongoConn.models['IncrementSeq']
                const data = struct.decode(req.data)

                for (let field of tableInfo.fields) {
                    if (field.type == "INCREMENT_ID") {
                        let attributes = struct.decode(field.attributes)
                        const incInfo = await incrementInfo.findOneAndUpdate(
                                { table_slug: req.table_slug, field_slug: field.slug },
                                {  
                                    $set: { min_value: 1, max_value: 999999999 },
                                    $inc: { increment_by: 1 },
                                },
                                {upsert: true}
                        )

                        if (!incInfo) {
                            let last = await tableInfo.models.findOne({}, {}, { sort: { 'createdAt': -1 } })
                            if (last) {
                                let incrementLength = attributes.prefix?.length
                                nextIncrement = parseInt(last[field.slug].slice(incrementLength + 1, last[field.slug]?.length)) + 1
                                data[field.slug] = attributes.prefix + '-' + nextIncrement.toString().padStart(9, '0')
                                await incrementInfo.updateOne({ table_slug: req.table_slug, field_slug: field.slug }, { $set: { increment_by: nextIncrement + 1 } })
                            } else {
                                data[field.slug] = attributes.prefix + '-' + '1'.padStart(9, '0')
                                await incrementInfo.update(
                                    { table_slug: req.table_slug, field_slug: field.slug },
                                    { $set: { min_value: 1, max_value: 999999999 }, $inc: { increment_by: 1 } }
                                )
                            }
                        } else {
                            data[field.slug] = attributes.prefix + '-' + incInfo.increment_by.toString().padStart(9, '0')
                        }
                    }
                }
          
                let inserted = new tableInfo.models(data);
                await inserted.save();

                if (!data.guid) { data.guid = inserted.guid }
                const object = struct.encode({ data });
                return { table_slug: req.table_slug, data: object, custom_message: "" };
            }

            const mongoConn = await mongoPool.get(req.project_id)
            const tableData = await tableVersion(mongoConn, { slug: req.table_slug })

            let { payload, data, appendMany2ManyObjects } = await PrepareFunction.prepareToCreateInObjectBuilder(req, mongoConn)
            ownGuid = payload.guid;
            payload = await payload.save();
            for (const appendMany2Many of appendMany2ManyObjects) {
                await objectBuilder.appendManyToMany(appendMany2Many)
            }
            if (tableData && tableData.is_login_table && !data.from_auth_service && !req.blocked_login_table) {
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
                        let loginStrategy = ['login', 'email', 'phone']
                        if (authInfo['login_strategy'] && authInfo['login_strategy'].length) {
                            loginStrategy = authInfo['login_strategy']
                        }
                        let authCheckRequest = {
                            client_type_id: data['client_type_id'],
                            role_id: data['role_id'],
                            login: data[authInfo['login']],
                            email: (data[authInfo['email']] || "").toLowerCase(),
                            phone: data[authInfo['phone']],
                            project_id: data['company_service_project_id'],
                            company_id: data['company_service_company_id'],
                            password: data[authInfo['password']],
                            resource_environment_id: req.project_id,
                            invite: data['invite'],
                            environment_id: data["company_service_environment_id"],
                            login_strategy: loginStrategy
                        }
                        await grpcClient.createUserAuth(authCheckRequest)
                        .catch((err) => {
                            console.error("error while creating user in auth service", JSON.stringify(err))
                        })
                        .then((res)=> {
                            data.guid = res?.user_id
                            tableInfo.models.updateOne({
                                guid: ownGuid
                            }, {
                                $set: { 
                                    email: (authCheckRequest.email) ,
                                    user_id_auth: res.user_id,
                                }
                            })
                            .catch((err) => {
                                console.error("error update login table", JSON.stringify(err));
                            });

                            payload.user_id_auth = res.user_id
                        })
                    }
                }
                await payload.save();
            }

            if (!data.guid) {
                data.guid = payload.guid
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

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("create-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by create: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by create: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
            }

            return { table_slug: req.table_slug, data: object, custom_message: customMessage };

        } catch (err) {
            await tableInfo.models.deleteOne({ guid: ownGuid })
            throw err
        }
    }),
    update: catchWrapDbObjectBuilder(`${NAMESPACE}.update`, async (req) => {
        //if you will be change this function, you need to change multipleUpdateV2 function
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const allTableInfo = (await ObjectBuilder(true, req.project_id))

            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

            if (req.blocked_builder) {
                const data = struct.decode(req.data)
                await tableInfo.models.findOneAndUpdate({ guid: data.guid }, { $set: data });

                return { table_slug: req.table_slug, data: struct.encode(data), custom_message: "" };
            }
            const tableModel = await tableVersion(mongoConn, { slug: req.table_slug })
            let customMessage = ""
            let updatedUser = {}

            try {
                const data = struct.decode(req.data)
                if (!data.guid) {
                    data.guid = data.id
                }
                data.id = data.guid
                if (data.auth_guid) {
                    data.guid = data.auth_guid
                }
                let response = await allTableInfo[req.table_slug].models.findOne({
                    guid: data.id
                });

                let tableAttributes;
                let authInfo;
                if (tableModel.attributes) {
                    tableAttributes = struct.decode(tableModel.attributes);
                    authInfo = tableAttributes.auth_info;
                }

                if (!data.from_auth_service) {
                    if (authInfo && authInfo['password'] && data[authInfo['password']] !== "") {
                        let checkPassword = ""
                        if (data[authInfo['password']]) {
                            checkPassword = data[authInfo['password']].substring(0, 4)
                        }
                        if (checkPassword != "$2b$" && checkPassword != "$2a$") {
                            if (response) {
                                if (tableModel && tableModel.is_login_table && !data.from_auth_service) {
                                    if (tableAttributes && tableAttributes.auth_info) {
                                        if (!response[authInfo['client_type_id']] || !response[authInfo['role_id']]) {
                                            throw new Error('This table is an auth table. Auth information not fully given');
                                        }

                                        let loginTable = allTableInfo['client_type']?.models?.findOne({
                                            guid: response[authInfo['client_type_id']],
                                            table_slug: tableModel.slug
                                        });

                                        if (loginTable) {
                                            let updateUserRequest = {
                                                env_id: req.env_id,
                                                phone: data[authInfo['phone']],
                                                login: data[authInfo['login']],
                                                email: data[authInfo['email']],
                                                guid: response['user_id_auth'],
                                                project_id: req.company_project_id,
                                                role_id: response[authInfo['role_id']],
                                                client_type_id: response[authInfo['client_type_id']],
                                            };

                                            if (data[authInfo['phone']] && data[authInfo['phone']] !== response[authInfo['phone']]) {
                                                updateUserRequest['is_changed_phone'] = true
                                            }

                                            if (data[authInfo['login']] && data[authInfo['login']] !== response[authInfo['login']]) {
                                                updateUserRequest['is_changed_login'] = true
                                            }

                                            if (data[authInfo['email']] && data[authInfo['email']] !== response[authInfo['email']]) {
                                                updateUserRequest['is_changed_email'] = true
                                            }

                                            if (data[authInfo['password']] && data[authInfo['password']] !== response[authInfo['password']]) {
                                                updateUserRequest['password'] = data[authInfo['password']]
                                            }

                                            updatedUser = await grpcClient.updateUserAuth(updateUserRequest);
                                        }
                                    }
                                }
                            }
                        } else {
                            if (response) {
                                if (tableModel && tableModel.is_login_table && !data.from_auth_service) {
                                    let tableAttributes = struct.decode(tableModel.attributes);

                                    if (tableAttributes && tableAttributes.auth_info) {
                                        let authInfo = tableAttributes.auth_info;

                                        if (!response[authInfo['client_type_id']] || !response[authInfo['role_id']]) {
                                            throw new Error('This table is an auth table. Auth information not fully given');
                                        }

                                        let loginTable = allTableInfo['client_type']?.models?.findOne({
                                            guid: response[authInfo['client_type_id']],
                                            table_slug: tableModel.slug
                                        });

                                        if (loginTable) {
                                            let updateUserRequest = {
                                                env_id: req.env_id,
                                                phone: data[authInfo['phone']],
                                                login: data[authInfo['login']],
                                                email: data[authInfo['email']],
                                                guid: response['user_id_auth'],
                                                project_id: req.company_project_id,
                                                role_id: response[authInfo['role_id']],
                                                client_type_id: response[authInfo['client_type_id']],
                                            };
                                            if (data[authInfo['phone']] && data[authInfo['phone']] !== response[authInfo['phone']]) {
                                                updateUserRequest['is_changed_phone'] = true
                                            }

                                            if (data[authInfo['login']] && data[authInfo['login']] !== response[authInfo['login']]) {
                                                updateUserRequest['is_changed_login'] = true
                                            }

                                            if (data[authInfo['email']] && data[authInfo['email']] !== response[authInfo['email']]) {
                                                updateUserRequest['is_changed_email'] = true
                                            }

                                            updatedUser = await grpcClient.updateUserAuth(updateUserRequest);
                                        }
                                    }
                                }
                            }
                        }
                    } else if (authInfo && authInfo['phone'] && data[authInfo['phone']]) {
                        if (response) {
                            if (tableModel && tableModel.is_login_table && !data.from_auth_service) {
                                let tableAttributes = struct.decode(tableModel.attributes);

                                if (tableAttributes && tableAttributes.auth_info) {
                                    let authInfo = tableAttributes.auth_info;

                                    if (!response[authInfo['client_type_id']] || !response[authInfo['role_id']]) {
                                        throw new Error('This table is an auth table. Auth information not fully given');
                                    }

                                    let loginTable = allTableInfo['client_type']?.models?.findOne({
                                        guid: response[authInfo['client_type_id']],
                                        table_slug: tableModel.slug
                                    });

                                    if (loginTable) {
                                        let updateUserRequest = {
                                            env_id: req.env_id,
                                            phone: data[authInfo['phone']],
                                            login: data[authInfo['login']],
                                            email: data[authInfo['email']],
                                            guid: response['user_id_auth'],
                                            project_id: req.company_project_id,
                                            role_id: response[authInfo['role_id']],
                                            client_type_id: response[authInfo['client_type_id']],
                                        };

                                        if (data[authInfo['phone']] && data[authInfo['phone']] !== response[authInfo['phone']]) {
                                            updateUserRequest['is_changed_phone'] = true
                                        }

                                        updatedUser = await grpcClient.updateUserAuth(updateUserRequest);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                throw error
            }

            let { data, appendMany2Many, deleteMany2Many } = await PrepareFunction.prepareToUpdateInObjectBuilder(req, mongoConn)
            data.user_id_auth = updatedUser.user_id

            await OrderUpdate(mongoConn, tableInfo, req.table_slug, data)
            await tableInfo.models.findOneAndUpdate({ guid: data.id }, { $set: data });
 
            
            let funcs = []
            for (const resAppendM2M of appendMany2Many) {
                funcs.push(objectBuilder.appendManyToMany(resAppendM2M))
            }
            for (const resDeleteM2M of deleteMany2Many) {
                funcs.push(objectBuilder.deleteManyToMany(resDeleteM2M))
            }

            await Promise.all(funcs)

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("update-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by update: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by update: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
            }
            
            return { table_slug: req.table_slug, data: struct.encode(data), custom_message: customMessage };
        } catch (err) {
            throw err
        }
    }),
    getSingle: catchWrapDbObjectBuilder(`${NAMESPACE}.getSingle`, async (req) => {
        const startMemoryUsage = process.memoryUsage();
        // Prepare Stage
        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const data = struct.decode(req.data)
        const tables = (await ObjectBuilder(true, req.project_id))
        const tableInfo = tables[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }
        //

        // Get Relations
        const relations = await Relation.find({
            table_from: req.table_slug,
            type: "One2One"
        })
        const relationsM2M = await Relation.find({
            $or: [{
                table_from: req.table_slug
            },
            {
                table_to: req.table_slug
            }],
            $and: [{
                type: "Many2Many"
            }]
        })
        //

        // Get Related Tables
        let relatedTable = []
        for (const relation of relations) {
            const field = await Field.findOne({
                relation_id: relation.id
            })
            if (field) {
                relatedTable.push(field?.slug + "_data")
            }
        }
        //
        // Get relationsM2M
        let relationQueries = []
        for (const relation of relationsM2M) {
            if (relation.table_to === req.table_slug) {
                relation.field_from = relation.field_to
            }
            relationQueries.push({
                slug: relation.field_from,
                relation_id: relation.id
            })
        }
        if (relationQueries.length > 0) {
            const fields = await Field.find(
                {
                    $or: relationQueries
                }
            )
            for (const field of fields) {
                if (field)
                    relatedTable.push(field?.slug + "_data")
            }
        }

        let { fieldsWithPermissions, unusedFieldsSlugs } = await AddPermission.toField(tableInfo.fields, data["role_id_from_token"], req.table_slug, req.project_id)

        let output = await tableInfo.models.findOne({
            guid: data.id
        },
            {
                created_at: 0,
                updated_at: 0,
                createdAt: 0,
                updatedAt: 0,
                _id: 0,
                __v: 0,
                ...unusedFieldsSlugs
            }).populate(relatedTable).lean();

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
                        output[field.slug] = resultFormula[0]?.res
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
                        // output[field.slug] = 0
                        // isChanged = true
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
        if (output) {
            for (const relation of relatedTable) {
                if (relation in output) {
                    nameWithDollarSign = "$" + relation
                    output[nameWithDollarSign] = output[relation] // on object create new key name. Assign old value to this
                    delete output[relation]
                }
            }
        }
        let decodedFields = []
        for (const element of tableInfo.fields) {
            if (element.attributes && !(element.type === "LOOKUP" || element.type === "LOOKUPS")) {
                let field = { ...element }
                field.attributes = struct.decode(element.attributes)
                decodedFields.push(field)
            } else {
                let autofillFields = []
                let elementField = { ...element }
                // optimize for O(1)
                const relation = relations.find(val => (val.id === elementField.relation_id))

                let relationTableSlug;
                if (relation) {
                    if (relation?.table_from === req.table_slug) {
                        relationTableSlug = relation?.table_to
                    } else {
                        relationTableSlug = relation?.table_from
                    }
                    elementField.table_slug = relationTableSlug
                }
                elementField.attributes = struct.decode(element.attributes)
                // const tableElement = await table.findOne({
                //     slug: req.table_slug
                // })
                const tableElement = await tableVersion(mongoConn, { slug: req.table_slug }, data.version_id, true)
                const tableElementFields = await Field.find({
                    table_id: tableElement.id
                })
                for (const field of tableElementFields) {
                    if (field.autofill_field && field.autofill_table && field.autofill_table === relationTableSlug) {
                        let autofill = {
                            field_from: field.autofill_field,
                            field_to: field.slug,
                        }
                        autofillFields.push(autofill)
                    }
                }
                elementField.attributes["autofill"] = autofillFields,
                    decodedFields.push(elementField)
            }
        };

        for (const field of decodedFields) {
            if (field.type === "LOOKUP" || field.type === "LOOKUPS") {
                let relation = await Relation.findOne({ table_from: req.table_slug, table_to: field.table_slug })
                let viewFields = []
                if (relation) {
                    let viewFieldsResp = await Field.find(
                        {
                            id: { $in: relation.view_fields }
                        },
                        {
                            createdAt: 0,
                            updatedAt: 0,
                            created_at: 0,
                            updated_at: 0,
                            _id: 0,
                            __v: 0
                        })

                    for (let i = 0; i < viewFieldsResp.length; i++) {
                        if (viewFieldsResp[i].attributes) {
                            viewFieldsResp[i].attributes = struct.decode(viewFieldsResp[i].attributes)
                        }
                        viewFields.push(viewFieldsResp[i]._doc)
                    }

                    // for (const view_field of relation.view_fields) {
                    //     let viewField = await Field.findOne(
                    //         {
                    //             id: view_field
                    //         },
                    //         {
                    //             createdAt: 0,
                    //             updatedAt: 0,
                    //             created_at: 0,
                    //             updated_at: 0,
                    //             _id: 0,
                    //             __v: 0
                    //         })
                    //     if (viewField) {
                    //         if (viewField.attributes) {
                    //             viewField.attributes = struct.decode(viewField.attributes)
                    //         }
                    //         viewFields.push(viewField._doc)
                    //     }
                    // }
                }
                field.view_fields = viewFields
            }
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

        const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getSingle-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by getSingle: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getSingle: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
            }

        return {
            table_slug: data.table_slug,
            data: struct.encode({
                response: output,
                fields: decodedFields
            }),
            custom_message: customMessage
        }
    }),
    getListSlim: catchWrapDbObjectBuilder(`${NAMESPACE}.getListSlim`, async (req) => {
        const startMemoryUsage = process.memoryUsage();
        const mongoConn = await mongoPool.get(req.project_id)
        const table = mongoConn.models['Table']
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const params = struct.decode(req?.data)
        const limit = params.limit
        const offset = params.offset
        delete params["client_type_id_from_token"]
        delete params["limit"]
        delete params["offset"]
        const allTables = await ObjectBuilder(true, req.project_id)
        const tableInfo = allTables[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }


        let keys = Object.keys(params)
        let order = params.order || {}
        let with_relations = params.with_relations

        const currentTable = await tableVersion(mongoConn, { slug: req.table_slug })

        if (currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: 1 }
        } else if (!currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: -1 }
        }

        for (const key of keys) {
            if ((key === req.table_slug + "_id" || key === req.table_slug + "_ids") && params[key] !== "" && !params["is_recursive"]) {
                params["guid"] = params[key]
            }
            if (typeof (params[key]) === "object") {

                if (params[key]) {
                    let is_array = Array.isArray(params[key])
                    if (is_array) {
                        params[key] = { $in: params[key] }
                    }
                }
            } else if (!key.includes('.') && typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                params[key] = RegExp(params[key], "i")
            }
        }

        let relations = []
        if (with_relations) {
            const relationsResp = await Relation.find({
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
            relations = relationsResp
        }

        let result = [], count;
        let populateArr = []
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
                        __v: 0
                    }, { sort: order }
                ).skip(offset)
                    .limit(limit)
                    .lean();
            } else {
                tableParams = []
                for (const key of Object.keys(params)) {
                    if (key.includes('.')) {
                        if (typeof params[key] === "object") {
                            let objectKeys = Object.keys(params[key])
                            let interval = {}
                            for (const objectKey of objectKeys) {
                                interval[objectKey] = params[key][objectKey]
                            }
                            if (tableParams[key.split('.')[0]]) {
                                tableParams[key.split('.')[0]][key.split('.')[1]] = interval
                            } else {
                                tableParams[key.split('.')[0]] = {
                                    [key.split('.')[1]]: interval,
                                    select: '-_id'
                                }
                            }
                        } else if (typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                            if (tableParams[key.split('.')[0]]) {
                                tableParams[key.split('.')[0]][key.split('.')[1]] = { $regex: params[key] }
                            } else {
                                tableParams[key.split('.')[0]] = {
                                    [key.split('.')[1]]: { $regex: params[key] },
                                    select: '-_id'
                                }
                            }
                        }
                    }
                }
                for (const relation of relations) {
                    if (relation.type === "One2Many") {
                        relation.table_to = relation.table_from
                    } else if (relation.type === "Many2Many") {
                        continue
                    }
                    // else if (relation.type === "Many2Many" && relation.table_to === req.table_slug) {
                    //     relation.field_to = relation.field_from
                    // }
                    let table_to_slug = ""
                    let deepRelations = []
                    const field = tableInfo.fields.find(val => (val.relation_id === relation?.id))
                    if (field) {
                        table_to_slug = field.slug + "_data"
                    }
                    if (table_to_slug === "") {
                        continue
                    }

                    if (with_relations) {
                        if (relation.type === "Many2Dynamic") {
                            // for(dynamic_table of relation.dynamic_tables){
                            //     deepPopulateRelations = await Relation.find({table_from:dynamic_table.table_slug})
                            //     for (const deepRelation of deepPopulateRelations) {
                            //         if (deepRelation.table_to !== dynamic_table.table_slug) {
                            //             let deepPopulate = {
                            //                 path: deepRelation.table_to
                            //             }
                            //             deepRelations.push(deepPopulate)
                            //         }
                            //     }
                            // }
                        } else {
                            deepPopulateRelations = await Relation.find({ table_from: relation.table_to })
                            for (const deepRelation of deepPopulateRelations) {
                                if (deepRelation.type === "One2Many") {
                                    deepRelation.table_to = deepRelation.table_from
                                } else if (deepRelation.type === "Many2Many") {
                                    continue
                                } else if (deepRelation.type === "Many2Dynamic") {
                                    continue
                                } else {
                                    let deep_table_to_slug = "";
                                    const field = await Field.findOne({
                                        relation_id: deepRelation?.id
                                    })
                                    if (field) {
                                        deep_table_to_slug = field.slug + "_data"
                                    }
                                    if (deep_table_to_slug === "") {
                                        continue
                                    }

                                    if (deep_table_to_slug !== deepRelation.field_to + "_data") {
                                        let deepPopulate = {
                                            path: deep_table_to_slug
                                        }
                                        deepRelations.push(deepPopulate)
                                    }
                                }
                                // else if (deepRelation.type === "Many2Many" && deepRelation.table_to === relation.table_to) {
                                //     deepRelation.field_to = deepRelation.field_from
                                // }


                            }
                        }
                    }
                    if (tableParams[table_to_slug]) {
                        papulateTable = {
                            path: table_to_slug,
                            match: tableParams[table_to_slug],
                            populate: deepRelations,
                        }
                    } else {
                        if (relation.type === "Many2Dynamic") {
                            for (dynamic_table of relation.dynamic_tables) {
                                papulateTable = {
                                    path: relation.relation_field_slug + "." + dynamic_table.table_slug + "_id_data",
                                    populate: deepRelations
                                }
                                populateArr.push(papulateTable)
                            }
                            continue
                        }
                        papulateTable = {
                            path: table_to_slug,
                            populate: deepRelations
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
                        __v: 0
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
        const tableWithVersion = await tableVersion(mongoConn, { slug: req.table_slug })
        let customMessage = ""
        if (tableWithVersion) {
            const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                code: 200,
                table_id: tableWithVersion.id,
                action_type: "GET_LIST_SLIM"
            })
            if (customErrMsg) { customMessage = customErrMsg.message }
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
                updatedObjects.push(res)
            }
        }

        if (updatedObjects.length) {
            await objectBuilder.multipleUpdateV2({
                table_slug: req.table_slug,
                project_id: req.project_id,
                data: struct.encode({ objects: updatedObjects })
            })
        }

        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("getListSlim-->Project->" + req.project_id)
            logger.info("Request->" + JSON.stringify(req))

            logger.info(`--> P-M Memory used by getListSlim: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
        
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by getListSlim: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
        }

        const response = struct.encode({
            count: count,
            response: result,
        });
        const tableResp = await table.findOne({ slug: req.table_slug }) || { is_cached: false }
        return { table_slug: req.table_slug, data: response, is_cached: tableResp.is_cached, custom_message: customMessage }

    }),
    getListSlim2: catchWrapDbObjectBuilder(`${NAMESPACE}.getListSlim2`, async (req) => {
        const startMemoryUsage = process.memoryUsage();
        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        let params = struct.decode(req?.data)
        const limit = params.limit
        const offset = params.offset
        delete params["offset"]
        delete params["limit"]
        const allTables = (await ObjectBuilder(true, req.project_id))
        const tableInfo = allTables[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }
        let keys = Object.keys(params)
        let order = params.order || {}
        let fields = tableInfo.fields
        let tableRelationFields = {}
        fields.length && fields.forEach(field => {
            if (field.relation_id) {
                tableRelationFields[field.relation_id] = field
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
        if (params.with_relations) {
            if (params.selected_relations && params.selected_relations.length) {
                relations = await Relation.find(
                    {
                        $or: [{
                            table_from: req.table_slug,
                            table_to: { $in: params.selected_relations },
                        },
                        {
                            "dynamic_tables.table_slug": req.table_slug
                        }
                        ]
                    }
                )
            } else {
                relations = await Relation.find({
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
            }
        }


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
        for (const key of keys) {
            if ((key === req.table_slug + "_id" || key === req.table_slug + "_ids") && params[key] !== "" && !params["is_recursive"]) {
                params["guid"] = params[key]
            }
            if (typeof (params[key]) === "object") {

                if (params[key]) {
                    let is_array = Array.isArray(params[key])
                    if (is_array) {
                        if (key == "$or") {
                        } else {
                            params[key] = { $in: params[key] }
                        }
                    }
                }
            } else if (!key.includes('.') && typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                if (params[key]) {
                    if (params[key].includes("(")) {
                        params[key] = params[key].replaceAll("(", ("\\("))
                    }
                    if (params[key].includes(")")) {
                        params[key] = params[key].replaceAll(")", ("\\)"))
                    }
                }
                params[key] = RegExp(params[key], "i")
            }
        }
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
        order = { ...order, _id: 1 }
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
                    }, { sort: order }
                ).skip(offset)
                    .limit(limit)
                    .lean();
                count = await tableInfo.models.countDocuments(params);
            } else {
                tableParams = []
                for (const key of Object.keys(params)) {
                    if (key.includes('.')) {
                        if (typeof params[key] === "object") {
                            let objectKeys = Object.keys(params[key])
                            let interval = {}
                            for (const objectKey of objectKeys) {
                                interval[objectKey] = params[key][objectKey]
                            }
                            if (tableParams[key.split('.')[0]]) {
                                tableParams[key.split('.')[0]][key.split('.')[1]] = interval
                            } else {
                                tableParams[key.split('.')[0]] = {
                                    [key.split('.')[1]]: interval,
                                    select: '-_id'
                                }
                            }
                        } else if (typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                            if (tableParams[key.split('.')[0]]) {
                                tableParams[key.split('.')[0]][key.split('.')[1]] = { $regex: params[key] }
                            } else {
                                tableParams[key.split('.')[0]] = {
                                    [key.split('.')[1]]: { $regex: params[key] },
                                    select: '-_id'
                                }
                            }
                        }
                    }
                }
                for (const relation of relations) {
                    if (relation.type === "One2Many") {
                        relation.table_to = relation.table_from
                    } else if (relation.type === "Many2Many") {
                        continue
                    }
                    let table_to_slug = ""
                    let deepRelations = []
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
                            match: tableParams[table_to_slug],
                            populate: deepRelations,
                        }
                    } else {
                        if (relation.type === "Many2Dynamic") {
                            for (dynamic_table of relation.dynamic_tables) {
                                papulateTable = {
                                    path: relation.relation_field_slug + "." + dynamic_table.table_slug + "_id_data",
                                    populate: deepRelations
                                }
                                populateArr.push(papulateTable)
                            }
                            continue
                        }
                        papulateTable = {
                            path: table_to_slug,
                            populate: deepRelations
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
        if (params.calculate_formula) {
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
                    updatedObjects.push(res)
                }
            }
    
            if (updatedObjects.length) {
                await objectBuilder.multipleUpdateV2({
                    table_slug: req.table_slug,
                    project_id: req.project_id,
                    data: struct.encode({ objects: updatedObjects })
                })
            }
        }


        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("getListSlim2-->Project->" + req.project_id)
            logger.info("Request->" + JSON.stringify(req))
            logger.info(`--> P-M Memory used by getListSlim2: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
            
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by getListSlim2: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
        }

        const response = struct.encode({
            count: count,
            response: result,
        });
        return { table_slug: req.table_slug, data: response, is_cached: currentTable.is_cached }

    }),
    getList: catchWrapDbObjectBuilder(`${NAMESPACE}.getList`, async (req) => {
        const startMemoryUsage = process.memoryUsage();
        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        let params = struct.decode(req?.data)
        const limit = params.limit
        const offset = params.offset
        delete params["offset"]
        delete params["limit"]
        const languageSetting = params.language_setting
        delete params["client_type_id_from_token"]
        const { 
            [req.table_slug]: tableInfo,
            record_permission: permissionTable,
            automatic_filter: automaticFilterTable,
            view_permission: viewPermission
         } = await ObjectBuilder(true, req.project_id)

        // const viewPermission = allTables["view_permission"]
        // const tableInfo = allTables[req.table_slug]
        let role_id_from_token = params["role_id_from_token"]
        if (!tableInfo) {
            throw new Error("table not found")
        }

        let keys = Object.keys(params)
        let order = params.order || {}
        let fields = tableInfo.fields
        let tableRelationFields = {}
        fields.length && fields.forEach(field => {
            if (field.relation_id) {
                tableRelationFields[field.relation_id] = field
            }
        })

        let with_relations = params.with_relations

        const currentTable = await tableVersion(mongoConn, { slug: req.table_slug })

        if (currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: 1 }
        } else if (!currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: -1 }
        }

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
        const relations = await Relation.find({
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

                const dupMap = new Map()
                const query = []
                let isDup = false

                for (const autoFilter of automatic_filters) {
                    if (autoFilter?.object_field?.includes('#')) {
                        let splitedElement = autoFilter.object_field.split('#')
                        autoFilter.object_field = splitedElement[0]   
                        let obj = relations.find(el => el.id === splitedElement[1])
                        if (obj) {
                            if (obj.type === 'Many2One' && obj.table_from === req.table_slug) {
                                autoFilter.custom_field = obj.field_from
                            } else if (obj.type === 'Many2Many') {
                                many2manyRelation = true
                            }

                            if (obj.table_from === req.table_slug) {
                                autoFilter.custom_field = obj.field_from
                            } else if (obj.table_to === req.table_slug) {
                                autoFilter.custom_field = obj.field_to
                            }
                        }
                    }

                    let connectionTableSlug = autoFilter.custom_field.slice(0, autoFilter.custom_field.length - 3)
                    let objFromAuth = params?.tables?.find(obj => obj.table_slug === autoFilter.object_field)
                    if (objFromAuth) {
                        if (connectionTableSlug !== req.table_slug) {
                            if (dupMap.has(autoFilter.object_field)) {
                                isDup = true
                            } else {
                                dupMap.set(autoFilter.object_field, true)
                            }
                            query.push({ [autoFilter.custom_field]: objFromAuth.object_id })
                        }
                    }
                }

                if (isDup) {
                    params.$or = query
                } else {
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
                            } else { }
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
                            } else {
                                params[autoFilter.custom_field] = params["user_id_from_token"]
                            }
                        }
                    }
                }
            }
        } else {
            if (permission?.is_all == "undefined" || !permission?.is_all) {
                objFromAuth = params?.tables?.find(obj => obj.table_slug === req.table_slug)
                if (objFromAuth) {
                    params["guid"] = objFromAuth.object_id
                }
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

        let views = tableInfo.views;
        for (let view of views) {
            const permission = await viewPermission.models.findOne({
                view_id: view.id,
                role_id: params.role_id_from_token
            }).lean() || {}
            view.attributes ? view.attributes.view_permission = permission : view.attributes = { view_permission: permission }
        }

        for (const key of keys) {
            if ((key === req.table_slug + "_id" || key === req.table_slug + "_ids") && params[key] !== "" && !params["is_recursive"]) {
                params["guid"] = params[key]
            }
            if (typeof (params[key]) === "object") {

                if (params[key]) {
                    let is_array = Array.isArray(params[key])
                    if (is_array) {
                        params[key] = { $in: params[key] }
                    }
                }
            } else if (!key.includes('.') && typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                if (params[key]) {
                    if (params[key].includes("(")) {
                        params[key] = params[key].replaceAll("(", ("\\("))
                    }
                    if (params[key].includes(")")) {
                        params[key] = params[key].replaceAll(")", ("\\)"))
                    }
                }
                params[key] = RegExp(params[key], "i")
            }
        }

        let relationsFields = []

        //new code
        if (with_relations) {
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
                    params.version_id,
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
                    params.version_id,
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

        let { fieldsWithPermissions, unusedFieldsSlugs } = await AddPermission.toField(fields, role_id_from_token, req.table_slug, req.project_id)
        let decodedFields = []

        let result = [], count;
        let searchByField = []
        if (params.search) {
            for (const field of tableInfo.fields) {
                if (con.STRING_TYPES.includes(field.type)) {
                    let searchField = { [field.slug]: RegExp(params.search, "i") }
                    searchByField.push(searchField)
                }
            }
        }

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


                tableParams = []
                for (const key of Object.keys(params)) {
                    if (key.includes('.')) {
                        if (typeof params[key] === "object") {
                            let objectKeys = Object.keys(params[key])
                            let interval = {}
                            for (const objectKey of objectKeys) {
                                interval[objectKey] = params[key][objectKey]
                            }
                            if (tableParams[key.split('.')[0]]) {
                                tableParams[key.split('.')[0]][key.split('.')[1]] = interval
                            } else {
                                tableParams[key.split('.')[0]] = {
                                    [key.split('.')[1]]: interval,
                                    select: '-_id'
                                }
                            }
                        } else if (typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                            if (tableParams[key.split('.')[0]]) {
                                tableParams[key.split('.')[0]][key.split('.')[1]] = { $regex: params[key] }
                            } else {
                                tableParams[key.split('.')[0]] = {
                                    [key.split('.')[1]]: { $regex: params[key] },
                                    select: '-_id'
                                }
                            }
                        }
                    }
                }
                for (const relation of relations) {
                    if (relation.type === "One2Many") {
                        relation.table_to = relation.table_from
                    } else if (relation.type === "Many2Many") {
                        continue
                    }

                    let table_to_slug = ""
                    let deepRelations = []
                    const field = tableRelationFields[relation.id]
                    if (field) {
                        table_to_slug = field.slug + "_data"
                    }
                    if (table_to_slug === "") {
                        continue
                    }

                    if (with_relations) {
                        if (relation.type === "Many2Dynamic") {
 
                        } else {
                            deepPopulateRelations = await Relation.find({ table_from: relation.table_to })
                            for (const deepRelation of deepPopulateRelations) {
                                if (deepRelation.type === "One2Many") {
                                    deepRelation.table_to = deepRelation.table_from
                                } else if (deepRelation.type === "Many2Many") {
                                    continue
                                } else if (deepRelation.type === "Many2Dynamic") {
                                    continue
                                } else {
                                    let deep_table_to_slug = "";
                                    const field = await Field.findOne({
                                        relation_id: deepRelation?.id
                                    })
                                    if (field) {
                                        deep_table_to_slug = field.slug + "_data"
                                    }
                                    if (deep_table_to_slug === "") {
                                        continue
                                    }

                                    if (deep_table_to_slug !== deepRelation.field_to + "_data") {
                                        let deepPopulate = {
                                            path: deep_table_to_slug
                                        }
                                        deepRelations.push(deepPopulate)
                                    }
                                }

                            }
                        }
                    }
                    if (tableParams[table_to_slug]) {
                        papulateTable = {
                            path: table_to_slug,
                            match: tableParams[table_to_slug],
                            populate: deepRelations,
                        }
                    } else {
                        if (relation.type === "Many2Dynamic") {
                            for (dynamic_table of relation.dynamic_tables) {
                                papulateTable = {
                                    path: relation.relation_field_slug + "." + dynamic_table.table_slug + "_id_data",
                                    populate: deepRelations
                                }
                                populateArr.push(papulateTable)
                            }
                            continue
                        }
                        papulateTable = {
                            path: table_to_slug,
                            populate: deepRelations
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
        // this function add field permission for each field by role id
        // below for loop is in order to decode FIELD.ATTRIBUTES from proto struct to normal object
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
                        let matchParams = {
                            [matchField]: { '$eq': res.guid },
                            ...filters
                        }
                        const resultFormula = await FormulaFunction.calculateFormulaBackend(attributes, matchField, matchParams, req.project_id, (await ObjectBuilder(true, req.project_id)))
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
                updatedObjects.push(res)
            }
        }
        if (updatedObjects.length) {
            await objectBuilder.multipleUpdateV2({
                table_slug: req.table_slug,
                project_id: req.project_id,
                data: struct.encode({ objects: updatedObjects })
            })
        }
        const response = struct.encode({
            count: count,
            response: result,
            fields: decodedFields,
            views: views,
            relation_fields: relationsFields,
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

        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("getList-->Project->" + req.project_id)
            logger.info("Request->" + JSON.stringify(req))
            logger.info(`--> P-M Memory used by getList: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
            
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by getList: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
        }

        return { table_slug: req.table_slug, data: response, is_cached: tableWithVersion.is_cached ?? false, custom_message: customMessage }

    }),
    getList2: catchWrapDbObjectBuilder(`${NAMESPACE}.getList2`, async (req) => {
        const startMemoryUsage = process.memoryUsage();
        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const View = mongoConn.models['View']
        let params = struct.decode(req?.data)
        const limit = params.limit
        const offset = params.offset
        delete params["offset"]
        delete params["limit"]
        let clientTypeId = params["client_type_id_from_token"]
        delete params["client_type_id_from_token"]
        const { 
            [req.table_slug]: tableInfo,
            record_permission: permissionTable,
            automatic_filter: automaticFilterTable,
            client_type: clientTypeTable
        } = await ObjectBuilder(true, req.project_id)


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
        let viewV2 = await View.findOne({ id: params.row_view_id })
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
        let with_relations = params.with_relations

        const currentTable = await tableVersion(mongoConn, { slug: req.table_slug })

        // ! PUSH WHEN TEST ALL CASE
        if (viewV2?.attributes?.table_draggable == true) {
            order = {row_order: 1}
        } else {
            if (currentTable.order_by && !Object.keys(order).length) {
                order = { createdAt: 1 }
            } else if (!currentTable.order_by && !Object.keys(order).length) {
                order = { createdAt: -1 }
            }
        }
     
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

                const dupMap = new Map()
                const query = []
                let isDup = false

                for (const autoFilter of automatic_filters) {
                    if (autoFilter?.object_field?.includes('#')) {
                        let splitedElement = autoFilter.object_field.split('#')
                        autoFilter.object_field = splitedElement[0]   
                        let obj = relations.find(el => el.id === splitedElement[1])
                        if (obj) {
                            if (obj.type === 'Many2One' && obj.table_from === req.table_slug) {
                                autoFilter.custom_field = obj.field_from
                            } else if (obj.type === 'Many2Many') {
                                many2manyRelation = true
                            }

                            if (obj.table_from === req.table_slug) {
                                autoFilter.custom_field = obj.field_from
                            } else if (obj.table_to === req.table_slug) {
                                autoFilter.custom_field = obj.field_to
                            }
                        }
                    }

                    let connectionTableSlug = autoFilter.custom_field.slice(0, autoFilter.custom_field.length - 3)
                    let objFromAuth = params?.tables?.find(obj => obj.table_slug === autoFilter.object_field)
                    if (objFromAuth) {
                        if (connectionTableSlug !== req.table_slug) {
                            if (dupMap.has(autoFilter.object_field)) {
                                isDup = true
                            } else {
                                dupMap.set(autoFilter.object_field, true)
                            }
                            query.push({ [autoFilter.custom_field]: objFromAuth.object_id })
                        }
                    }
                }

                if (isDup) {
                    params.$or = query
                } else {
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
                            } else {
                                // params["guid"] = params["user_id_from_token"]
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
                            } else {
                                params[autoFilter.custom_field] = params["user_id_from_token"]
                            }
                            
                            // if (autoFilter.table_slug == "business_trips" || autoFilter.table_slug == "busines_trip_approvers") {
                            //     params[autoFilter.custom_field] = params["user_id_from_token"]
                            // }
                        }
                    }
                }
            }
        } else {
            if (permission?.is_all == "undefined" || !permission?.is_all) {
                objFromAuth = params?.tables?.find(obj => obj.table_slug === req.table_slug)
                if (objFromAuth) {
                    params["guid"] = objFromAuth.object_id
                }
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
                        } else if (el == "+") {
                            empty += "\\+"
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
                        const plusRegex = /\+/;
                        const numbersOnlyRegex = /^[\d\s]+$/;

                        if ((plusRegex.test(params.search.toString()) || numbersOnlyRegex.test(params.search.toString())) ) {
                            params.search = params.search.toString().replace(/\s+/g, '');
                        }
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

        for (const key of keys) {
            if ((key === req.table_slug + "_id" || key === req.table_slug + "_ids") && params[key] !== "" && !params["is_recursive"]) {
                params["guid"] = params[key]
            }
            if (typeof (params[key]) === "object") {

                if (params[key]) {
                    let is_array = Array.isArray(params[key])
                    if (is_array) {
                        params[key] = { $in: params[key] }
                    }
                }
            } else if (!key.includes('.') && typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                if (params[key]) {
                    if (params[key].includes("(")) {
                        params[key] = params[key].replaceAll("(", ("\\("))
                    }
                    if (params[key].includes(")")) {
                        params[key] = params[key].replaceAll(")", ("\\)"))
                    }
                }
                const numberPattern = /^[0-9]*\.?[0-9]+$/;
                let field = fields.find(val => (val.slug === key))
                if (field?.type == "INTERNATION_PHONE" || field?.type == "PHONE") {
                    let formattedNumber = '';
                    for (let i = 0; i < params[key].length; i++) {
                        const char = params[key].charAt(i);
                        if (/\D/.test(char)) {
                            formattedNumber += '\\';
                        }
                        formattedNumber += char
                    }
                    params[key] = RegExp(formattedNumber, "i")
                } else if (numberPattern.test(params[key]) && field?.type != "SINGLE_LINE" && field?.type != "INCREMENT_ID") {
                    parseNum = parseFloat(params[key])
                    params[key] = parseNum
                } else {
                    params[key] = RegExp(params[key], "i")
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
        order = { ...order, _id: 1 }
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


                tableParams = []
                for (const key of Object.keys(params)) {
                    if (key.includes('.')) {
                        if (typeof params[key] === "object") {
                            let objectKeys = Object.keys(params[key])
                            let interval = {}
                            for (const objectKey of objectKeys) {
                                interval[objectKey] = params[key][objectKey]
                            }
                            if (tableParams[key.split('.')[0]]) {
                                tableParams[key.split('.')[0]][key.split('.')[1]] = interval
                            } else {
                                tableParams[key.split('.')[0]] = {
                                    [key.split('.')[1]]: interval,
                                    select: '-_id'
                                }
                            }
                        } else if (typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                            if (tableParams[key.split('.')[0]]) {
                                tableParams[key.split('.')[0]][key.split('.')[1]] = { $regex: params[key] }
                            } else {
                                tableParams[key.split('.')[0]] = {
                                    [key.split('.')[1]]: { $regex: params[key] },
                                    select: '-_id'
                                }
                            }
                        }
                    }
                }
                for (const relation of relations) {
                    if (relation.type === "One2Many") {
                        relation.table_to = relation.table_from
                    } else if (relation.type === "Many2Many") {
                        continue
                    }
                    let table_to_slug = ""
                    let deepRelations = []
                    const field = tableRelationFields[relation.id]
                    if (field) {
                        table_to_slug = field.slug + "_data"
                    }
                    if (table_to_slug === "") {
                        continue
                    }

                    if (with_relations) {
                        if (relation.type === "Many2Dynamic") {
                        } else {
                            deepPopulateRelations = await Relation.find({ table_from: relation.table_to })
                            for (const deepRelation of deepPopulateRelations) {
                                if (deepRelation.type === "One2Many") {
                                    deepRelation.table_to = deepRelation.table_from
                                } else if (deepRelation.type === "Many2Many") {
                                    continue
                                } else if (deepRelation.type === "Many2Dynamic") {
                                    continue
                                } else {
                                    let deep_table_to_slug = "";
                                    const field = await Field.findOne({
                                        relation_id: deepRelation?.id
                                    })
                                    if (field) {
                                        deep_table_to_slug = field.slug + "_data"
                                    }
                                    if (deep_table_to_slug === "") {
                                        continue
                                    }

                                    if (deep_table_to_slug !== deepRelation.field_to + "_data") {
                                        let deepPopulate = {
                                            path: deep_table_to_slug
                                        }
                                        deepRelations.push(deepPopulate)
                                    }
                                }


                            }
                        }
                    }
                    if (tableParams[table_to_slug]) {
                        papulateTable = {
                            path: table_to_slug,
                            match: tableParams[table_to_slug],
                            populate: deepRelations,
                        }
                    } else {
                        if (relation.type === "Many2Dynamic") {
                            for (dynamic_table of relation.dynamic_tables) {
                                papulateTable = {
                                    path: relation.relation_field_slug + "." + dynamic_table.table_slug + "_id_data",
                                    populate: deepRelations
                                }
                                populateArr.push(papulateTable)
                            }
                            continue
                        }
                        papulateTable = {
                            path: table_to_slug,
                            populate: deepRelations
                        }
                    }
                    populateArr.push(papulateTable)
                }
                let query = tableInfo.models.find(
                    { ...params },
                    {
                      createdAt: 0,
                      updatedAt: 0,
                      created_at: 0,
                      updated_at: 0,
                      _id: 0,
                      __v: 0,
                      ...unusedFieldsSlugs
                    }
                  ).sort(order);
                  
                  query = query.skip(offset);
                  
                result = await query.limit(limit).populate(populateArr).lean();
                  
                result = result.filter(obj => Object.keys(tableParams).every(key => obj[key]))
            }
        }

        count = await tableInfo.models.count(params);
        if (result && result.length) {
            let prev = result.length
            count = count - (prev - result.length)
        }

        if (params.additional_request && params.additional_request.additional_values?.length && params.additional_request.additional_field) {
            let additional_results = [];
            const additional_param = {};
            let result_ids = {}
            result.forEach(el => result_ids[el.guid] = 1)
            let ids = params.additional_request.additional_values.filter(el => result_ids[el] !== 1)
            if (ids.length) {
                additional_param[params.additional_request.additional_field] = { $in: ids }
                if (relations.length == 0) {
                    const flattenedGuids = additional_param.guid.$in.flat();

                    const outputQuery = {
                        guid: {
                            $in: flattenedGuids        
                        }
                    };

                    additional_results = await tableInfo.models.find({
                        ...outputQuery
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
                    const flattenedGuids = additional_param.guid.$in.flat();

                    const outputQuery = {
                        guid: {
                            $in: flattenedGuids        
                        }
                    };
                    
                    additional_results = await tableInfo.models.find({
                        ...outputQuery
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
            }
            
            if(additional_results.length) {
                result = [...result, ...additional_results]
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
                        const resultFormula = await FormulaFunction.calculateFormulaBackend(attributes, matchField, matchParams, req.project_id, await ObjectBuilder(true, req.project_id))
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
                updatedObjects.push(res)
            }
        }
        
        if (updatedObjects.length) {
            await objectBuilder.multipleUpdateV2({
                table_slug: req.table_slug,
                project_id: req.project_id,
                data: struct.encode({ objects: updatedObjects })
            })
        }
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

        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("getList2-->Project->" + req.project_id)
            logger.info("Request->" + JSON.stringify(req))

            logger.info(`--> P-M Memory used by getList2: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
            
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by getList2: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
        }

        return { table_slug: req.table_slug, data: response, is_cached: tableWithVersion.is_cached ?? false, custom_message: customMessage }

    }),
    getSingleSlim: catchWrapDbObjectBuilder(`${NAMESPACE}.getSingleSlim`, async (req) => {
        // Prepare Stage
        const startMemoryUsage = process.memoryUsage();

        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const table = mongoConn.models['Table']
        const data = struct.decode(req.data)
        const allTables = (await ObjectBuilder(true, req.project_id))
        const tableInfo = allTables[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }

        let relatedTable = []
        //

        if (data.with_relations) {
            // Get Relations
            const relations = await Relation.find({
                table_from: req.table_slug,
                type: "One2One"
            })
            const relationsM2M = await Relation.find({
                $or: [{
                    table_from: req.table_slug
                },
                {
                    table_to: req.table_slug
                }],
                $and: [{
                    type: "Many2Many"
                }]
            })
            //

            // Get Related Tables
            for (const relation of relations) {
                const field = await Field.findOne({
                    relation_id: relation.id
                })
                if (field) {
                    relatedTable.push(field?.slug + "_data")
                }
            }
            //

            // Get relationsM2M
            let relationQueries = []
            for (const relation of relationsM2M) {
                if (relation.table_to === req.table_slug) {
                    relation.field_from = relation.field_to
                }
                relationQueries.push({
                    slug: relation.field_from,
                    relation_id: relation.id
                })
            }
            if (relationQueries.length > 0) {
                const fields = await Field.find(
                    {
                        $or: relationQueries
                    }
                )
                for (const field of fields) {
                    if (field)
                        relatedTable.push(field?.slug + "_data")
                }
            }
            //
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
            }).populate(relatedTable).lean();

        if (!output) { logger.error(`failed to find object in table ${data.table_slug} with given id: ${data.id}`) };
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
                    const relationFieldTable = await table.findOne({
                        slug: attributes.table_from.split('#')[0],
                        deleted_at: "1970-01-01T18:00:00.000+00:00"
                    })
                    const relationField = await Field.findOne({
                        relation_id: attributes.table_from.split('#')[1],
                        table_id: relationFieldTable.id
                    })
                    if (!relationField || !relationFieldTable) {
                        output[field.slug] = 0
                        continue
                    }
                    const dynamicRelation = await Relation.findOne({ id: attributes.table_from.split('#')[1] })
                    let matchField = relationField ? relationField.slug : req.table_slug + "_id"
                    if (dynamicRelation && dynamicRelation.type === "Many2Dynamic") {
                        matchField = dynamicRelation.field_from + `.${req.table_slug}` + "_id"
                    }
                    let matchParams = {
                        [matchField]: { '$eq': data.id },
                        ...filters
                    }
                    const resultFormula = await FormulaFunction.calculateFormulaBackend(attributes, matchField, matchParams, req.project_id)
                    if (resultFormula.length) {
                        if (attributes.number_of_rounds && attributes.number_of_rounds > 0) {
                            if (!isNaN(resultFormula[0].res)) {
                                resultFormula[0].res = resultFormula[0]?.res?.toFixed(attributes.number_of_rounds)
                            }
                        } else {
                            output[field.slug] = resultFormula[0].res
                        }
                    } else {
                        output[field.slug] = 0
                    }
                }
            } else if (field.type === "FORMULA_FRONTEND") {
                if (attributes && attributes.fomula) {
                    const resultFormula = await FormulaFunction.calculateFormulaFrontend(attributes, tableInfo.fields, output)
                    output[field.slug] = resultFormula
                }
            }
        }

        for (const relation of relatedTable) {
            if (relation in output) {
                nameWithDollarSign = "$" + relation
                output[nameWithDollarSign] = output[relation] // on object create new key name. Assign old value to this
                delete output[relation]
            }
        }

        const tableWithVersion = await tableVersion(mongoConn, { slug: req.table_slug })
        let customMessage = ""
        if (tableWithVersion) {
            const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                code: 200,
                table_id: tableWithVersion.id
            })
            if (customErrMsg) { customMessage = customErrMsg.message }
        }

        const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getSingleSlim-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by getSingleSlim: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getSingleSlim: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
            }

        return {
            table_slug: data.table_slug,
            data: struct.encode({
                response: output,
            }),
            custom_message: customMessage
        }
    }),
    delete: catchWrapDbObjectBuilder(`${NAMESPACE}.delete`, async (req) => {
        try {
            const startMemoryUsage = process.memoryUsage();

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
                                user_id: response['user_id_auth'],
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

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("delete-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by delete: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by delete: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
            }

            return { table_slug: req.table_slug, data: response};

        } catch (err) {
            throw err
        }
    }),
    getListInExcel: catchWrapDbObjectBuilder(`${NAMESPACE}.getListInExcel`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const startMemoryUsage = process.memoryUsage();
            let workSheet;
            logger.info("excel->" + req.project_id + " " + req.table_slug)
            if (req.project_id == "088bf450-6381-45b5-a236-2cb0880dcaab" && req.table_slug == "contact") {
                delete req.data.fields["role_id_from_token"]
                delete req.data.fields["user_id_from_token"]
                delete req.data.fields["client_type_id_from_token"]
                
                const contactRes = await objectBuilder.getList(req)
                req.table_slug = "contact_eith_client"
                const clientRes = await objectBuilder.getList(req)

                const contactResponse = struct.decode(contactRes.data)
                const clientResponse = struct.decode(clientRes.data)

                const contactResult = contactResponse.response
                const clientResult = clientResponse.response

                const excelData = []
                const headers = [
                    'Имя', 'Фамилия', 'Номер телефона', 'Дата создании', 'Сотрудник', 'Возраст', 'Расположение',
                    'Дата и время', 'Тип встречи', 'Источник клиента', 'Заметка', 'Сумма инвестиции', 'Сотрудники'
                ];
                excelData.push(headers)

                contactResult.forEach(contact => {
                    date = new Date(contact.created_time)
                    let newDate;
                    try {
                        newDate = format(date, 'dd.MM.yyyy HH:mm'); 
                    } catch (error) {}

                    const locationTypeMap = {
                        'tashkent': 'Ташкент',
                        'kashkadarya': 'Кашкадарья',
                        'samarkand': 'Самарканд',
                        'bukhara': 'Бухара',
                        'surkhandarya': 'Сурхандарья',
                        'fergana': 'Фергана',
                        'navai': 'Наваий',
                        'khorezm': 'Xoрезм',
                        'andijan': 'Андижан',
                        'djizakh': 'Джизак',
                        'namangan': 'Наманган',
                        'sirdarya': 'Сырдарья',
                        'karakalpakstan': 'Каракалпакстан',
                        'tashkent_district': 'Ташкентская обл.',
                        'foreghn': 'Загран.',
                    };

                    const locationTypes = Array.isArray(contact.loaction_select) 
                                ? contact.loaction_select 
                                : [contact.loaction_select];
                      
                    const locationType = locationTypes.map(type => locationTypeMap[type] || type).join(', ');

                    excelData.push([
                        contact.fullname,
                        contact.surname,
                        contact.phone_number,
                        newDate,
                        contact?.Employees_id_data?.name,
                        contact?.age,
                        locationType,
                        '', '', '', '', '', '',
                    ]);

                    clientResult
                        .filter(client => client.contact_id === contact.guid)
                        .forEach(client => {
                            const interviewTypeMap = {
                                'call': 'Исходящий звонок',
                                'offline': 'Входящий звонок',
                                'client': 'Клиент приехал в офис',
                                'manager': 'Менеджер подъехал в офис клиента'
                            };
                            const sourceMap = {
                                'site': 'Сайт',
                                'instagram': 'Инстаграм'
                            };

                            const interviewTypes = Array.isArray(client.interview_type) 
                                ? client.interview_type 
                                : [client.interview_type];

                            const sources = Array.isArray(client.source) 
                                ? client.source 
                                : [client.source];

                            const interviewType = interviewTypes.map(type => interviewTypeMap[type] || type).join(', ');
                            const source = sources.map(src => sourceMap[src] || src).join(', ');

                            const date = new Date(client.created_time);
                            let newDate;
                            try {
                                newDate = format(date, 'dd.MM.yyyy HH:mm'); 
                            } catch (error) {}

                            const description = client.description.replace(/<[^>]+>/g, '');

                            excelData.push([
                                '', '', '', '', '', '', '',
                                newDate,
                                interviewType,
                                source,
                                description,
                                client.amount,
                                client?.Employees_id_data?.name
                            ]);
                        });
                })

                workSheet = XLSX.utils.aoa_to_sheet(excelData);
            } else {
                let data = struct.decode(req.data)
                let field_ids = data.field_ids
                let language = data.language
                delete req.data.field_ids
                req.data.fields.limit = {kind: 'intValue', value: 100}
                const res = await objectBuilder.getList(req)
                delete req.data.fields.limit
                const response = struct.decode(res.data)
                const result = response.response
                const decodedFields = response.fields
                const selectedFields = decodedFields.filter(obj => field_ids.includes(obj.id));
                excelArr = []
                for (const obj of result) {
                    excelObj = {}
                    for (const field of selectedFields) {
                        field.label = field.attributes.label_en
    
                        if (obj[field.slug]) {
                            if (field.type === "MULTI_LINE") {
                                obj[field.slug] = obj[field.slug].replace(/<[^>]+>/g, '')
                            }
    
                            if (field.type === "DATE") {
                                toDate = new Date(obj[field.slug])
                                try {
                                    obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy')
                                } catch (error) {}
                            }
    
                            if (field.type === "DATE_TIME") {
                                toDate = new Date(obj[field.slug])
                                try {
                                    obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy HH:mm')
                                } catch (error) {}
                            }

                            if (field.type === "LOOKUP") {
                                let overall = ""
                                if (typeof field.view_fields === "object" && field.view_fields.length) {
                                    for (const view of field.view_fields) {
                                        if (obj[field.slug + "_data"] && obj[field.slug + "_data"][view.slug]) {
                                            if (view.enable_multilanguage){
                                                let lang = ""
                                                let splittedString = view.slug.split("_")
                                                lang = splittedString[splittedString.length - 1]
                                                if (language == lang) {
                                                    overall += obj[field.slug + "_data"][view.slug]
                                                }
                                            } else {
                                                overall += obj[field.slug + "_data"][view.slug]
                                            }
                                        }
                                    }
                                }
                                obj[field.slug] = overall
                            }
                            if (field.type === "MULTISELECT") {
                                let options = []
                                let multiselectValue = "";
                                if (field.attributes) {
                                    options = field.attributes.options
                                }
    
                                if (obj[field.slug].length && options.length && Array.isArray(obj[field.slug])) {
                                    obj[field.slug].forEach(element => {
                                        let getLabelOfMultiSelect = options.find(val => (val.value === element))
                                        if (getLabelOfMultiSelect) {
                                            if (getLabelOfMultiSelect.label) {
                                                multiselectValue += getLabelOfMultiSelect.label + ","
                                            } else {
                                                multiselectValue += getLabelOfMultiSelect.value + ","
                                            }
                                        }
                                    })
                                }
                                if (multiselectValue.length) {
                                    multiselectValue = multiselectValue.slice(0, multiselectValue.length - 1)
                                }
                                obj[field.slug] = multiselectValue
                            }
    
                            excelObj[field.label] = obj[field.slug]
                        } else {
                            excelObj[field.label] = ""
                        }
                    }
                    excelArr.push(excelObj)
                }

                workSheet = XLSX.utils.json_to_sheet(excelArr);
            }

            const workBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
            let filename = "report_" + Math.floor(Date.now() / 1000) + ".xlsx"
            XLSX.writeFile(workBook, "./" + filename);

            let ssl = true
            if ((typeof cfg.minioSSL === "boolean" && !cfg.minioSSL) || (typeof cfg.minioSSL === "string" && cfg.minioSSL !== "true")) {
                ssl = false
            }

            let filepath = "./" + filename
            var minioClient = new Minio.Client({
                endPoint: cfg.minioEndpoint,
                useSSL: ssl,
                accessKey: cfg.minioAccessKeyID,
                secretKey: cfg.minioSecretAccessKey
            });

            var metaData = {
                'Content-Type': "application/octet-stream",
                'Content-Language': 123,
                'X-Amz-Meta-Testing': 1234,
                'example': 5678
            }


            await minioClient.fPutObject("reports", filename, filepath, metaData);
    
            fs.unlink(filename, (err => {
                if (err) {
                    logger.error(`Error deleting file: ${err}`);
                } else {
                    logger.info(`File ${filename} deleted successfully.`);
                }
            }));

            const respExcel = struct.encode({
                link: cfg.minioEndpoint + "/reports/" + filename,
            });
            const tableWithVersion = await tableVersion(mongoConn, { slug: req.table_slug })
            let customMessage = ""
            if (tableWithVersion) {
                const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                    code: 200,
                    table_id: tableWithVersion.id,
                    action_type: "GET_LIST_IN_EXCEL"
                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getListInExcel-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by getListInExcel: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getListInExcel: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
            }

            return { table_slug: req.table_slug, data: respExcel, custom_message: customMessage }
        } catch (err) {
            throw err
        }
    }),
    deleteManyToMany: catchWrapDbObjectBuilder(`${NAMESPACE}.deleteManyToMany`, async (data) => {
        try {
            const startMemoryUsage = process.memoryUsage();

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

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("deleteManyToMany-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by deleteManyToMany: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by deleteManyToMany: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return { data: data, custom_message: customMessage };
        } catch (err) {
            throw err
        }
    }),
    appendManyToMany: catchWrapDbObjectBuilder(`${NAMESPACE}.appendManyToMany`, async (data) => {
        try {

            const startMemoryUsage = process.memoryUsage();

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

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("appendManyToMany-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by appendManyToMany: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by appendManyToMany: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return { data, custom_message: customMessage };
        } catch (err) {
            throw err
        }

    }),
    getTableDetails: catchWrapDbObjectBuilder(`${NAMESPACE}.getTableDetails`, async (req) => {
        const startMemoryUsage = process.memoryUsage();
        const mongoConn = await mongoPool.get(req.project_id)
        let params = struct.decode(req?.data)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']


        const languageSetting = params.language_setting
        const allTables = (await ObjectBuilder(true, req.project_id))
        const viewPermission = allTables["view_permission"]
        const tableInfo = allTables[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }

        let fields = tableInfo.fields
        let tableRelationFields = {}
        fields.length && fields.forEach(field => {
            if (field.relation_id) {
                tableRelationFields[fields.relation_id] = field
            }
            // if (field.type == "LOOKUP" || field.type == "LOOKUPS") {
            //     field.id = field.relation_id
            // }
        })
        let with_relations = params.with_relations

        const relations = await Relation.find({
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

        let views = tableInfo.views;

        for (let view of views) {
            if (Array.isArray(view?.attributes?.quick_filters)) {
                for (let qf of view.attributes.quick_filters) {
                    if (qf.label == "") {
                        qf.label = qf.attributes.label_ru
                    }
                }
            }
        }

        for (let view of views) {
            const permission = await viewPermission.models.findOne({
                view_id: view.id,
                role_id: params.role_id_from_token
            }).lean() || {}
            view.attributes ? view.attributes.view_permission = permission : view.attributes = { view_permission: permission }
        }

        let relationsFields = []
        if (with_relations) {
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
                    params.version_id,
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
                    params.version_id,
                    false
                );  
                for (const childRelationTable of childRelationTables) {
                    if (!childRelationTablesMap[childRelationTable.slug]) {
                        childRelationTablesMap[childRelationTable.slug] = childRelationTable;
                    }
                }
            }
            const newmapCount = {};
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
                                changedField._doc.path_slug = relationTable?.slug + "_id_data" + "." + field.slug;

                                    let newField = JSON.parse(JSON.stringify(changedField._doc));

                                    let pathSlug = newField.path_slug;
                                    let parts = pathSlug.split('.');
                                    let baseSlug = parts[0];
                                                    
                                    if (baseSlug.endsWith("id_data")) {
                                      if (!newmapCount[newField.id]) {
                                        newmapCount[newField.id] = 0;
                                      } 
                                                    
                                      if (newmapCount[newField.id] > 1) {
                                        let toaddnum = baseSlug.split("_data");
                                        newField.path_slug = `${toaddnum[0]}_${newmapCount[newField.id]}_data.${parts[1]}`;
                                        newField.label = newField.label + " " + newmapCount[newField.id]
                                      } else if (newmapCount[newField.id] == 0) {
                                        let toaddnum = baseSlug.split("_data");
                                        newField.path_slug = `${toaddnum[0]}_data.${parts[1]}`;
                                      }
                                                    
                                                    
                                      if ( newmapCount[newField.id] == 0 ) {
                                        newmapCount[newField.id] = 2;
                                      } else {
                                        newmapCount[newField.id] += 1;
                                      }
                                    }

                                relationsFields.push(newField)
                            }
                        }
                    }
                }
            }
        }
        // this function add field permission for each field by role id
        let { fieldsWithPermissions } = await AddPermission.toField(fields, params.role_id_from_token, req.table_slug, req.project_id)
        let decodedFields = []
        // below for loop is in order to decode FIELD.ATTRIBUTES from proto struct to normal object
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
            views: views,
            relation_fields: relationsFields,
        });

        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("getTableDetails-->Project->" + req.project_id)
            logger.info("Request->" + JSON.stringify(req))

            logger.info(`--> P-M Memory used by getTableDetails: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
            
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by getTableDetails: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
        }

        return { table_slug: req.table_slug, data: response }

    }),
    batch: catchWrapDbObjectBuilder(`${NAMESPACE}.batch`, async (req) => {
        try {
            const startMemoryUsage = process.memoryUsage();
            const mongoConn = await mongoPool.get(req.project_id)

            const params = {}
            const data = struct.decode(req.data)
            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
            if (!tableInfo) {
                throw new Error('table not found')
            }

            let result;
            for (const object of data.objects) {
                for (const field of req.updated_fields) {
                    let key = field
                    params[key] = object[field]
                }
                let objectFromTable
                objectFromTable = await tableInfo.models.findOne(
                    {
                        $and: [params]
                    }
                )
                if (objectFromTable) {
                    object.guid = objectFromTable.guid
                    let requestToUpdate = {
                        table_slug: req.table_slug,
                        project_id: req.project_id,
                        data: struct.encode(object)
                    }
                    await objectBuilder.update(requestToUpdate)

                } else {
                    let requestToCreate = {
                        table_slug: req.table_slug,
                        project_id: req.project_id,
                        data: struct.encode(object)
                    }
                    await objectBuilder.create(requestToCreate)
                }
            }
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

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("batch-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by batch: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by batch: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
            }

            return { table_slug: req.table_slug, data: result, custom_message: customMessage };
        } catch (err) {
            throw err
        }

    }),
    multipleUpdate: catchWrapDbObjectBuilder(`${NAMESPACE}.multipleUpdate`, async (req) => {
        try {
            const startMemoryUsage = process.memoryUsage();
            const mongoConn = await mongoPool.get(req.project_id)
            const data = struct.decode(req.data)
            let response = []

            for (const object of data.objects) {
                const keys = Object.keys(object)
                for (const key of keys) {
                    if (object[key] === "true") {
                        object[key] = (object[key] === 'true')
                    } else if (object[key] === "false") {
                        object[key] = (object[key] === 'false')
                    } else {
                        continue
                    }
                }
                let request = {
                    table_slug: req.table_slug,
                    project_id: req.project_id,
                    blocked_builder: req.blocked_builder,
                    data: struct.encode(object)
                }
                if (!object.is_new) {
                    let resp = await objectBuilder.update(request)
                    response.push(resp)
                } else {
                    let resp = await objectBuilder.create(request)
                    response.push(struct.decode(resp.data))
                }
            }

            if (req.blocked_builder) {
                return {
                    table_slug: data.table_slug,
                    data: struct.encode({ objects: response }),
                    custom_message: ""
                };
            }

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

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("multipleUpdate-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by multipleUpdate: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by multipleUpdate: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
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
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']
            let tableData = await table.findOne(
                {
                    slug: req.table_slug
                }
            )
            let isLoginTable = false
            let loginStrategy = ['login', 'email', 'phone']
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
                        if (authInfo['login_strategy'] && authInfo['login_strategy'].length) {
                            loginStrategy = authInfo['login_strategy']
                        }
                    } else {
                        throw new Error('Login table not found with given client type id', objects[0][authInfo['client_type_id']])
                    }
                }
            }
            const allTableInfos = (await ObjectBuilder(true, req.project_id))


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
                        environment_id: data["company_service_environment_id"],
                        login_strategy: loginStrategy
                    }
                    authCheckRequests.push(authCheckRequest)
                }
                if (appendMany2ManyObjects.length) {
                    appendMany2ManyObj.push(...appendMany2ManyObjects)
                }
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
                                    // guid: responseFromAuth.user_ids[i]
                                    user_id_auth: responseFromAuth.user_ids[i]
                                }
                            }
                        }
                    })
                }
            }
            await tableInfo.models.bulkWrite(bulkWriteGuids)
            for (const appendMany2Many of appendMany2ManyObj) {
                await objectBuilder.appendManyToMany(appendMany2Many)
            }
            return
        } catch (err) {
            throw err
        }
    }),
    multipleUpdateV2: catchWrapDbObjectBuilder(`${NAMESPACE}.multipleUpdateV2`, async (req) => {
        //if you will be change this function, you need to change update function
        try {
            const mongoConn = await mongoPool.get(req.project_id)

            const datas = struct.decode(req.data)
            let objects = []
            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
            if (!tableInfo) {
                throw new Error('table not found')
            }
            for (const obj of datas.objects) {
                let request = {
                    data: struct.encode(obj),
                    table_slug: req.table_slug,
                    project_id: req.project_id,
                }

                let { data, event, appendMany2Many, deleteMany2Many } = await prepareFunction.prepareToUpdateInObjectBuilder(request, mongoConn)

                // await sendMessageToTopic(conkafkaTopic.TopicObjectUpdateV1, event)
                let bulk = {
                    updateOne: {
                        filter:
                            { guid: data.id },
                        update: data
                    }
                }
                for (const resAppendM2M of appendMany2Many) {
                    await objectBuilder.appendManyToMany(resAppendM2M)
                }
                for (const resDeleteM2M of deleteMany2Many) {
                    await objectBuilder.deleteManyToMany(resDeleteM2M)
                }
                objects.push(bulk)
            }
            await tableInfo.models.bulkWrite(objects);
            return
        } catch (err) {
            throw err
        }
    }),
    getFinancialAnalytics: catchWrapDbObjectBuilder(`${NAMESPACE}.getFinancialAnalytics`, async (req) => {
        try {
            const startTime = new Date()
            const mongoConn = await mongoPool.get(req.project_id)
            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']
            const View = mongoConn.models['View']
            const request = struct.decode(req.data)

            const view = await View.findOne({
                id: request.view_id
            })
            if (!view) {
                throw new Error("No view with given id")
            }

            let chartOfAccounts = []
            let groupByOptions = []
            let field_slug = ""
            for (const chartOfAccount of view.attributes?.chart_of_accounts) {
                if (chartOfAccount.field_slug) {
                    field_slug = chartOfAccount.field_slug
                }
                groupByOptions.push(chartOfAccount.group_by)
                chartOfAccounts = chartOfAccounts.concat(chartOfAccount.chart_of_account)
            }
            if (field_slug === "") {
                throw new Error("Укажите группу по полям")
            }
            request[field_slug] = groupByOptions
            let resp = await objectBuilder.getList({
                project_id: req.project_id,
                table_slug: req.table_slug,
                data: struct.encode(request)
            })
            const data = struct.decode(resp.data)
            const objects = data.response
            if (objects.length) {
                for (const obj of objects) {
                    obj.amounts = []
                }
            }
            let objStore = new Map()
            let cObjStore = new Map()
            let totalAmountByMonths = new Map()
            let dates = await RangeDate(request.start, request.end, request.interval)


            let balance = {
                items: [],
                total: []
            }

            if (view && view.attributes?.balance && view.attributes.balance?.table_slug && view.attributes.balance?.field_id) {
                // get selected accaunts table
                const req_accaunts_table = {
                    table_slug: view.attributes?.balance?.table_slug || "",
                    project_id: req.project_id,
                    data: struct.encode({})
                }
                let table_accaunts = await objectBuilder.getList(req_accaunts_table)
                table_accaunts = struct.decode(table_accaunts.data)
                const accounts = table_accaunts.response

                const number_field = await Field.findOne({
                    id: view.attributes?.balance.field_id
                })

                let map_accounts = {}, map_total_accounts = {}
                for (let acc of accounts) {
                    map_total_accounts[acc.guid] = {
                        name: acc.name,
                        total: acc[number_field.slug]
                    }
                    map_accounts[acc.guid] = 0
                }

                let map_accounts_by_date = {}
                for (let date of dates) {
                    let keyDate = new Date(date.$gte)
                    keyDate = addDays(keyDate, 1)
                    let key = keyDate.toISOString()
                    map_accounts_by_date[key] = { ...map_accounts }
                }

                const copy_objects = JSON.parse(JSON.stringify(objects))
                for (const obj of copy_objects) {
                    for (const date of dates) {
                        let chartOfAccount = chartOfAccounts.find(element => element.object_id === obj.guid)
                        let keyDate = new Date(date.$gte)
                        keyDate = addDays(keyDate, 1)
                        let key = keyDate.toISOString()
                        let monthlyAmount = obj.amounts.find(el => el.month === key)

                        for (const acc of accounts) {
                            if (chartOfAccount && chartOfAccount.options && chartOfAccount.options.length) {
                                for (const option of chartOfAccount.options) {
                                    if (option.date_field === "") {
                                        continue
                                    }
                                    const optionTable = (await ObjectBuilder(true, req.project_id))[option.table_slug.split('#')[0]]
                                    let groupBy = req.table_slug + '_id'
                                    let groupByWithDollorSign = '$' + req.table_slug + '_id'
                                    let sumFieldWithDollowSign = '$' + option.number_field
                                    let dateBy = option.date_field
                                    let aggregateFunction = "$sum"
                                    let accaunt_id = view.attributes?.balance.table_slug ? view.attributes.balance.table_slug + "_id" : ""

                                    let params = {}
                                    //adding params
                                    params[groupBy] = { '$eq': chartOfAccount.object_id }
                                    params[dateBy] = date
                                    accaunt_id ? params[accaunt_id] = acc.guid : null

                                    if (option.filters && option.filters.length) {
                                        for (const filter of option.filters) {
                                            let field = optionTable?.fields.find(el => el.id == filter.field_id)
                                            if (field) {
                                                if (filter.value?.length) {
                                                    params[field.slug] = { $in: filter.value }
                                                }
                                            }
                                        }
                                    }
                                    const pipelines = [
                                        {
                                            '$match': params,
                                        }, {
                                            '$group': {
                                                '_id': groupByWithDollorSign,
                                                'res': {
                                                    [aggregateFunction]: sumFieldWithDollowSign
                                                }
                                            }
                                        }
                                    ];
                                    const resultOption = await optionTable.models.aggregate(pipelines)

                                    if (resultOption.length) {
                                        if (option.type === "debet") {
                                            map_accounts_by_date[key][acc.guid] += resultOption[0].res
                                        } else if (option.type === "credit") {
                                            map_accounts_by_date[key][acc.guid] -= resultOption[0].res
                                        }
                                    }
                                }
                                if (!monthlyAmount) {
                                    monthlyAmount = {
                                        amount: 0,
                                        month: key
                                    }
                                }
                            } else {
                                monthlyAmount = {
                                    amount: 0,
                                    month: key
                                }
                            }
                        }


                        obj.amounts.push(monthlyAmount)
                        let parentObj = copy_objects.find(el => el.guid === obj[req.table_slug + "_id"])

                        // storing the object to calculate the percentage faster but consumes more memory
                        cObjStore.set(obj.guid, obj)
                    }
                }

                let arr = []
                for (let key in map_accounts_by_date) {
                    arr.push({
                        [key]: map_accounts_by_date[key]
                    })
                }

                let items = []
                for (let key in map_total_accounts) {
                    items.push({
                        name: map_total_accounts[key].name,
                        id: key
                    })
                }


                let total_arr = []
                for (let i = 0; i < arr.length; i++) {

                    for (let key in arr[i]) { // [0]

                        let monthlyCount = 0
                        for (let keyJ in arr[i][key]) {  //  account id keys

                            let count = 0
                            for (let j = i + 1; j < arr.length; j++) { // to next steps

                                for (let keyK in arr[j]) { // [0]

                                    for (let keyH in arr[j][keyK]) {  //  account id keys
                                        if (keyH == keyJ) {
                                            count += arr[j][keyK][keyH]
                                        }
                                    }
                                }
                            }
                            monthlyCount += map_total_accounts[keyJ]['total'] - count
                            let account = null

                            for (let acc of items) {
                                if (acc.id === keyJ) {
                                    account = acc
                                }
                            }

                            if (account) {
                                if (!account.amounts) {
                                    account.amounts = [{ month: key, amount: map_total_accounts[keyJ]['total'] - count }]
                                } else {
                                    account.amounts.push({ month: key, amount: map_total_accounts[keyJ]['total'] - count })
                                }
                            }
                        }
                        total_arr.push({ month: key, amount: monthlyCount })
                    }
                }

                balance.items = items
                balance.total = total_arr
            }

            for (const obj of objects) {
                for (const date of dates) {
                    let chartOfAccount = chartOfAccounts.find(element => element.object_id === obj.guid)
                    let keyDate = new Date(date.$gte)
                    keyDate = addDays(keyDate, 1)
                    let key = keyDate.toISOString()
                    let monthlyAmount = obj.amounts.find(el => el.month === key)
                    if (chartOfAccount && chartOfAccount.options && chartOfAccount.options.length) {
                        for (const option of chartOfAccount.options) {
                            if (option.date_field === "") {
                                continue
                            }
                            const optionTable = (await ObjectBuilder(true, req.project_id))[option.table_slug.split('#')[0]]
                            let groupBy = req.table_slug + '_id'
                            let groupByWithDollorSign = '$' + req.table_slug + '_id'
                            let sumFieldWithDollowSign = '$' + option.number_field
                            let dateBy = option.date_field
                            let aggregateFunction = "$sum"

                            let params = {}
                            //adding params
                            params[groupBy] = { '$eq': chartOfAccount.object_id }
                            params[dateBy] = date

                            if (option.filters && option.filters.length) {
                                for (const filter of option.filters) {
                                    let field = optionTable?.fields.find(el => el.id == filter.field_id)
                                    if (field) {
                                        if (filter.value?.length) {
                                            params[field.slug] = { $in: filter.value }
                                        }
                                    }
                                }
                            }
                            const pipelines = [
                                {
                                    '$match': params,
                                }, {
                                    '$group': {
                                        '_id': groupByWithDollorSign,
                                        'res': {
                                            [aggregateFunction]: sumFieldWithDollowSign
                                        }
                                    }
                                }
                            ];
                            const resultOption = await optionTable.models.aggregate(pipelines)
                            if (resultOption.length) {
                                if (option.type === "debet") {
                                    if (monthlyAmount) {
                                        monthlyAmount.amount += resultOption[0].res
                                    } else {
                                        monthlyAmount = {
                                            amount: resultOption[0].res,
                                            month: key
                                        }
                                    }

                                } else if (option.type === "credit") {
                                    if (monthlyAmount) {
                                        monthlyAmount.amount -= resultOption[0].res
                                    } else {
                                        monthlyAmount = {
                                            amount: -resultOption[0].res,
                                            month: key
                                        }
                                    }
                                }
                            }
                        }
                        if (!monthlyAmount) {
                            monthlyAmount = {
                                amount: 0,
                                month: key
                            }
                        }
                    } else {
                        monthlyAmount = {
                            amount: 0,
                            month: key
                        }
                    }
                    obj.amounts.push(monthlyAmount)
                    let parentObj = objects.find(el => el.guid === obj[req.table_slug + "_id"])
                    while (parentObj) {
                        let parentMonthlyAmount = parentObj.amounts.find(el => el.month === key)
                        if (parentMonthlyAmount && monthlyAmount) {
                            parentMonthlyAmount.amount += monthlyAmount.amount
                        } else if (monthlyAmount) {
                            parentMonthlyAmount = {
                                amount: monthlyAmount.amount,
                                month: monthlyAmount.month
                            }
                            parentObj.amounts.push(parentMonthlyAmount)
                        } else {
                            parentMonthlyAmount = {
                                amount: 0,
                                month: key
                            }
                            parentObj.amounts.push(parentMonthlyAmount)
                        }
                        parentObj = objects.find(el => el.guid === parentObj[req.table_slug + "_id"] && parentObj[req.table_slug + "_id"] != parentObj["guid"])
                        if (parentObj) {
                            parentMonthlyAmount = parentObj.amounts.find(el => el.month === key)
                        }
                    }
                }
                // storing the object to calculate the percentage faster but consumes more memory
                objStore.set(obj.guid, obj)
            }

            for (const obj of objects) {
                if (obj[req.table_slug + "_id"] == null) {
                    for (const monthlyAmount of obj.amounts) {
                        let totalAmount = totalAmountByMonths.get(monthlyAmount.month)
                        if (totalAmount) {
                            totalAmount += monthlyAmount.amount
                        } else {
                            totalAmount = monthlyAmount.amount
                        }
                        totalAmountByMonths.set(monthlyAmount.month, totalAmount)
                    }
                }
            }

            switch (view.attributes?.percent?.type?.toLowerCase()) {
                case "parent":
                    for (const obj of objects) {
                        if (obj[req.table_slug + "_id"] == null) {
                            for (const monthlyAmount of obj.amounts) {
                                monthlyAmount.percentage = 100
                            }
                            continue
                        }
                        let parentObj = objStore.get(obj[req.table_slug + "_id"])
                        for (const monthlyAmount of obj.amounts) {
                            let monthlyAmountParent = parentObj?.amounts.find(el => el.month === monthlyAmount.month)
                            if (monthlyAmountParent && monthlyAmountParent.amount != 0) {
                                monthlyAmount.percentage = monthlyAmount.amount / monthlyAmountParent.amount * 100
                            } else {
                                monthlyAmount.percentage = 0
                            }
                        }
                    }
                    break;
                case "total":
                    for (const obj of objects) {
                        for (const monthlyAmount of obj.amounts) {
                            let totalAmount = totalAmountByMonths.get(monthlyAmount.month)
                            if (totalAmount && totalAmount != 0) {
                                monthlyAmount.percentage = monthlyAmount.amount / totalAmount * 100
                            } else {
                                monthlyAmount.percentage = 0
                            }
                        }
                    }
                    break;
                case "last_parent":
                    for (const obj of objects) {
                        for (const monthlyAmount of obj.amounts) {
                            let parentObj = objStore.get(obj[req.table_slug + "_id"])
                            if (parentObj) {
                                while (objStore.get(parentObj[req.table_slug + "_id"])) {
                                    parentObj = objStore.get(parentObj[req.table_slug + "_id"])
                                }
                                let monthlyAmountParent = parentObj?.amounts.find(el => el.month === monthlyAmount.month)
                                if (monthlyAmountParent && monthlyAmountParent.amount != 0) {
                                    monthlyAmount.percentage = monthlyAmount.amount / monthlyAmountParent.amount * 100
                                }
                            } else {
                                monthlyAmount.percentage = 100
                            }
                        }
                    }
                    break;
                case "field":
                    for (const obj of objects) {
                        for (const monthlyAmount of obj.amounts) {
                            let monthlyAmountParent = objStore.get(obj[req.table_slug + "_id"])?.amounts.find(el => el.month === monthlyAmount.month)
                            if (monthlyAmountParent && monthlyAmountParent.amount != 0) {
                                monthlyAmount.percentage = monthlyAmount.amount / monthlyAmountParent.amount * 100
                            } else {
                                monthlyAmount.percentage = 0
                            }
                        }
                    }
                    break;
            }

            let totalAmounts = []
            for (const [month, total] of totalAmountByMonths.entries()) {
                totalAmounts.push({ month: month, amount: total })
            }
            data.total_amount = totalAmounts
            data.balance = balance
            const endTime = new Date()

            const tableWithVersion = await tableVersion(mongoConn, { slug: req.table_slug })
            let customMessage = ""
            if (tableWithVersion) {
                const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                    code: 200,
                    table_id: tableWithVersion.id,
                    action_type: "GET_FINANCIAL_ANALYTICS"
                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }
            return { table_slug: req.table_slug, data: struct.encode(data), custom_message: customMessage }
            // return { table_slug: "ok", data: struct.encode({}) }
            // return {}
        } catch (err) {

            throw err
        }
    }),
    getGroupReportTables: catchWrapDbObjectBuilder(`${NAMESPACE}.getGroupReportTables`, async (req) => {
        const params = struct.decode(req.data)
        const allTables = (await ObjectBuilder(true, req.project_id))
        let responseRow = []
        let responseColumn = []
        let responseValues = []
        let responseTotalValues = []
        let row_ids = []
        let row_relation_ids = []
        let column_ids = []

        // Rows...
        if (Object.keys(params.rows).length) {
            let row_data = await allTables[req.table_slug].models.aggregate([
                { ...params.rows.match },
                { ...params.rows.group }
            ])

            for (let row of row_data) { row_ids.push(row._id) }

            const rowTableInfo = allTables[params.rows.row_table_slug]
            responseRow = await rowTableInfo.models.aggregate([
                { $match: { guid: { $in: row_ids } } },
                { $addFields: { table_slug: params.rows.row_table_slug + "_id" } },
                ...params.rows.lookups,
                { $project: { ...params.rows.project } },
                { $sort: { ...params.rows.sort } }
            ])
        } else if (Object.keys(params.rows_relation).length) {
            let inside_relation_table_exists = {}
            for (let inside_relation_table of params.rows_relation.inside_relation_tables) {
                const insideRelationTableInfo = allTables[inside_relation_table]
                insideRelationTableData = await insideRelationTableInfo.models.aggregate([{ ...params.rows_relation.match }, { $project: { _id: 1 } }])
                if (insideRelationTableData.length > 0) {
                    inside_relation_table_exists = { [inside_relation_table]: true, ...inside_relation_table_exists }
                }
            }
            responseRow.push(inside_relation_table_exists)
        } else if (Object.keys(params.rows_inside_relation).length) {
            // Rows-Relation...
            let inside_row_data = []
            if (params.rows_inside_relation.row_inside_relation_table_slug) {
                const insideRelationTableInfo = allTables[params.rows_inside_relation.row_inside_relation_table_slug]
                inside_row_data = await insideRelationTableInfo.models.aggregate([{ ...params.rows_inside_relation.inside_relation_match }])
            }

            for (let inside_row of inside_row_data) { row_relation_ids.push(inside_row[params.rows_inside_relation.row_relation_table_slug + "_id"]) }

            let rows_inside_relation_match_query = Object.assign({}, params.rows_inside_relation.match)

            if (row_relation_ids.length > 0) { rows_inside_relation_match_query.$match = { guid: { $in: row_relation_ids }, ...rows_inside_relation_match_query.$match } }

            const relationTableInfo = allTables[params.rows_inside_relation.row_relation_table_slug]
            responseRow = await relationTableInfo.models.aggregate([
                { ...rows_inside_relation_match_query },
                { $addFields: { table_slug: params.rows_inside_relation.row_relation_table_slug + "_id" } },
                ...params.rows_inside_relation.lookups,
                { $project: { ...params.rows_inside_relation.project } },
                { $sort: { ...params.rows_inside_relation.sort } }
            ])
        } else if (Object.keys(params.rows_relation_nested).length) {
            // Rows-Relation-Nested...
            const rowRelationTableInfo = allTables[params.rows_relation_nested.row_relation_table_slug]
            let rowRelationTableData = await rowRelationTableInfo.models.aggregate([{ ...params.rows_relation_nested.match_relation_table }])

            const rowInsideRelationTableInfo = allTables[params.rows_relation_nested.row_inside_relation_table_slug]
            let rowInsideRelationTableData = await rowInsideRelationTableInfo.models.aggregate([{ ...params.rows_relation_nested.match_inside_relation_table }])

            if (rowRelationTableData.length > 0) {
                let row_relation_ids = []
                for (let rowRelation of rowRelationTableData) { row_relation_ids.push(rowRelation[params.rows_relation_nested.row_relation_nested_table_slug + "_id"]) }

                const rowRelationNestedTableInfo = allTables[params.rows_relation_nested.row_relation_nested_table_slug]
                responseRow = await rowRelationNestedTableInfo.models.aggregate([
                    { $match: { guid: { $in: row_relation_ids } } },
                    { $addFields: { table_slug: params.rows_relation_nested.row_relation_nested_table_slug + "_id" } },
                    { $project: { ...params.rows_relation_nested.project } },
                    { $sort: { ...params.rows_relation_nested.sort } }
                ])
            } else if (rowInsideRelationTableData.length > 0) {
                let row_inside_relation_ids = []
                for (let rowInsideRelation of rowInsideRelationTableData) { row_inside_relation_ids.push(rowInsideRelation[params.rows_relation_nested.row_relation_nested_table_slug + "_id"]) }

                const rowRelationNestedTableInfo = allTables[params.rows_relation_nested.row_relation_nested_table_slug]
                responseRow = await rowRelationNestedTableInfo.models.aggregate([
                    { $match: { guid: { $in: row_inside_relation_ids } } },
                    { $addFields: { table_slug: params.rows_relation_nested.row_relation_nested_table_slug + "_id" } },
                    { $project: { ...params.rows_relation_nested.project } },
                    { $sort: { ...params.rows_relation_nested.sort } }
                ])
            }
        }

        // Columns...
        if (Object.keys(params.columns).length) {
            let column_data = await allTables[req.table_slug].models.aggregate([
                { ...params.columns.match },
                { ...params.columns.group }
            ])

            for (let column of column_data) { column_ids.push(column._id) }

            const columnTableInfo = allTables[params.columns.column_table_slug]
            responseColumn = await columnTableInfo.models.aggregate([
                { $match: { guid: { $in: column_ids } } },
                { $project: { ...params.columns.project } },
                { $sort: { ...params.columns.sort } }
            ])
        }

        // Values...
        if (Object.keys(params.values).length) {
            for (let [key, value] of Object.entries(params.values)) {

                let matchQuery = {}
                let dateFromStringQuery = {}
                let sortValuesQuery = { guid: 1 }
                if (value.match_date_field) {
                    dateFromStringQuery = { [value.match_date_field]: { $cond: [{ $or: [{ $eq: ["$" + value.match_date_field, ""] }, { $eq: ["$" + value.match_date_field, null] }] }, null, { $dateFromString: { dateString: "$" + value.match_date_field } }] } }
                    matchQuery = { [value.match_date_field]: { $gte: new Date(value.match_from_date), $lt: new Date(value.match_to_date), $ne: "", $exists: true } }
                    sortValuesQuery = { [value.match_date_field]: 1 }
                }

                if (Object.keys(params.rows).length) { matchQuery = { ...matchQuery, ...params.rows.match.$match } }
                if (Object.keys(params.rows_relation).length) { matchQuery = { ...matchQuery, ...params.rows_relation.match.$match } }
                if (Object.keys(params.rows_inside_relation).length) { matchQuery = { ...matchQuery, ...params.rows_inside_relation.match.$match } }

                if (value.match_row_guid) { matchQuery = { ...matchQuery, [value.match_row_guid]: { $in: row_ids } } }
                if (value.match_row_relation_guid) { matchQuery = { ...matchQuery, [value.match_row_relation_guid]: { $in: row_relation_ids } } }
                if (value.match_column_guid) { matchQuery = { ...matchQuery, [value.match_column_guid]: { $in: column_ids } } }

                const keyTableInfo = allTables[key]
                let vals = await keyTableInfo.models.aggregate([
                    { $addFields: { ...dateFromStringQuery } },
                    { $sort: { ...sortValuesQuery } },
                    { $match: { ...matchQuery } },
                    { ...value.group },
                    { $project: { _id: 0 } }
                ])

                let values = {}
                if (value.match_row_guid) {
                    for (let val of vals) {
                        let rowValues = values[val.row_id]
                        if (rowValues) { if (val.column_id) { rowValues = { ...rowValues, [val.column_id]: val } } else { rowValues = { ...rowValues, val } } }
                        else { if (val.column_id) { rowValues = { [val.column_id]: val } } else { rowValues = val } }
                        values = { ...values, [val.row_id]: rowValues }
                    }
                } else if (value.match_row_relation_guid) {
                    for (let val of vals) {
                        let rowRelationValues = values[val.row_relatoin_id]
                        if (rowRelationValues) { if (val.column_id) { rowRelationValues = { ...rowValues, [val.column_id]: val } } else { rowRelationValues = { ...rowRelationValues, val } } }
                        else { if (val.column_id) { rowRelationValues = { [val.column_id]: val } } else { rowRelationValues = val } }
                        values = { ...values, [val.row_relatoin_id]: rowRelationValues }
                    }
                } else if (Object.keys(params.rows_relation).length) {
                    if (Object.keys(params.columns).length) {
                        let relation_vals = {}
                        for (let val of vals) { relation_vals = { [val.column_id]: val, ...relation_vals } }
                        if (vals.length > 0) { values = relation_vals }
                    } else {
                        if (vals.length > 0) { values = vals[0] }
                    }
                } else if (value.match_column_guid) {
                    for (let val of vals) {
                        let columnValues = values[val.column_id]
                        if (columnValues) { columnValues = { ...columnValues, val } } else { columnValues = val }
                        values = { ...values, [val.column_id]: columnValues }
                    }
                } else { values = vals }

                responseValues.push({ [key]: values })
            }
        }

        // Total Values...
        if (Object.keys(params.total_values).length) {
            for (let [key, value] of Object.entries(params.total_values)) {

                let matchQuery = {}
                let dateFromStringQuery = {}
                let sortValuesQuery = { guid: 1 }
                if (value.match_date_field) {
                    dateFromStringQuery = { [value.match_date_field]: { $cond: [{ $or: [{ $eq: ["$" + value.match_date_field, ""] }, { $eq: ["$" + value.match_date_field, null] }] }, null, { $dateFromString: { dateString: "$" + value.match_date_field } }] } }
                    matchQuery = { [value.match_date_field]: { $gte: new Date(value.match_from_date), $lt: new Date(value.match_to_date), $ne: "", $exists: true } }
                    sortValuesQuery = { [value.match_date_field]: 1 }
                }

                if (Object.keys(params.rows).length) { matchQuery = { ...matchQuery, ...params.rows.match.$match } }
                if (Object.keys(params.rows_relation).length) { matchQuery = { ...matchQuery, ...params.rows_relation.match.$match } }
                if (Object.keys(params.rows_inside_relation).length) { matchQuery = { ...matchQuery, ...params.rows_inside_relation.match.$match } }

                if (value.match_row_guid) { matchQuery = { ...matchQuery, [value.match_row_guid]: { $in: row_ids } } }
                if (value.match_row_relation_guid) { matchQuery = { ...matchQuery, [value.match_row_relation_guid]: { $in: row_relation_ids } } }

                const keyTableInfo = allTables[key]
                let total_vals = await keyTableInfo.models.aggregate([
                    { $addFields: { ...dateFromStringQuery } },
                    { $match: { ...matchQuery } },
                    { ...value.group },
                    { $project: { _id: 0 } }
                ])

                let total_values = {}
                if (value.match_row_guid) {
                    for (let total_val of total_vals) {
                        let rowValues = total_values[total_val.row_id]
                        if (rowValues) {
                            rowValues = { ...rowValues, total_val }
                        }
                        else {
                            rowValues = total_val
                        }
                        total_values = { ...total_values, [total_val.row_id]: rowValues }
                    }
                } else if (value.match_row_relation_guid) {
                    for (let total_val of total_vals) {
                        let rowRelationValues = total_values[total_val.row_relatoin_id]
                        if (rowRelationValues) { rowRelationValues = { ...rowRelationValues, total_val } }
                        else { rowRelationValues = total_val }
                        total_values = { ...total_values, [total_val.row_relatoin_id]: rowRelationValues }
                    }
                } else if (Object.keys(params.rows_relation).length) {
                    if (total_vals.length > 0) { total_values = total_vals[0] }
                } else { total_values = total_vals }

                responseTotalValues.push({ [key]: total_values })
            }
        }

        response = struct.encode({ count: responseRow.length, rows: responseRow, columns: responseColumn, values: responseValues, total_values: responseTotalValues });
        return { table_slug: req.table_slug, data: response }
    }),
    getGroupByField: catchWrapDbObjectBuilder(`${NAMESPACE}.getGroupByField`, async (req) => {
        const startMemoryUsage = process.memoryUsage();
        const params = struct.decode(req.data)
        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

        let aggregationPipeline = [];

        if (params.match) {
            if (params.date_filter) {
                let dateFromStringQuery = { [params.date_filter.match_date_field]: { $cond: [{ $or: [{ $eq: ["$" + params.date_filter.match_date_field, ""] }, { $eq: ["$" + params.date_filter.match_date_field, null] }] }, null, { $dateFromString: { dateString: "$" + params.date_filter.match_date_field } }] } }
                let sortValuesQuery = { [params.date_filter.match_date_field]: 1 }
                params.match.$match = { ...params.match.$match, [params.date_filter.match_date_field]: { $gte: new Date(params.date_filter.from_date), $lt: new Date(params.date_filter.to_date), $ne: "", $exists: true } }
                aggregationPipeline.push({ $addFields: { ...dateFromStringQuery } }, { $sort: { ...sortValuesQuery } })
            }
            if (params.match["$match"]["updatedAt"] && params.match["$match"]["updatedAt"]["$gte"]) {
                const datetime = params.match["$match"]["updatedAt"]["$gte"]
                const date = new Date(datetime);
                params.match["$match"]["updatedAt"]["$gte"] = date
            }
            aggregationPipeline.push({ ...params.match },)
        }

        aggregationPipeline.push({ ...params.query })

        let countResult = await tableInfo.models.aggregate(aggregationPipeline);

        if (params.sort && Object.keys(params.sort).length > 0) { aggregationPipeline.push({ ...params.sort }); }
        if (params.offset) { aggregationPipeline.push({ $skip: params.offset }); }
        if (params.limit) { aggregationPipeline.push({ $limit: params.limit }); }

        aggregationPipeline.push(...(params.lookups || []))

        if (params.second_match) { aggregationPipeline.push({ $match: params.second_match }); }
        if (params.project && Object.keys(params.project).length > 0) { aggregationPipeline.push({ ...params.project }); }

        results = await tableInfo.models.aggregate(aggregationPipeline);
        response = struct.encode({ count: countResult.length, response: results, });

        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("getGroupByField-->Project->" + req.project_id)
            logger.info("Request->" + JSON.stringify(req))

            logger.info(`--> P-M Memory used by getGroupByField: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
            
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by getGroupByField: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
        }

        return { table_slug: req.table_slug, data: response }

    }),
    deleteMany: catchWrapDbObjectBuilder(`${NAMESPACE}.deleteMany`, async (req) => {
        try {
            const startMemoryUsage = process.memoryUsage();
            const mongoConn = await mongoPool.get(req.project_id)
            const data = struct.decode(req.data)
            const allTableInfo = (await ObjectBuilder(true, req.project_id))
            const tableModel = await tableVersion(mongoConn, { slug: req.table_slug, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, data.version_id, true)
            let response = []

            if (data.ids && data.ids.length) {
                response = await allTableInfo[req.table_slug].models.find({
                    guid: { $in: data.ids }
                })
            }else if (data.query){
                response = await allTableInfo[req.table_slug].models.find(data.query)
            }

            if (response && response.length) {
                if (tableModel.attributes && tableModel.attributes !== null && tableModel.is_login_table) {
                    let tableAttributes = struct.decode(tableModel.attributes)
                    if (tableAttributes && tableAttributes.auth_info) {
                        let readyForAuth = [];
                        for (const obj of response) {
                            if (tableModel && !data.from_auth_service) {

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
                                        user_id: obj['user_id_auth']
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
                }
                
                if (!tableModel.soft_delete) {
                    if (data.ids.length){
                        await allTableInfo[req.table_slug].models.deleteMany({ guid: { $in: data.ids } });
                    }else if (data.query){
                        await allTableInfo[req.table_slug].models.deleteMany(data.query)
                    }
                } else if (tableModel.soft_delete) {
                    if (data.ids.length){
                        await allTableInfo[req.table_slug].models.models.updateMany({ guid: { $in: data.ids } }, { $set: { deleted_at: new Date() } })
                    }else if(data.query){
                        await allTableInfo[req.table_slug].models.updateMany( data.query, { $set: { deleted_at: new Date() } })
                    }
                }
            }

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("deleteMany-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by deleteMany: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by deleteMany: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
            }

            return { table_slug: req.table_slug, data: {} };
        } catch (err) {
            throw err
        }
    }),
    groupByColumns: catchWrapDbObjectBuilder(`${NAMESPACE}.groupByColumns`, async (req) => {
        const mongoConn = await mongoPool.get(req.project_id)
        const View = mongoConn.models['View']
        const Relation = mongoConn.models['Relation']
        const params = struct.decode(req.data)
        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
        const view = await View.findOne({
            id: params.builder_service_view_id,
        })
        let order = params.order || {}
        const currentTable = await tableVersion(mongoConn, { slug: req.table_slug })

        if (currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: 1 }
        } else if (!currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: -1 }
        }
        if (!view) {
            throw new Error("View not found")
        }
        let groupColumnIds = []
        if (view.attributes && view.attributes.group_by_columns && view.attributes.group_by_columns.length) {

            groupColumnIds = view.attributes.group_by_columns
        }
        const fields = tableInfo?.fields || []
        const numberColumns = fields.filter(el => ((constants.NUMBER_TYPES.includes(el.type) || el.type.includes("FORMULA")) && !groupColumnIds.includes(el.id)))
        const groupColumns = fields.filter(el => groupColumnIds.includes(el.id))
        const projectColumns = fields.filter(el => (!groupColumnIds.includes(el.id) && !(constants.NUMBER_TYPES.includes(el.type) || el.type.includes("FORMULA"))))
        const sumFieldWithDollorSign = {}
        const numberfieldWithDollorSign = {}
        const projectColumnsWithDollorSign = {}
        numberColumns.forEach(el => {
            sumFieldWithDollorSign[el.slug] = { $sum: "$" + el.slug }
            numberfieldWithDollorSign[el.slug] = "$" + el.slug
        })
        projectColumns.forEach(el => {
            projectColumnsWithDollorSign[el.slug] = "$" + el.slug
        })
        const firstGroup = {}
        groupColumns.forEach(el => {
            firstGroup[el.slug] = "$" + el.slug
        })

        const relations = await Relation.find({
            $or: [
                {
                    table_from: req.table_slug,
                    type: 'Many2One'
                },
                {
                    table_from: req.table_slug,
                    type: 'Many2Dynamic'
                }
            ]
        })
        let lookups = [], unwinds = [], lookupFields = {}, lookupFieldsWithAccumulator = {}, lookupGroupField = {};
        for (const relation of relations) {
            if (relation.type === 'Many2One') {
                let table_to_slug = ""
                const field = fields?.find(val => (val.relation_id === relation?.id))
                if (field) {
                    table_to_slug = field.slug + "_data"
                }
                if (table_to_slug === "") {
                    continue
                }
                let from = pluralize.plural(relation.table_to)
                if (groupColumnIds.includes(field.id)) {
                    lookupGroupField[table_to_slug] = { $first: "$" + table_to_slug }
                } else {
                    lookupFields[table_to_slug] = "$" + table_to_slug
                    lookupFieldsWithAccumulator[table_to_slug] = { $first: "$" + table_to_slug }
                }
                lookups.push({
                    $lookup: {
                        from: from,
                        localField: field.slug,
                        foreignField: "guid",
                        as: table_to_slug
                    }
                })
                unwinds.push({
                    $unwind: {
                        path: '$' + table_to_slug,
                        preserveNullAndEmptyArrays: true
                    }
                })
            } else {
                for (dynamic_table of relation.dynamic_tables) {
                    let table_to_slug = relation.relation_field_slug + "." + dynamic_table.table_slug + "_id_data"
                    let from = pluralize.plural(dynamic_table.table_slug)
                    if (groupColumnIds.includes(relation.relation_field_slug + "." + dynamic_table.table_slug + "_id")) {
                        lookupGroupField[table_to_slug] = { $first: "$" + table_to_slug }
                    } else {
                        lookupFields[table_to_slug] = "$" + table_to_slug
                        lookupFieldsWithAccumulator[table_to_slug] = { $first: "$" + table_to_slug }
                    }
                    lookups.push({
                        $lookup: {
                            from: from,
                            localField: relation.relation_field_slug + "." + dynamic_table.table_slug + "_id",
                            foreignField: "guid",
                            as: table_to_slug
                        }
                    })
                    unwinds.push({
                        $unwind: {
                            path: '$' + table_to_slug,
                            preserveNullAndEmptyArrays: true
                        }
                    })
                }
            }
        }
        const copyPipeline = []
        let lastGroupField
        for (const id of groupColumnIds) {
            let field = fields.find(el => el.id === id)
            if (lastGroupField) {
                delete lookupFields[lastGroupField + "_data"]
                copyPipeline.push({
                    $group: {
                        _id: `$_id.${lastGroupField}`,
                        [lastGroupField]: { $first: `$_id.${lastGroupField}` },
                        [lastGroupField + "_data"]: { $first: "$" + lastGroupField + "_data" },
                        data: {
                            $push: {
                                [field.slug]: `$_id.${[field.slug]}`,
                                data: '$data',
                                ...numberfieldWithDollorSign,
                                "guid": "$guid",
                                ...lookupFields,
                                [field.slug + "_data"]: "$" + [field.slug + "_data"]
                            }
                        },
                        ...sumFieldWithDollorSign,
                    }
                }, {
                    $sort: order
                })
            } else {
                copyPipeline.push(
                    ...lookups,
                    ...unwinds,
                    {
                        $group: {
                            _id: firstGroup,
                            [field.slug]: { $first: `$${[field.slug]}` },
                            data: {
                                $push: {
                                    ...projectColumnsWithDollorSign,
                                    ...numberfieldWithDollorSign,
                                    "guid": "$guid",
                                    ...lookupFields,
                                }
                            },
                            ...sumFieldWithDollorSign,
                            ...lookupGroupField
                        }
                    }, {
                    $sort: order
                })
            }
            fs.writeFileSync('./a.json', JSON.stringify(copyPipeline))

            lastGroupField = field.slug
        }
        const response = await tableInfo.models.aggregate(copyPipeline)
        res = JSON.parse(JSON.stringify(response))
        const data = struct.encode({ response: res });
        return { table_slug: req.table_slug, data: data }
    }),
    groupByColumns: catchWrapDbObjectBuilder(`${NAMESPACE}.groupByColumns`, async (req) => {
        const startMemoryUsage = process.memoryUsage();

        const mongoConn = await mongoPool.get(req.project_id)
        const Relation = mongoConn.models['Relation']
        const params = struct.decode(req.data)
        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
        const view = await tableInfo?.views?.find(el => el.id === params.builder_service_view_id)
        let order = params.order || {}
        const currentTable = await tableVersion(mongoConn, { slug: req.table_slug })
        if (currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: 1 }
        } else if (!currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: -1 }
        }
        if (!view) {
            throw new Error("View not found")
        }

        let groupColumnIds = []
        if (view.attributes && view.attributes.group_by_columns && view.attributes.group_by_columns.length) {
            groupColumnIds = view.attributes.group_by_columns
        }

        const fields = tableInfo?.fields || []
        const fieldsMap = {}
        const numberColumns = fields.filter(el => ((constants.NUMBER_TYPES.includes(el.type) || el.type.includes("FORMULA")) && !groupColumnIds.includes(el.id)))
        const groupColumns = []
        fields.forEach(el => {
            if (el.type == "LOOKUP" && params.view_type == "TABLE") {
                fieldsMap[el.relation_id] = el
            } else {
                fieldsMap[el.id] = el
            }
        })
        groupColumnIds.forEach(columnId => {
            groupColumns.push(fieldsMap[columnId])
        })
        const projectColumns = fields.filter(el => (!groupColumnIds.includes(el.id) && !(constants.NUMBER_TYPES.includes(el.type) || el.type.includes("FORMULA"))))
        const sumFieldWithDollorSign = {}
        const numberfieldWithDollorSign = {}
        const projectColumnsWithDollorSign = {}
        const dynamicConfig = {
            groupByFields: [], 
        };
        numberColumns.forEach(el => { 
            sumFieldWithDollorSign[el.slug] = "$" + el.slug 
        })
        projectColumns.forEach(el => {
            projectColumnsWithDollorSign[el.slug] = "$" + el.slug
        })
        groupColumns.forEach(el => {
            dynamicConfig.groupByFields.push(el.slug)
        })

        const relations = await Relation.find({
            $or: [
                {
                    table_from: req.table_slug,
                    type: 'Many2One'
                }
            ]
        })

        let lookups = [], lookupFields = {}, lookupFieldsWithAccumulator = {}, lookupGroupField = {}, groupRelation, lookUpFor = [];
        for (const relation of relations) {
            let table_to_slug = ""
            const field = fields?.find(val => (val.relation_id === relation?.id))
            if (field) {
                table_to_slug = field.slug + "_data"
            }
            if (table_to_slug === "") {
                continue
            }
            let from = pluralize.plural(relation.table_to)
            if (groupColumnIds.includes(field.id)) {
                lookupGroupField[table_to_slug] = { $first: "$" + table_to_slug }
                if (groupColumnIds[0] == field.id) {
                    groupRelation = pluralize.plural(relation.table_to)
                }
                numberfieldWithDollorSign[table_to_slug] = "$" + table_to_slug
            } else {
                lookupFields[table_to_slug] = "$" + table_to_slug
                lookupFieldsWithAccumulator[table_to_slug] = { $first: "$" + table_to_slug }
            }

            if (groupColumnIds.includes(field.relation_id)) {
                lookupGroupField[table_to_slug] = { $first: "$" + table_to_slug }
                if (groupColumnIds[0] == field.relation_id) {
                    groupRelation = pluralize.plural(relation.table_to)
                }
                numberfieldWithDollorSign[table_to_slug] = "$" + table_to_slug
            }
            lookups.push({
                $lookup: {
                    from: from,
                    localField: field.slug,
                    foreignField: "guid",
                    as: table_to_slug
                }
            })
            lookUpFor.push({
                $lookup: {
                    from: from,
                    localField: "_id." + field.slug,
                    foreignField: "guid",
                    as: table_to_slug
                }
            })
        } 

        let typeOfLastLabel = "", groupBySlug = "", titleField = ""
        function createDynamicAggregationPipeline(groupFields = [], projectFields = [], i, lookupAddFields={}) {
            typeOfLastLabel = groupColumns.find(obj => obj.slug === groupFields[0]).type
            if (typeOfLastLabel === "LOOKUP") {
                groupBySlug = groupColumns.find(obj => obj.slug === groupFields[0]).table_slug
            }
            let projection = {}
            projectFields.forEach(el => {
                if (params.view_type == "TIMELINE") {
                    projection["label"] = "$_id." + el
                    projection[el] = "$_id." + el
                } else if (params.view_type == "TABLE") {
                    projection[el] = "$_id." + el
                }
                const matchingField = groupColumns.find(obj => obj.slug === el);
                if (matchingField.type == "LOOKUP") {
                    projection["group_by_slug"] = matchingField.table_slug
                }
                if (matchingField) {
                    projection["group_by_type"] = matchingField.type
                }
                projection["createdAt"] = {
                    "$arrayElemAt": ["$data.createdAt", 0]
                } 
            }); 
            
            let r = [...lookups]
        
            let groupBy = {}
            if (projectFields.length) {
                r = [...lookUpFor]
                let temp = {}
                Object.assign(projection, numberfieldWithDollorSign)
                groupFields.forEach(el => {
                    temp[el] = "$_id." + el
                });
                projection["data"] = '$data';
                if (Object.keys(temp).length === 1) {
                    groupBy["_id"] = temp[Object.keys(temp)[0]];
                } else {
                    groupBy["_id"] = temp;
                }
        
                groupBy["data"] = {
                    "$push": projection,
                };
            } else {
                let temp = {}
                groupFields.forEach(el => {
                    temp[el] = "$" + el;
                });
                if (Object.keys(temp).length === 1) {
                    groupBy["_id"] = temp[Object.keys(temp)[0]];
                } else {
                    groupBy["_id"] = temp;
                }

                if (params.view_type == "TIMELINE") {
                    groupBy["data"] = {
                        $push: {
                            "guid": "$guid",
                            "createdAt": "$createdAt",
                            [view.attributes.visible_field]: "$" + view.attributes.visible_field,
                            ...projectColumnsWithDollorSign,
                            ...numberfieldWithDollorSign,
                            ...lookupAddFields,
                            ...lookupGroupField,
                        }
                    };
                } else {
                    groupBy["data"] = {
                        $push: {
                            "guid": "$guid",
                            "createdAt": "$createdAt",
                            ...projectColumnsWithDollorSign,
                            ...numberfieldWithDollorSign,
                            ...lookupAddFields,
                            ...sumFieldWithDollorSign
                        }
                    };
                }
            }
            return r.concat({$group: groupBy})
        }

        let aggregationPipeline = []
        let lookupAddFields = {}
        for (const key in lookupFields) {
            if (lookupFields.hasOwnProperty(key)) {
                lookupAddFields[key] = { "$arrayElemAt": [lookupFields[key], 0] };
            }
        }

        let groupFieldsAgg = dynamicConfig.groupByFields.slice(0, dynamicConfig.groupByFields.length)
        for (let i = 0; i < dynamicConfig.groupByFields.length; i++) {
            groupFieldsAgg = dynamicConfig.groupByFields.slice(0, dynamicConfig.groupByFields.length - i)
            let projectFields = dynamicConfig.groupByFields.slice(groupFieldsAgg.length, groupFieldsAgg.length + 1)
            aggregationPipeline = aggregationPipeline.concat(createDynamicAggregationPipeline(groupFieldsAgg, projectFields, i, lookupAddFields))
        }

        let secTitleField = ""
        if (params.view_type == "TABLE") {
            titleField = groupFieldsAgg[0]
        } else {
            titleField = "label"
            secTitleField = groupFieldsAgg[0]
        }

        if (typeOfLastLabel == "LOOKUP" && secTitleField != "") {
            aggregationPipeline.push({
                $lookup: {
                    from: groupRelation,
                    localField: "_id",
                    foreignField: "guid",
                    as: secTitleField + "_data"
                }
            })  
        } else if (typeOfLastLabel == "LOOKUP") {
            aggregationPipeline.push({
                $lookup: {
                    from: groupRelation,
                    localField: "_id",
                    foreignField: "guid",
                    as: titleField + "_data"
                }
            })
        }

        if (params.view_type == "TABLE") {
            aggregationPipeline.push({
                '$addFields': {
                    [titleField]: '$_id',
                    'group_by_type': typeOfLastLabel,
                    'group_by_slug': groupBySlug,
                    'createdAt': {
                        "$arrayElemAt": [
                            "$data.createdAt", 0
                        ]
                    }
                },
            }, {"$sort": order})
        } else {
            aggregationPipeline.push({
                '$addFields': {
                    [titleField]: '$_id',
                    [secTitleField]: '$_id',
                    'group_by_type': typeOfLastLabel,
                    'group_by_slug': groupBySlug,
                    'createdAt': {
                        "$arrayElemAt": [
                            "$data.createdAt", 0
                        ]
                    }
                },
            }, {"$sort": order})
        }

        fs.writeFileSync('./a.json', JSON.stringify(aggregationPipeline))

        const response = await tableInfo.models.aggregate(aggregationPipeline)
        res = JSON.parse(JSON.stringify(response))
        const data = struct.encode({ response: res });

        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("groupByColumns-->Project->" + req.project_id)
            logger.info("Request->" + JSON.stringify(req))

            logger.info(`--> P-M Memory used by groupByColumns: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
            
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by groupByColumns: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
        }

        return { table_slug: req.table_slug, data: data }
    }),
    copyFromProject: catchWrapDbObjectBuilder(`${NAMESPACE}.copyFromProject`, async (req) => {
        let table_ids = []
        req.menus?.map(el => {
            if(el.type === "TABLE") {
                el.is_changed = true
                table_ids.push(el.table_id)
            }
        })
        let menu_ids = req.menus?.map(el => el.id)

        try {
            const allTablesTo = (await ObjectBuilder(true, req.project_id))[req.project_id]
            const allTablesFrom = (await ObjectBuilder(true, req.project_id))[req.from_project_id]

            // connection to database
            const mongoConnTo = await mongoPool.get(req.project_id)
            const mongoConnFrom = await mongoPool.get(req.from_project_id)

            // collections to db
            const T_TableModel = mongoConnTo.models['Table']
            const T_MenuModel = mongoConnTo.models['object_builder_service.menu']
            const T_TabModel = mongoConnTo.models['Tab']
            const T_SectionModel = mongoConnTo.models['Section']
            const T_LayoutModel = mongoConnTo.models['Layout']

            //collections from db
            const F_TableModel = mongoConnFrom.models['Table']
            const F_FieldModel = mongoConnFrom.models['Field']
            const F_RelationModel = mongoConnFrom.models["Relation"]
            const F_ViewModel = mongoConnFrom.models["View"]
            const F_TabModel = mongoConnFrom.models['Tab']
            const F_SectionModel = mongoConnFrom.models['Section']
            const F_LayoutModel = mongoConnFrom.models['Layout']

            // copy tables
            const tables_from = await F_TableModel.find({ id: { $in: table_ids } })
            let table_slugs = tables_from.map(el => el.slug)
            if (tables_from.length) {
                await TableStorage.CreateAll({tables: tables_from, project_id: req.project_id, table_ids, table_slugs})
            }

            // copy menus
            await MenuStorage.CopyMenus({project_id: req.project_id, menus: req.menus, menu_ids})

            // copy fields
            const fields_from = await F_FieldModel.find({table_id: { $in: table_ids }})
            if (tables_from.length) {
                await FieldStorage.CopyFields({project_id: req.project_id, fields: fields_from, table_ids})
            } 

            // copy relation and relation_views
            const relations_from = await F_RelationModel.find({$or: [{table_from: {$in: table_slugs}}, {field_from: {$in: table_slugs}}]})
            const relation_ids = relations_from.map(el => el.id)
            const relation_views_from = await F_ViewModel.find({relation_id: {$in: relation_ids}})
            await RelationStorage.CopyRelations({project_id: req.project_id, relations: relations_from, views: relation_views_from})


            // copy table views
            const views_from = await F_ViewModel.find({table_slug: {$in: table_slugs}})
            await objectBuilder.copyViews({project_id: req.project_id, views: views_from})


            // copy layouts
            const layouts_from = await F_LayoutModel.find({table_id: {$in: table_ids}})
            const layout_ids = layouts_from.map(el => el.id)
            await T_LayoutModel.deleteMany({table_id: {$in: table_ids}})
            await T_LayoutModel.insertMany(layouts_from)

            // copy tabs
            const tabs_from = await F_TabModel.find({layout_id: {$in: layout_ids}})
            const tab_ids = tabs_from.map(el => el.id)
            await T_TabModel.deleteMany({layout_id: {$in: layout_ids}})
            await T_TabModel.insertMany(tabs_from)

            // copy sections
            const sections_from = await F_SectionModel.find({tab_id: {$in: tab_ids}})
            await T_SectionModel.deleteMany({tab_id: {$in: tab_ids}})
            await T_SectionModel.insertMany(sections_from)

            await ObjectBuilder(true, req.project_id)

            await T_TableModel.updateMany({ id: { $in: table_ids } }, { $set: { is_changed: true } })

            return {}
        } catch (err) {
            throw err
        }

    }),
    copyViews: catchWrapDbObjectBuilder(`${NAMESPACE}.CopyViews`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const ViewModel = mongoConn.models['View']
            const AllTables = (await ObjectBuilder(true, data.project_id))
            const ViewPermissionModel = AllTables["view_permission"]
            const RoleModel = AllTables["role"]

            const roles = await RoleModel?.models.find().lean()

            let view_permission = [];
            let view_ids = []
            for (const view of data.views) {
                view_ids.push(view.id)
                for (const role of roles) {
                    view_permission.push({
                        guid: v4(),
                        view: true,
                        edit: true,
                        delete: true,
                        role_id: role.guid,
                        view_id: view.id
                    })
                }
            }

            await ViewModel.deleteMany({id: {$in: view_ids}})
            await ViewPermissionModel.models.deleteMany({view_id: {$in: view_ids}})

            await ViewModel.insertMany(data.views)
            await ViewPermissionModel.models.insertMany(view_permission)

            return data.views;
        } catch (err) {
            throw err
        }
    }),
    getListWithOutRelations: catchWrapDbObjectBuilder(`${NAMESPACE}.getListWithOutRelations`, async (req) => {
        const startMemoryUsage = process.memoryUsage();

        const mongoConn = await mongoPool.get(req.project_id)
        let params = struct.decode(req?.data)
        const limit = params.limit
        const offset = params.offset
        delete params["offset"]
        delete params["limit"]
        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }
        let keys = Object.keys(params)
        let order = params.order || {}

        const currentTable = await tableVersion(mongoConn, { slug: req.table_slug })

        if (currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: 1 }
        } else if (!currentTable.order_by && !Object.keys(order).length) {
            order = { createdAt: -1 }
        }
        for (const key of keys) {
            if ((key === req.table_slug + "_id" || key === req.table_slug + "_ids") && params[key] !== "" && !params["is_recursive"]) {
                params["guid"] = params[key]
            }
            if (Array.isArray(params[key])) {
                params[key] = { $in: params[key] }
            } else if (!key.includes('.') && typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                if (params[key]) {
                    if (params[key].includes("(")) {
                        params[key] = params[key].replaceAll("(", ("\\("))
                    }
                    if (params[key].includes(")")) {
                        params[key] = params[key].replaceAll(")", ("\\)"))
                    }
                }
                params[key] = RegExp(params[key], "i")
            }
        }
        if (limit !== 0) {
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
                }, { sort: order }
            ).skip(offset)
                .limit(limit)
                .lean();
        }

        let count = await tableInfo.models.count(params);
        if (result && result.length) {
            let prev = result.length
            count = count - (prev - result.length)
        }
        const response = struct.encode({
            count: count,
            response: result,
        });
        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("getListWithoutRelations-->Project->" + req.project_id)
            logger.info("Request->" + JSON.stringify(req))

            logger.info(`--> P-M Memory used by getListWithoutRelations: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
            
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by getListWithoutRelations: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
        }

        return { table_slug: req.table_slug, data: response }

    }),
    getListAggregation: catchWrapDbObjectBuilder(`${NAMESPACE}.getListAggregation`, async (req) => {
        const startMemoryUsage = process.memoryUsage();
        const data = struct.decode(req?.data)

        if(!data.pipelines) {
            throw new Error("In data must be array type field calls \"pipelines\"")
        }

        let pipeline = []
        if(!Array.isArray(data.pipelines)) {
            pipeline = JSON.parse(data.pipelines)
        } else {
            pipeline = data.pipelines
        }


        await updateISODateFunction.updateISODate(pipeline)

        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

        let result = await tableInfo.models.aggregate(pipeline)
        let resp = [...result]

        resp = struct.encode({data: JSON.parse(JSON.stringify(resp))})
        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("getListAggregation-->Project->" + req.project_id)
            logger.info("Request->" + JSON.stringify(req))

            logger.info(`--> P-M Memory used by getListAggregation: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
            
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by getListAggregation: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
        }
        return { table_slug: req.table_slug, data: resp }
    }),
    getListRelationTabInExcel: catchWrapDbObjectBuilder(`${NAMESPACE}.getListRelationTabInExcel`, async (req) => {
        try {
            const startMemoryUsage = process.memoryUsage();
            let data = struct.decode(req.data)
            let field_ids = data.field_ids
            delete req.data.field_ids
            const mongoConn = await mongoPool.get(req.project_id)
            const res = await objectBuilder.getList(req)
            const response = struct.decode(res.data)
            const result = response.response
            const decodedFields = response.fields
            const selectedFields = decodedFields.filter(obj => field_ids.includes(obj.id));
            excelArr = []
            for (const obj of result) {
                excelObj = {}
                for (const field of selectedFields) {
    
                    if (obj[field.slug]) {

                        if (field.label == '') {
                            field.label = field.attributes.label_uz
                        }

                        if (field.type === "MULTI_LINE") {
                            obj[field.slug] = obj[field.slug].replace(/<[^>]+>/g, '')
                        }

                        if (field.type === "DATE") {
                            toDate = new Date(obj[field.slug])
                            try {
                                obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy')
                            } catch (error) {
                            }
                        }

                        if (field.type === "DATE_TIME") {
                            toDate = new Date(obj[field.slug])
                            try {
                                obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy HH:mm')
                            } catch (error) {
                            }
                        }
                        if (field.type === "LOOKUP") {
                            let overall = ""
                            if (typeof field.view_fields === "object" && field.view_fields.length) {
                                for (const view of field.view_fields) {
                                    if (obj[field.slug + "_data"] && obj[field.slug + "_data"][view.slug]) {
                                        overall += obj[field.slug + "_data"][view.slug]
                                    }
                                }
                            }
                            obj[field.slug] = overall

                        }
                        if (field.type === "MULTISELECT") {
                            let options = []
                            let multiselectValue = "";
                            if (field.attributes) {
                                options = field.attributes.options
                            }
                            if (obj[field.slug].length && options.length && Array.isArray(obj[field.slug])) {
                                obj[field.slug].forEach(element => {
                                    let getLabelOfMultiSelect = options.find(val => (val.value === element))
                                    if (getLabelOfMultiSelect) {
                                        if (getLabelOfMultiSelect.label) {
                                            multiselectValue += getLabelOfMultiSelect.label + ","
                                        } else {
                                            multiselectValue += getLabelOfMultiSelect.value + ","
                                        }
                                    }
                                })
                            }
                            if (multiselectValue.length) {
                                multiselectValue = multiselectValue.slice(0, multiselectValue.length - 1)
                            }
                            obj[field.slug] = multiselectValue
                        }   
                        excelObj[field.label] = obj[field.slug]
                    } else {
                        excelObj[field.label] = ""
                    }
                }
                excelArr.push(excelObj)
            }
            const workSheet = XLSX.utils.json_to_sheet(excelArr);
            const workBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
            let filename = "report_" + Math.floor(Date.now() / 1000) + ".xlsx"
            XLSX.writeFile(workBook, "./" + filename);

            let ssl = true
            if ((typeof cfg.minioSSL === "boolean" && !cfg.minioSSL) || (typeof cfg.minioSSL === "string" && cfg.minioSSL !== "true")) {
                ssl = false
            }


            let filepath = "./" + filename
            var minioClient = new Minio.Client({
                endPoint: cfg.minioEndpoint,
                useSSL: ssl,
                accessKey: cfg.minioAccessKeyID,
                secretKey: cfg.minioSecretAccessKey
            });

            var metaData = {
                'Content-Type': "application/octet-stream",
                'Content-Language': 123,
                'X-Amz-Meta-Testing': 1234,
                'example': 5678
            }


            minioClient.fPutObject("reports", filename, filepath, metaData, function (error, etag) {
                if (error) {
                    return logger.error(error);
                }
                fs.unlink(filename, (err => {
                    if (err) logger.error(err);
                    else {
                    }
                }));
            });

            const respExcel = struct.encode({
                link: cfg.minioEndpoint + "/reports/" + filename,
            });
            const tableWithVersion = await tableVersion(mongoConn, { slug: req.table_slug })
            let customMessage = ""
            if (tableWithVersion) {
                const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                    code: 200,
                    table_id: tableWithVersion.id,
                    action_type: "GET_LIST_IN_EXCEL"
                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }
            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getListRelationTabInExcel-->Project->" + req.project_id)
                logger.info("Request->" + JSON.stringify(req))

                logger.info(`--> P-M Memory used by getListRelationTabInExcel: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getListRelationTabInExcel: ${memoryUsed.toFixed(2)} MB Project-> ${req.project_id}`);
            }
            return { table_slug: req.table_slug, data: respExcel, custom_message: customMessage }
        } catch (err) {
            throw err
        }
    }),
}

module.exports = objectBuilder;