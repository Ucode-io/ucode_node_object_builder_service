const XLSX = require('xlsx');
const fs = require('fs');
const Minio = require('minio');
const { struct } = require('pb-util');

const cfg = require("../../config/index");
const logger = require("../../config/logger");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
const { v4 } = require("uuid");
const con = require("../../helper/constants");
// const sendMessageToTopic = require("../../config/kafka");
// const conkafkaTopic = require("../../config/kafkaTopics");
const converter = require("../../helper/converter");
const tableVersion = require('../../helper/table_version')
var fns_format = require('date-fns/format');
var { addMonths, addDays, addYears } = require('date-fns');
const AddPermission = require("../../helper/addPermission");

const RangeDate = require("../../helper/rangeDate");
const generators = require("../../helper/generator")
const ObjectBuilder = require("../../models/object_builder");
const FormulaFunction = require("../../helper/calculateFormulaFields");

const { exists } = require("../../models/table");


const mongoPool = require('../../pkg/pool');
const PrepareFunction = require('../../helper/prepareFunctions');
const prepareFunction = require('../../helper/prepareFunctions');


let NAMESPACE = "storage.object_builder";

let objectBuilder = {
    create: catchWrapDbObjectBuilder(`${NAMESPACE}.create`, async (req) => {
        //if you will be change this function, you need to change multipleInsert function
        try {
            const mongoConn = await mongoPool.get(req.project_id)

            let { payload, data, event, appendMany2ManyObjects } = await PrepareFunction.prepareToCreateInObjectBuilder(req, mongoConn)
            await payload.save();

            for (const appendMany2Many of appendMany2ManyObjects) {
                await objectBuilder.appendManyToMany(appendMany2Many)
            }
            const object = struct.encode({ data });
            const table = await tableVersion(mongoConn, { slug: req.table_slug })
            let customMessage = ""
            if (table) {
                const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                    code: 201,
                    table_id: table.id,
                    action_type: "CREATE"

                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }
            return { table_slug: req.table_slug, data: object, custom_message: customMessage };

        } catch (err) {
            throw err
        }
    }),
    update: catchWrapDbObjectBuilder(`${NAMESPACE}.update`, async (req) => {
        //if you will be change this function, you need to change multipleUpdateV2 function
        try {
            const mongoConn = await mongoPool.get(req.project_id)

            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

            let { data, event, appendMany2Many, deleteMany2Many } = await PrepareFunction.prepareToUpdateInObjectBuilder(req, mongoConn)
            const response = await tableInfo.models.findOneAndUpdate({ guid: data.id }, { $set: data }, { new: true });
            for (const resAppendM2M of appendMany2Many) {
                await objectBuilder.appendManyToMany(resAppendM2M)
            }
            for (const resDeleteM2M of deleteMany2Many) {
                await objectBuilder.deleteManyToMany(resDeleteM2M)
            }
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
        // Prepare Stage
        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const data = struct.decode(req.data)
        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
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
        let isChanged = false
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
                    const relationFieldTable = await tableVersion(mongoConn, { slug: attributes.table_from.split('#')[0], deleted_at: "1970-01-01T18:00:00.000+00:00" }, data.version_id, true)
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
                        if (output[field.slug] !== resultFormula[0].res) {
                            isChanged = true
                        }
                        output[field.slug] = resultFormula[0].res
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

        for (const relation of relatedTable) {
            if (relation in output) {
                nameWithDollarSign = "$" + relation
                output[nameWithDollarSign] = output[relation] // on object create new key name. Assign old value to this
                delete output[relation]
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
        const mongoConn = await mongoPool.get(req.project_id)
        const table = mongoConn.models['Table']
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const params = struct.decode(req?.data)
        const limit = params.limit
        const offset = params.offset
        delete params["client_type_id_from_token"]
        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }

        let keys = Object.keys(params)
        let order = params.order
        let fields = tableInfo.fields
        let with_relations = params.with_relations
        const permissionTable = (await ObjectBuilder(true, req.project_id))["record_permission"]

        // const permission = await permissionTable.models.findOne({
        //     $and: [
        //         {
        //             role_id: params["role_id_from_token"]
        //         },
        //         {
        //             table_slug: req.table_slug
        //         }
        //     ]
        // })
        // if (permission?.is_have_condition) {
        //     const automaticFilterTable = (await ObjectBuilder(true, req.project_id))["automatic_filter"]
        //     const automatic_filters = await automaticFilterTable.models.find({
        //         $and: [
        //             {
        //                 role_id: params["role_id_from_token"]
        //             },
        //             {
        //                 table_slug: req.table_slug
        //             }
        //         ]

        //     })
        //     if (automatic_filters.length) {
        //         for (const autoFilter of automatic_filters) {
        //             if (autoFilter.custom_field === "user_id") {
        //                 if (autoFilter.object_field !== req.table_slug) {
        //                     params[autoFilter.object_field + "_id"] = params["user_id_from_token"]
        //                     params[autoFilter.object_field + "ids"] = { $in: params["user_id_from_token"] }
        //                 } else {
        //                     params["guid"] = params["user_id_from_token"]
        //                 }
        //             } else {
        //                 let connectionTableSlug = autoFilter.custom_field.slice(0, autoFilter.custom_field.length - 3)
        //                 let objFromAuth = params.tables.find(obj => obj.table_slug === connectionTableSlug)
        //                 if (objFromAuth) {
        //                     if (connectionTableSlug !== req.table_slug) {
        //                         params[autoFilter.custom_field] = objFromAuth.object_id
        //                         params[autoFilter.custom_field + "s"] = { $in: params["user_id_from_token"] }
        //                     } else {
        //                         params["guid"] = objFromAuth.object_id
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

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
        let relationsFields = []
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
            for (const relation of relations) {
                if (relation.type !== "Many2Dynamic") {
                    if (relation.type === "Many2Many" && relation.table_to === req.table_slug) {
                        relation.table_to = relation.table_from
                    }
                    let relationTable = await table.findOne({ slug: relation.table_to })
                    let relationFields = await Field.find(
                        {
                            table_id: relationTable?.id
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
                        if (field.type == "LOOKUP" || field.type == "LOOKUPS") {
                            let viewFields = []
                            let table_slug
                            if (field.type === "LOOKUP") {
                                table_slug = field.slug.slice(0, -3)
                            } else {
                                table_slug = field.slug.slice(0, -4)
                            }
                            childRelation = await Relation.findOne({ table_from: relationTable.slug, table_to: table_slug })
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
                                    if (viewField) {
                                        if (viewField.attributes) {
                                            viewField.attributes = struct.decode(viewField.attributes)
                                        }
                                        viewFields.push(viewField._doc)
                                    }
                                }
                            }
                            field._doc.view_fields = viewFields
                            let childRelationTable = await table.findOne({ slug: table_slug })
                            field._doc.table_label = relationTable?.label
                            field.label = childRelationTable?.label
                            changedField = field
                            changedField._doc.path_slug = relationTable?.slug + "_id_data" + "." + field.slug
                            changedField._doc.table_slug = table_slug
                            relationsFields.push(changedField._doc)
                        } else {
                            if (field.attributes) {
                                field.attributes = struct.decode(field.attributes)
                            }
                            field._doc.table_label = relationTable?.label
                            changedField = field
                            changedField._doc.path_slug = relationTable?.slug + "_id_data" + "." + field.slug
                            relationsFields.push(changedField._doc)
                        }
                    }

                }

            }
        }

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

        if (params.phone_number) {
            let temp = params.phone_number.toString()
            let tempPhone = temp.substring(5, temp.length - 2)
            let phone = `\(` + temp.substring(2, 4) + `\)` + tempPhone
            params.phone_number = phone
        } else if (params.phone) {
            let temp = params.phone.toString()
            let tempPhone = temp.substring(5, temp.length - 2)
            let phone = `\(` + temp.substring(2, 4) + `\)` + tempPhone
            params.phone = phone
        }
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
                            // console.log("it's dynamic relations");
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

        // let formulaFields = tableInfo.fields.filter(val => (val.type === "FORMULA" || val.type === "FORMULA_FRONTEND"))
        // for (const res of result) {
        //     for (const field of formulaFields) {
        //         let attributes = struct.decode(field.attributes)
        //         if (field.type === "FORMULA") {
        //             if (attributes.table_from && attributes.sum_field) {
        //                 let filters = {}
        //                 if (attributes.formula_filters) {
        //                     attributes.formula_filters.forEach(el => {
        //                         filters[el.key.split("#")[0]] = el.value
        //                         if (Array.isArray(el.value)) {
        //                             filters[el.key.split("#")[0]] = { $in: el.value }
        //                         }
        //                     })
        //                 }
        //                 const relationFieldTable = await table.findOne({
        //                     slug: attributes.table_from.split('#')[0],
        //                     deleted_at: "1970-01-01T18:00:00.000+00:00"
        //                 })
        //                 const relationField = await Field.findOne({
        //                     relation_id: attributes.table_from.split('#')[1],
        //                     table_id: relationFieldTable.id
        //                 })
        //                 if (!relationField || !relationFieldTable) {
        //                     res[field.slug] = 0
        //                     continue
        //                 }
        //                 const dynamicRelation = await Relation.findOne({id: attributes.table_from.split('#')[1]})
        //                 let matchField = relationField ? relationField.slug : req.table_slug + "_id"
        //                 if (dynamicRelation && dynamicRelation.type === "Many2Dynamic") {
        //                     matchField = dynamicRelation.field_from + `.${req.table_slug}` + "_id"
        //                 }
        //                 let matchParams = {
        //                     [matchField]: { '$eq': res.guid },
        //                     ...filters
        //                 }
        //                 const resultFormula = await FormulaFunction.calculateFormulaBackend(attributes, matchField, matchParams, req.project_id)
        //                 if (resultFormula.length) {
        //                     res[field.slug] = resultFormula[0].res
        //                 } else {
        //                     res[field.slug] = 0
        //                 }
        //             }
        //         } else {
        //             if (attributes && attributes.formula) {
        //                 const resultFormula = await FormulaFunction.calculateFormulaFrontend(attributes, tableInfo.fields, res)
        //                 res[field.slug] = resultFormula
        //             }
        //         }
        //     }
        // }
        const tableWithVersion = await tableVersion(mongoConn, { slug: req.table_slug })
        let customMessage = ""
        if (tableWithVersion) {
            const customErrMsg = await mongoConn?.models["CustomErrorMessage"]?.findOne({
                code: 200,
                table_id: tableWithVersion.id,
                action_type: "GET_SINGLE_SLIM"
            })
            if (customErrMsg) { customMessage = customErrMsg.message }
        }

        const response = struct.encode({
            count: count,
            response: result,
        });
        const tableResp = await table.findOne({ slug: req.table_slug }) || { is_cached: false }
        return { table_slug: req.table_slug, data: response, is_cached: tableResp.is_cached, custom_message: customMessage }

    }),
    getList: catchWrapDbObjectBuilder(`${NAMESPACE}.getList`, async (req) => {
        const mongoConn = await mongoPool.get(req.project_id)
        // console.log("test prod obj builder");

        const table = mongoConn.models['Table']
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']

        let params = struct.decode(req?.data)

        const limit = params.limit
        const offset = params.offset
        let clientTypeId = params["client_type_id_from_token"]
        delete params["client_type_id_from_token"]
        const allTables = (await ObjectBuilder(true, req.project_id))
        const viewPermission = allTables["view_permission"]
        const tableInfo = allTables[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }
        let keys = Object.keys(params)
        let order = params.order || {}

        let fields = tableInfo.fields
        let with_relations = params.with_relations

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
        // console.log("TEST::::::::::4")
        // console.time("TIME_LOGGING:::is_have_condition")
        // console.log(">>>>>>>>>>>>>>>>>>>> Permisions", permission)
        if (permission?.is_have_condition) {
            const automaticFilterTable = allTables["automatic_filter"]
            const automatic_filters = await automaticFilterTable.models.find({
                $and: [
                    {
                        role_id: params["role_id_from_token"]
                    },
                    {
                        table_slug: req.table_slug
                    }
                ]

            })
            // console.log("TEST::::::::::5")
            // console.log(":::::::::::::::::::::::; LENGTH", automatic_filters.length)
            if (automatic_filters.length) {
                for (const autoFilter of automatic_filters) {
                    if (autoFilter.custom_field === "user_id") {
                        if (autoFilter.object_field !== req.table_slug) {
                            params[autoFilter.object_field + "_id"] = params["user_id_from_token"]
                            params[autoFilter.object_field + "ids"] = { $in: params["user_id_from_token"] }
                        } else {
                            // console.log("\n\n>>>>> inside else")
                            // params["guid"] = params["user_id_from_token"]
                        }
                    } else {
                        let connectionTableSlug = autoFilter.custom_field.slice(0, autoFilter.custom_field.length - 3)
                        let objFromAuth = params.tables.find(obj => obj.table_slug === connectionTableSlug)
                        if (objFromAuth) {
                            if (connectionTableSlug !== req.table_slug) {
                                params[autoFilter.custom_field] = objFromAuth.object_id
                                params[autoFilter.custom_field + "s"] = { $in: params["user_id_from_token"] }
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
        // console.log("TEST::::::::::6")
        // console.timeEnd("TIME_LOGGING:::is_have_condition")
        // console.time("TIME_LOGGING:::view_fields")
        // console.log(":::::::::::: TEST 11")
        if (params.view_fields && params.search) {
            if (params.view_fields.length && params.search !== "") {
                let replacedSearch = ""
                let empty = ""
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
                let arrayOfViewFields = [];
                for (const view_field of params.view_fields) {
                    let field = fields.find(val => (val.slug === view_field))
                    if (field.type !== "NUMBER" && field.type !== "SWITCH") {
                        let obj = {};
                        obj[view_field] = { $regex: new RegExp(params.search.toString(), "i") }
                        arrayOfViewFields.push(obj)
                    }
                }
                if (arrayOfViewFields.length) {
                    params["$or"] = arrayOfViewFields
                }
            }
        }
        // console.timeEnd("TIME_LOGGING:::view_fields")
        // console.time("TIME_LOGGING:::client_type_id")
        if (clientTypeId) {
            // console.log("\n\n>>>> client type ", clientTypeId);
            const clientTypeTable = allTables["client_type"]
            const clientType = await clientTypeTable?.models.findOne({
                guid: clientTypeId
            })
            if (clientType?.name === "DOCTOR" && req.table_slug === "doctors") {
                // console.log(">>>>>>>>>>. indside if");
                params["guid"] = params["user_id_from_token"]
            }
        }
        // console.log("TEST::::::::::7")
        // console.timeEnd("TIME_LOGGING:::client_type_id")
        // console.log("TEST::::::3")
        let views = tableInfo.views;
        // console.time("TIME_LOGGING:::app_id")
        for (let view of views) {
            const permission = await viewPermission.models.findOne({
                view_id: view.id,
                role_id: params.role_id_from_token
            }).lean() || {}
            view.attributes ? view.attributes.view_permission = permission : view.attributes = { view_permission: permission }
        }
        // console.timeEnd("TIME_LOGGING:::app_id")
        // add regExp to params for filtering
        // console.time("TIME_LOGGING:::key_of_keys")
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
        // console.log("TEST::::::::::8")
        // console.timeEnd("TIME_LOGGING:::key_of_keys")
        // console.log("TEST::::::4")
        // console.time("TIME_LOGGING:::relation")
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
        // console.log("TEST::::::::::9")
        // console.log("TEST::::::5")
        let relationsFields = []
        // console.time("TIME_LOGGING:::with_relations")
        if (with_relations) {
            for (const relation of relations) {
                if (relation.type !== "Many2Dynamic") {
                    if (relation.type === "Many2Many" && relation.table_to === req.table_slug) {
                        relation.table_to = relation.table_from
                    }
                    // let relationTable = await table.findOne({ slug: relation.table_to })
                    let relationTable = await tableVersion(mongoConn, { slug: relation.table_to }, params.version_id, true)
                    let relationFields = await Field.find(
                        {
                            table_id: relationTable?.id
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
                        if (field.type == "LOOKUP" || field.type == "LOOKUPS") {
                            let viewFields = []
                            let table_slug
                            if (field.type === "LOOKUP") {
                                table_slug = field.slug.slice(0, -3)
                            } else {
                                table_slug = field.slug.slice(0, -4)
                            }

                            childRelation = await Relation.findOne({ table_from: relationTable.slug, table_to: table_slug })
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
                                    if (viewField) {
                                        if (viewField.attributes) {
                                            viewField.attributes = struct.decode(viewField.attributes)
                                        }
                                        viewFields.push(viewField._doc)
                                    }
                                }
                            }
                            field._doc.view_fields = viewFields
                            // let childRelationTable = await table.findOne({ slug: table_slug })
                            let childRelationTable = await tableVersion(mongoConn, { slug: table_slug }, params.version_id, true)
                            field._doc.table_label = relationTable?.label
                            field.label = childRelationTable?.label
                            changedField = field
                            changedField._doc.path_slug = relationTable?.slug + "_id_data" + "." + field.slug
                            changedField._doc.table_slug = table_slug
                            relationsFields.push(changedField._doc)
                        } else {
                            if (field.attributes) {
                                field.attributes = struct.decode(field.attributes)
                            }
                            field._doc.table_label = relationTable?.label
                            changedField = field
                            changedField._doc.path_slug = relationTable?.slug + "_id_data" + "." + field.slug
                            relationsFields.push(changedField._doc)
                        }
                    }

                }

            }
        }
        // console.timeEnd("TIME_LOGGING:::with_relations")
        // console.log("TEST::::::6")
        // console.log("TEST::::::::::10")

        let result = [], count;
        let searchByField = []
        // console.time("TIME_LOGGING:::search")
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
                        __v: 0
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
                // console.log("TEST::::::8")
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
                            // console.log("it's dynamic relations");
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
                    // console.log("TEST::::::9")
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
                // console.log("\n\n-----> T3\n\n", tableInfo, params)
                // console.log("::::::::::::::::::: POPULATE ARR", populateArr)
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

                // console.log("\n\n-----> T4\n\n", tableParams)
                result = result.filter(obj => Object.keys(tableParams).every(key => obj[key]))
            }
        }
        // console.log("TEST::::::::::12")
        // console.timeEnd("TIME_LOGGING:::limit")
        // console.log("TEST::::::10")
        count = await tableInfo.models.count(params);
        // console.time("TIME_LOGGING:::result")
        if (result && result.length) {
            let prev = result.length
            count = count - (prev - result.length)
        }
        // console.timeEnd("TIME_LOGGING:::result")
        // console.log("TEST::::::::::13")
        // console.log("TEST::::::11")
        // console.time("TIME_LOGGING:::toField")
        // this function add field permission for each field by role id
        let fieldsWithPermissions = await AddPermission.toField(fields, params.role_id_from_token, req.table_slug, req.project_id)
        let decodedFields = []
        // below for loop is in order to decode FIELD.ATTRIBUTES from proto struct to normal object
        for (const element of fieldsWithPermissions) {
            if (element.attributes && !(element.type === "LOOKUP" || element.type === "LOOKUPS")) {
                let field = { ...element }
                field.attributes = struct.decode(element.attributes)
                decodedFields.push(field)
            } else {
                let elementField = { ...element }
                if (element.attributes) {
                    elementField.attributes = struct.decode(element.attributes)
                }
                decodedFields.push(elementField)
            }
        };
        // console.timeEnd("TIME_LOGGING:::toField")
        // console.log("TEST::::::12")
        // console.time("TIME_LOGGING:::decodedFields")
        for (const field of decodedFields) {
            if (field.type === "LOOKUP" || field.type === "LOOKUPS") {
                let relation = await Relation.findOne({ table_from: req.table_slug, table_to: field.table_slug })
                let viewFields = []
                if (relation) {
                    for (const view_field of relation.view_fields) {
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
                        if (viewField) {
                            if (viewField.attributes) {
                                viewField.attributes = struct.decode(viewField.attributes)
                            }
                            viewFields.push(viewField._doc)
                        }
                    }
                }
                field.view_fields = viewFields
            }
        }
        // console.log("TEST::::::::::14")
        // console.timeEnd("TIME_LOGGING:::decodedFields")
        // console.log("TEST::::::13")
        // console.time("TIME_LOGGING:::additional_request")
        if (params.additional_request && params.additional_request.additional_values?.length && params.additional_request.additional_field) {
            let additional_results;
            const additional_param = {};
            additional_param[params.additional_request.additional_field] = { $in: params.additional_request.additional_values }

            if (relations.length == 0) {
                // console.log("test 111/:::");
                additional_results = await tableInfo.models.find({
                    ...additional_param
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
                    .lean();
            } else {
                for (const key of Object.keys(params)) {
                    if (key.includes('.')) {
                        tableParams[key.split('.')[0]] = {
                            [key.split('.')[1]]: { $regex: params[key] },
                            select: '-_id'
                        }
                    }
                }
                additional_results = await tableInfo.models.find({
                    ...additional_param
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
                    .populate(populateArr)
                    .lean()
                additional_results = additional_results.filter(obj => Object.keys(tableParams).every(key => obj[key]))
            }
            let result_ids = []
            result.forEach(el => result_ids.push(el.guid))
            additional_results = additional_results.filter(obj => !result_ids.includes(obj.guid))
            result = result.concat(additional_results)
        }
        // console.log("TEST::::::::::15")
        // console.timeEnd("TIME_LOGGING:::additional_request")
        // console.log("TEST::::::14")
        let updatedObjects = []
        let formulaFields = tableInfo.fields.filter(val => (val.type === "FORMULA" || val.type === "FORMULA_FRONTEND"))
        // console.time("TIME_LOGGING:::res_of_result")
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
                        // const relationFieldTable = await table.findOne({
                        //     slug: attributes.table_from.split('#')[0],
                        //     deleted_at: "1970-01-01T18:00:00.000+00:00"
                        // })
                        const relationFieldTable = await tableVersion(mongoConn, { slug: attributes.table_from.split('#')[0], deleted_at: "1970-01-01T18:00:00.000+00:00" }, params.version_id, true)
                        const relationField = await Field.findOne({
                            relation_id: attributes.table_from.split('#')[1],
                            table_id: relationFieldTable.id
                        })
                        // console.log("rel table::", relationFieldTable)
                        // console.log("field:::", relationField);
                        if (!relationField || !relationFieldTable) {
                            // console.log("relation field not found")
                            res[field.slug] = 0
                            continue
                        }
                        const dynamicRelation = await Relation.findOne({ id: attributes.table_from.split('#')[1] })
                        let matchField = relationField ? relationField.slug : req.table_slug + "_id"
                        if (dynamicRelation && dynamicRelation.type === "Many2Dynamic") {
                            matchField = dynamicRelation.field_from + `.${req.table_slug}` + "_id"
                        }
                        let matchParams = {
                            [matchField]: { '$eq': res.guid },
                            ...filters
                        }
                        const resultFormula = await FormulaFunction.calculateFormulaBackend(attributes, matchField, matchParams, req.project_id)
                        if (resultFormula.length) {
                            if (res[field.slug] !== resultFormula[0].res) {
                                isChanged = true
                            }
                            res[field.slug] = resultFormula[0].res
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
        // console.log("TEST::::::::::16")


        // console.time("TIME_LOGGING:::length")
        if (updatedObjects.length) {
            await objectBuilder.multipleUpdateV2({
                table_slug: req.table_slug,
                project_id: req.project_id,
                data: struct.encode({ objects: updatedObjects })
            })
        }
        // console.timeEnd("TIME_LOGGING:::length")
        // console.log("TEST::::::15")
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

        const tableResp = await table.findOne({ slug: req.table_slug }) || { is_cached: false }
        // console.log(">>>>>>>>>>>>>>>>> RESPONSE", result, relationsFields)
        return { table_slug: req.table_slug, data: response, is_cached: tableResp.is_cached, custom_message: customMessage }
    }),
    getSingleSlim: catchWrapDbObjectBuilder(`${NAMESPACE}.getSingleSlim`, async (req) => {
        // Prepare Stage
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
                        output[field.slug] = resultFormula[0].res
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
            const mongoConn = await mongoPool.get(req.project_id)
            const data = struct.decode(req.data)
            const allTables = await ObjectBuilder(true, req.project_id)

            const tableInfo = allTables[req.table_slug]
            const tableModel = await tableVersion(mongoConn, { slug: req.table_slug, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, data.version_id, true)

            if (!tableModel.soft_delete) {
                const response = await tableInfo.models.deleteOne({ guid: data.id });
                return { table_slug: req.table_slug, data: response };
            } else if (tableModel.soft_delete) {
                const response = await tableInfo.models.findOneAndUpdate({ guid: data.id }, { $set: { deleted_at: new Date() } })
                return { table_slug: req.table_slug, data: response };
            }

        } catch (err) {
            throw err
        }
    }),
    getListInExcel: catchWrapDbObjectBuilder(`${NAMESPACE}.getListInExcel`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const res = await objectBuilder.getList(req)
            const response = struct.decode(res.data)
            const result = response.response
            const decodedFields = response.fields
            // console.log("Ress::", result);
            excelArr = []
            for (const obj of result) {
                excelObj = {}
                for (const field of decodedFields) {
                    // if (field.type === "FORMULA") {
                    //     let attributes = field.attributes

                    //     if (attributes.table_from && attributes.sum_field) {
                    //         let groupBy = req.table_slug + '_id'
                    //         let groupByWithDollorSign = '$' + req.table_slug + '_id'
                    //         let sumFieldWithDollowSign = '$' + attributes["sum_field"]
                    //         let aggregateFunction = '$sum';
                    //         switch (attributes.type) {
                    //             case 'SUMM':
                    //                 aggregateFunction = '$sum'
                    //                 break;
                    //             case 'AVG':
                    //                 aggregateFunction = '$avg'
                    //                 break;
                    //             case 'MAX':
                    //                 aggregateFunction = '$max'
                    //                 break;
                    //         }
                    //         const pipelines = [
                    //             {
                    //                 '$match': {
                    //                     [groupBy]: {
                    //                         '$eq': obj.guid
                    //                     }
                    //                 }
                    //             }, {
                    //                 '$group': {
                    //                     '_id': groupByWithDollorSign,
                    //                     'res': {
                    //                         [aggregateFunction]: sumFieldWithDollowSign
                    //                     }
                    //                 }
                    //             }
                    //         ];

                    //         const resultFormula = await allTables[attributes.table_from].models.aggregate(pipelines)

                    //         if (resultFormula.length) {
                    //             obj[field.slug] = resultFormula[0].res
                    //         }
                    //     }
                    // }

                    if (obj[field.slug]) {

                        if (field.type === "MULTI_LINE") {
                            obj[field.slug] = obj[field.slug].replace(/<[^>]+>/g, '')
                        }

                        if (field.type === "DATE") {
                            toDate = new Date(obj[field.slug])
                            try {
                                obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy')
                            } catch (error) {
                                // console.log(`${toDate}`, obj[field.slug]);
                            }
                        }

                        if (field.type === "DATE_TIME") {
                            toDate = new Date(obj[field.slug])
                            try {
                                obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy HH:mm')
                            } catch (error) {
                                // console.log(`${toDate}`, obj[field.slug]);
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
            // console.log("ssl", ssl);


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
                    return console.log(error);
                }
                // console.log("uploaded successfully")
                fs.unlink(filename, (err => {
                    if (err) console.log(err);
                    else {
                        // console.log("Deleted file: ", filename);
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
            return { table_slug: req.table_slug, data: respExcel, custom_message: customMessage }
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
                if (modelFrom[data.table_to + "_ids"]?.length) {
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



            const modelTo = await toTableModel.models.findOne({
                guid: el,
            }).lean()
            for (const el of data.id_to) {
                if (modelTo[data.table_from + "_ids"]?.length) {
                    if (!modelTo[data.table_from + "_ids"].includes(data.id_from)) {
                        // console.log("Debug >> test #1", modelTo)
                        // console.log("Debug >> test #2", data.table_from + "_ids")
                        // console.log("Debug >> test #3", modelTo[data.table_from + "_ids"])
                        modelTo[data.table_from + "_ids"].push(data.id_from)
                    }
                } else {
                    modelTo[data.table_from + "_ids"] = [data.id_from]
                }
                // console.log("Debug >> test #4", modelTo[data.table_from + "_ids"])
            }
            await toTableModel.models.updateOne({
                guid: el,
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
                    action_type: "APPEND_MANY2MANY",
                })
                if (customErrMsg) { customMessage = customErrMsg.message }
            }


            return { data, custom_message: customMessage };
        } catch (err) {
            throw err
        }

    }),
    getObjectDetails: catchWrapDbObjectBuilder(`${NAMESPACE}.getObjectDetails`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

            const params = struct.decode(req.data)

            const limit = params.limit
            const offset = params.offset
            const tableInfo = allTables[req.table_slug]
            let keys = Object.keys(params)
            let order = params.order
            let fields = tableInfo.fields

            let with_relations = params.with_relations

            // add regExp to params for filtering
            for (const key of keys) {
                if (key === req.table_slug + "_id" && params[key] !== "") {
                    params["guid"] = params[key]
                }
                if (!key.includes('.') && typeof (params[key]) !== "number" && key !== "search") {
                    params[key] = RegExp(params[key], "i")
                }
            }

            const relations = await Relation.find({
                $or: [{
                    $and: [{
                        table_from: req.table_slug
                    }, {
                        type: "Many2One"
                    }]
                },
                {
                    $and: [{
                        table_to: req.table_slug
                    }, {
                        type: "One2Many"
                    }]
                }
                ]
            })
            let relationsFields = []
            if (with_relations) {
                for (const relation of relations) {
                    // let relationTable = await table.findOne({ slug: relation.table_to })
                    let relatedTable = await tableVersion(mongoConn, { slug: relation.table_to }, params.version_id, true)

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
                            // let childRelationTable = await table.findOne({ slug: field.slug.slice(0, -3) })
                            let childRelationTable = await tableVersion(mongoConn, { slug: field.slug.slice(0, -3) }, params.version_id, true)
                            field._doc.table_label = relationTable.label
                            field.label = childRelationTable.label
                            changedField = field
                            changedField._doc.path_slug = relationTable.slug + "_id_data" + "." + field.slug
                            changedField._doc.table_slug = relationTable.slug
                            relationsFields.push(changedField._doc)
                        } else {
                            if (field.attributes) {
                                field.attributes = struct.decode(field.attributes)
                            }
                            field._doc.table_label = relationTable.label
                            changedField = field
                            changedField._doc.path_slug = relationTable.slug + "_id_data" + "." + field.slug
                            relationsFields.push(changedField._doc)
                        }
                    }
                }
            }

            let searchByField = []
            if (params.search) {
                for (const field of tableInfo.fields) {
                    if (con.STRING_TYPES.includes(field.type)) {
                        let searchField = { [field.slug]: RegExp(params.search, "i") }
                        searchByField.push(searchField)
                    }
                }
            }


            let decodedFields = []
            // below for loop is in order to decode FIELD.ATTRIBUTES from proto struct to normal object
            fields.forEach(element => {
                if (element.attributes && !element.id.includes('#')) {
                    let field = { ...element }
                    field.attributes = struct.decode(element.attributes)
                    decodedFields.push(field)
                } else {
                    if (element.id.includes('#')) {
                        let splitedEl = element.id.split('#')
                        element.id = splitedEl[1]
                        element.slug = splitedEl[0] + '_id'
                        element.table_slug = splitedEl[0]
                        element.type = "LOOKUP" // added "LOOKUP" type to relation field which inside in fields
                    }
                    decodedFields.push(element)
                }
            });

            const response = struct.encode({
                fields: decodedFields,
                views: tableInfo.views,
                relation_fields: relationsFields,
            });
            return { table_slug: req.table_slug, data: response }
        } catch (err) {
            throw err
        }
    }),
    batch: catchWrapDbObjectBuilder(`${NAMESPACE}.batch`, async (req) => {
        try {
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

            return { table_slug: req.table_slug, data: result, custom_message: customMessage };
        } catch (err) {
            throw err
        }

    }),
    multipleUpdate: catchWrapDbObjectBuilder(`${NAMESPACE}.multipleUpdate`, async (req) => {
        try {
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
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

            const data = struct.decode(req.data)
            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
            let objects = [], appendMany2ManyObj = []
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
                let { payload, data, event, appendMany2ManyObjects } = await PrepareFunction.prepareToCreateInObjectBuilder(request, mongoConn)
                appendMany2ManyObj = appendMany2ManyObjects
                objects.push(payload)

                // await sendMessageToTopic(conkafkaTopic.TopicObjectCreateV1, event)


                req.current_data = event?.payload?.data
                // await sendMessageToTopic(conkafkaTopic.TopicEventCreateV1, {
                //     payload: {
                //         current_data: event?.payload?.data,
                //         table_slug: req.table_slug
                //     }
                // })
            }
            await tableInfo.models.insertMany(objects)
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
            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

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

            // console.log(":::::::: request ", request)
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
            // console.log(":::::::::::::::::: test 1")
            if (field_slug === "") {
                throw new Error("Укажите группу по полям")
            }
            request[field_slug] = groupByOptions
            // console.log(":::::::::::::::::: test 2")
            let resp = await objectBuilder.getList({
                project_id: req.project_id,
                table_slug: req.table_slug,
                data: struct.encode(request)
            })
            // console.log(":::::::::::::::::: test 3")
            const data = struct.decode(resp.data)
            const objects = data.response
            if (objects.length) {
                for (const obj of objects) {
                    obj.amounts = []
                }
            }
            // console.log(":::::::::::::::::: test 4")
            let objStore = new Map()
            let cObjStore = new Map()
            let totalAmountByMonths = new Map()
            let dates = await RangeDate(request.start, request.end, request.interval)
            // console.log("::::::::::::::::;; Dates", dates);


            let balance = {
                items: [],
                total: []
            }

            // console.log("::::::::::::::::; View ", view )
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
                    // console.log("######## TEST 1")
                    for (const date of dates) {
                        // console.log(">>>>>>>>> test 2")
                        let chartOfAccount = chartOfAccounts.find(element => element.object_id === obj.guid)
                        let keyDate = new Date(date.$gte)
                        keyDate = addDays(keyDate, 1)
                        let key = keyDate.toISOString()
                        let monthlyAmount = obj.amounts.find(el => el.month === key)

                        for (const acc of accounts) {
                            // console.log("@@@@@@@@@@@@@@@ test 3")
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

            // for (let el of balance.items) {
            //     console.log(el);
            // }

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
            // console.log(":::::::::::::::::::::::::::: TIME ", endTime - startTime)
            return { table_slug: req.table_slug, data: struct.encode(data), custom_message: customMessage }
            // return { table_slug: "ok", data: struct.encode({}) }
            // return {}
        } catch (err) {

            throw err
        }
    })
}

module.exports = objectBuilder;
