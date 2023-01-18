const XLSX = require('xlsx');
const fs = require('fs');
const Minio = require('minio');
const { struct } = require('pb-util');

const cfg = require("../../config/index");
const logger = require("../../config/logger");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
const { v4 } = require("uuid");
const con = require("../../helper/constants");
const sendMessageToTopic = require("../../config/kafka");
const conkafkaTopic = require("../../config/kafkaTopics");
const converter = require("../../helper/converter");
const Field = require("../../models/field");
var fns_format = require('date-fns/format');
var { addMonths, addDays, addYears } = require('date-fns');
const AddPermission = require("../../helper/addPermission");
const View = require("../../models/view");
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

            let {payload, data, event, appendMany2ManyObjects} = await PrepareFunction.prepareToCreateInObjectBuilder(req, mongoConn)
            await payload.save();

            // send topic to Analytics service
            await sendMessageToTopic(conkafkaTopic.TopicObjectCreateV1, event)

            req.current_data = data
            await sendMessageToTopic(conkafkaTopic.TopicEventCreateV1, {
                payload: {
                    current_data: data,
                    table_slug: req.table_slug
                }
            })

            for (const appendMany2Many of appendMany2ManyObjects) {
                await objectBuilder.appendManyToMany(appendMany2Many)
            }
            const object = struct.encode({ data });
            return { table_slug: req.table_slug, data: object };

        } catch (err) {
            throw err
        }
    }),
    update: catchWrapDbObjectBuilder(`${NAMESPACE}.update`, async (req) => {
        //if you will be change this function, you need to change multipleUpdateV2 function
        try {
            const mongoConn = await mongoPool.get(req.project_id)

            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

            let {data, event, appendMany2Many, deleteMany2Many} = await PrepareFunction.prepareToUpdateInObjectBuilder(req, mongoConn)
            const response = await tableInfo.models.updateOne({ guid: data.guid }, { $set: data });
            for (const resAppendM2M of appendMany2Many) {
                await objectBuilder.appendManyToMany(resAppendM2M)
            }
            for (const resDeleteM2M of deleteMany2Many) {
                await objectBuilder.deleteManyToMany(resDeleteM2M)
            }
            await sendMessageToTopic(conkafkaTopic.TopicObjectUpdateV1, event)

            return response;
        } catch (err) {
            throw err
        }
    }),
    getSingle: catchWrapDbObjectBuilder(`${NAMESPACE}.getSingle`, async (req) => {

        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const table = mongoConn.models['Table']
        const data = struct.decode(req.data)

        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

        const relations = await Relation.find({
            table_from : req.table_slug,
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


        let relatedTable = []
        for (const relation of relations) {
            const field = await Field.findOne({
                relation_id: relation.id
            })
            if (field) {
                relatedTable.push(field?.slug+"_data")
            }
        }
        for (const relation of relationsM2M) {
            if (relation.table_to === req.table_slug) {
                relation.field_from = relation.field_to
            }
            const field = await Field.findOne({
                slug: relation.field_from,
                relation_id: relation.id
            })
            if (field) {
                relatedTable.push(field?.slug+"_data")
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

        if (!output) {logger.error(`failed to find object in table ${data.table_slug} with given id: ${data.id}`)};
        let isChanged = false
        for (const field of tableInfo.fields) {
            let attributes = struct.decode(field.attributes)
            if (field.type === "FORMULA") {
                if (attributes.table_from && attributes.sum_field) {
                    let matchParams = {
                        [req.table_slug+"_id"]: {'$eq': data.id}
                    }
                    const resultFormula =  await FormulaFunction.calculateFormulaBackend(attributes, req.table_slug, matchParams, req.project_id)
                    if (resultFormula.length) {
                        if (output[field.slug] !== resultFormula[0].res ) {
                            isChanged = true
                        }
                        output[field.slug] = resultFormula[0].res 
                    }
                }
            } else if (field.type === "FORMULA_FRONTEND") {
                if (attributes && attributes.fomula) {
                    const resultFormula =  await FormulaFunction.calculateFormulaFrontend(attributes, tableInfo.fields, output)
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
            if (element.attributes&&!(element.type === "LOOKUP" || element.type === "LOOKUPS")) {
                let field = {...element}
                field.attributes = struct.decode(element.attributes)
                decodedFields.push(field)
            } else {
                let autofillFields = []
                let elementField = {...element}
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
                const tableElement = await table.findOne({
                    slug: req.table_slug
                })
                const tableElementFields = await Field.find({
                    table_id: tableElement.id
                })
                for (const field of tableElementFields) {
                    if (field.autofill_field && field.autofill_table && field.autofill_table === relationTableSlug) {
                        let autofill = {
                            field_from : field.autofill_field,
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
                let relation = await Relation.findOne({table_from:req.table_slug, table_to:field.table_slug})
                let viewFields = []
                    if (relation) {
                        for (const view_field of relation.view_fields) {
                            let viewField = await Field.findOne(
                            {
                                id:view_field
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

        return {
            table_slug: data.table_slug,
            data: struct.encode({
                response: output,
                fields: decodedFields
            })
        }
    }),
    getList: catchWrapDbObjectBuilder(`${NAMESPACE}.getList`, async (req) => {
        console.log("TEST::::::1")
        const mongoConn = await mongoPool.get(req.project_id)

        const table = mongoConn.models['Table']
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']

        const params = struct.decode(req.data)
        const limit = params.limit
        const offset = params.offset
        let clientTypeId = params["client_type_id_from_token"]
        delete params["client_type_id_from_token"]
        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

        let keys = Object.keys(params)
        let order = params.order 
        let fields = tableInfo.fields
        let with_relations = params.with_relations
        const permissionTable = (await ObjectBuilder(true, req.project_id))["record_permission"]
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
        if (permission?.is_have_condition) {
            const automaticFilterTable = (await ObjectBuilder(true, req.project_id))["automatic_filter"]
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
            if (automatic_filters.length) {
                for (const autoFilter of automatic_filters) {
                    if (autoFilter.custom_field === "user_id") {
                        if (autoFilter.object_field !== req.table_slug) {
                            params[autoFilter.object_field+"_id"] = params["user_id_from_token"]
                            params[autoFilter.object_field+"ids"] = {$in: params["user_id_from_token"]}
                        } else {
                            params["guid"] = params["user_id_from_token"]
                        }
                    } else {
                        let connectionTableSlug = autoFilter.custom_field.slice(0, autoFilter.custom_field.length-3)
                        let objFromAuth = params.tables.find(obj => obj.table_slug === connectionTableSlug)
                        if (objFromAuth) {
                            if (connectionTableSlug !== req.table_slug) {
                                params[autoFilter.custom_field] = objFromAuth.object_id
                                params[autoFilter.custom_field+"s"] = {$in: params["user_id_from_token"]}
                            } else {
                                params["guid"] = objFromAuth.object_id
                            }
                        }
                    }
                }
            }

        }
        if (params.view_fields && params.search) {
            if (params.view_fields.length && params.search !== ""){
                let arrayOfViewFields = [];
                for (const view_field of params.view_fields) {
                    let field = fields.find(val => (val.slug === view_field))
                    if (field.type !== "NUMBER" && field.type !== "SWITCH") {
                        let obj = {};
                        obj[view_field] = {$regex: new RegExp(params.search.toString(), "i")}
                        arrayOfViewFields.push(obj)
                    }
                }
                if (arrayOfViewFields.length) {
                    params["$or"] = arrayOfViewFields
                }
            }
        }
        if (clientTypeId) {
            const clientTypeTable = (await ObjectBuilder(true, req.project_id))["client_type"]
            const clientType = await clientTypeTable?.models.findOne({
                guid: clientTypeId
            })
            if (clientType?.name === "DOCTOR" && req.table_slug === "doctors") {
                params["guid"] = params["user_id_from_token"]
            }
        }
        console.log("TEST::::::3")
        let views = []
        if (params.app_id) {
            views = tableInfo.views.filter(val => (val.app_id === params.app_id))
        }
        // add regExp to params for filtering
        for (const key of keys) {
            if ((key === req.table_slug + "_id" || key === req.table_slug + "_ids") && params[key] !== "" && !params["is_recursive"]) {
                params["guid"] = params[key]
            }
            if (typeof(params[key])=== "object") {

                if (params[key]) {
                    let is_array = Array.isArray(params[key])
                    if (is_array) {
                        params[key] = {$in: params[key]}
                    }
                }
            } else if (!key.includes('.') && typeof(params[key]) !== "number" && key !== "search" && typeof(params[key]) !== "boolean") {
                params[key] = RegExp(params[key], "i")
            } 
        }
        console.log("TEST::::::4")
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
              },
              {
                $and: [{
                    $or: [{
                        table_from: req.table_slug
                    },
                    {
                        "dynamic_tables.table_slug": req.table_slug
                    }]},   
                    {
                        type: "Many2Dynamic"
                    }
                ]
              },
              {
                $and: [{
                    $or: [{
                        table_from: req.table_slug
                    },
                    {
                        table_to: req.table_slug
                    }]
                }, {
                    type: "Many2Many"
                }]
              },
            //   {
            //     $and: [{
            //         table_from: req.table_slug
            //     }, {
            //         type: "Recursive"
            //     }]
            //   }
            ]
        })
        console.log("TEST::::::5")
        let relationsFields = []
        if (with_relations) {
            for (const relation of relations) {
                if (relation.type !== "Many2Dynamic") {
                    if (relation.type === "Many2Many" && relation.table_to === req.table_slug) {
                        relation.table_to = relation.table_from
                    }
                    let relationTable = await table.findOne({slug:relation.table_to})
                    let relationFields = await Field.find(
                        {
                            table_id:relationTable.id
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
                            childRelation = await Relation.findOne({table_from:relationTable.slug, table_to: table_slug})
                            if (childRelation) {
                                for (const view_field of childRelation.view_fields) {
                                    let viewField = await Field.findOne(
                                    {
                                        id:view_field
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
                            let childRelationTable = await table.findOne({slug:table_slug})
                            field._doc.table_label = relationTable?.label
                            field.label = childRelationTable?.label
                            changedField = field
                            changedField._doc.path_slug = relationTable?.slug + "_id_data" + "." + field.slug
                            changedField._doc.table_slug =  table_slug
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
        console.log("TEST::::::6")


        let result = [], count;
        let searchByField = []
        if (params.search) {
            for (const field of tableInfo.fields) {
                if (con.STRING_TYPES.includes(field.type)) {
                    let searchField = {[field.slug]: RegExp(params.search, "i")}
                    searchByField.push(searchField)
                }     
            }
        }
        if (params.phone_number) {
            let temp = params.phone_number.toString()
            let tempPhone = temp.substring(5, temp.length - 2)
            let phone = `\(` + temp.substring(2,4) + `\)` + tempPhone
            params.phone_number = phone
        } else if (params.phone) {
            let temp = params.phone.toString()
            let tempPhone = temp.substring(5, temp.length - 2)
            let phone = `\(` + temp.substring(2,4) + `\)` + tempPhone
            params.phone = phone
        }
        console.log("TEST::::::7")
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
                }, {sort: order}
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
                        } else if (typeof(params[key]) !== "number" && key !== "search" && typeof(params[key]) !== "boolean") {
                            if (tableParams[key.split('.')[0]]) {
                                tableParams[key.split('.')[0]][key.split('.')[1]] = {$regex:  params[key]}
                            } else {
                                tableParams[key.split('.')[0]] = {
                                    [key.split('.')[1]]: {$regex:  params[key]}, 
                                    select: '-_id'
                                }    
                            }
                        }
                    }
                }
                console.log("TEST::::::8")
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
                    const field = tableInfo.fields.find(val => (val.relation_id === relation.id))
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
                            console.log("it's dynamic relations");
                        } else {
                            deepPopulateRelations = await Relation.find({table_from:relation.table_to})
                            for (const deepRelation of deepPopulateRelations) {
                                if (deepRelation.type === "One2Many") {
                                    deepRelation.table_to = deepRelation.table_from
                                } else if (relation.type === "Many2Many") {
                                    continue
                                }
                                // else if (deepRelation.type === "Many2Many" && deepRelation.table_to === relation.table_to) {
                                //     deepRelation.field_to = deepRelation.field_from
                                // }

                                let deep_table_to_slug = "";
                                const field = await Field.findOne({
                                    relation_id: deepRelation.id
                                })
                                if (field) {
                                    deep_table_to_slug = field.slug + "_data"
                                }
                                if (deep_table_to_slug === "") {
                                    continue
                                }
                
                                if (deep_table_to_slug !== deepRelation.field_to+"_data") {
                                    let deepPopulate = {
                                        path: deep_table_to_slug
                                    }
                                    deepRelations.push(deepPopulate)
                                }
                            }
                        }
                    }
                    console.log("TEST::::::9")
                    if (tableParams[table_to_slug]) {
                        papulateTable = {
                            path: table_to_slug,
                            match: tableParams[table_to_slug],
                            populate: deepRelations,
                        }
                    } else {
                        if (relation.type === "Many2Dynamic") {
                            for(dynamic_table of relation.dynamic_tables){
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
                }, {sort: order}
                )
                .skip(offset)
                .limit(limit)
                .populate(populateArr)
                .lean()
                
                
                result = result.filter(obj => Object.keys(tableParams).every(key => obj[key]))
            }
        }
        console.log("TEST::::::10")
        count = await tableInfo.models.count(params);
        if (result && result.length) {
            let prev = result.length
            count = count - (prev - result.length)
        }

        console.log("TEST::::::11")
        // this function add field permission for each field by role id
        let fieldsWithPermissions = await AddPermission.toField(fields, params.role_id_from_token, req.table_slug, req.project_id)
        let decodedFields = []
        // below for loop is in order to decode FIELD.ATTRIBUTES from proto struct to normal object
        for (const element of fieldsWithPermissions) {
            if (element.attributes&&!(element.type === "LOOKUP" || element.type === "LOOKUPS")) {
                let field = {...element}
                field.attributes = struct.decode(element.attributes)
                decodedFields.push(field)
            } else {
                let elementField = {...element}
                if (element.attributes) {
                    elementField.attributes = struct.decode(element.attributes)
                }
                decodedFields.push(elementField)
            }
        };
        console.log("TEST::::::12")
        for (const field of decodedFields) {
            if (field.type === "LOOKUP" || field.type === "LOOKUPS") {
                let relation = await Relation.findOne({table_from: req.table_slug, table_to: field.table_slug})
                let viewFields = []
                    if (relation) {
                        for (const view_field of relation.view_fields) {
                            let viewField = await Field.findOne(
                            {
                                id:view_field
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
        console.log("TEST::::::13")
        if (params.additional_request && params.additional_request.additional_values?.length && params.additional_request.additional_field) {
            let additional_results;
            const additional_param = {};
            additional_param[params.additional_request.additional_field] = {$in: params.additional_request.additional_values}
            
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
                    __v: 0
                }, {sort: order}
                )
                .lean();
            } else {
                for (const key of Object.keys(params)) {
                    if (key.includes('.')) {
                        tableParams[key.split('.')[0]] = {
                            [key.split('.')[1]]: {$regex:  params[key]}, 
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
                }, {sort: order}
                )
                .populate(populateArr)
                .lean()
                additional_results = additional_results.filter(obj => Object.keys(tableParams).every(key => obj[key]))
                let result_ids = []
                result.forEach(el => result_ids.push(el.guid))
                additional_results = additional_results.filter(obj => !result_ids.includes(obj.guid))
            }
            result = result.concat(additional_results)
        }
        console.log("TEST::::::14")
        let updatedObjects = []
        let formulaFields = tableInfo.fields.filter(val => (val.type === "FORMULA" || val.type === "FORMULA_FRONTEND"))
        for (const res of result) {
            let isChanged = false
            for (const field of formulaFields) {
                let attributes = struct.decode(field.attributes)
                if (field.type === "FORMULA") {
                    if (attributes.table_from && attributes.sum_field) {
                        let matchParams = {
                            [req.table_slug+"_id"]: {'$eq': res.guid}
                        }
                        const resultFormula =  await FormulaFunction.calculateFormulaBackend(attributes, req.table_slug, matchParams, req.project_id)
                        if (resultFormula.length) {
                            if (res[field.slug] !== resultFormula[0].res ) {
                                isChanged = true
                            }
                            res[field.slug] = resultFormula[0].res 
                        }
                    }  
                } else {
                    if (attributes && attributes.formula) {
                        const resultFormula =  await FormulaFunction.calculateFormulaFrontend(attributes, tableInfo.fields, res)
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
                data: struct.encode({objects: updatedObjects})
            })
        }
        console.log("TEST::::::15")
        const response = struct.encode({
            count: count,
            response: result,
            fields: decodedFields,
            views: views,
            relation_fields: relationsFields,
        });
        return {table_slug: req.table_slug, data: response}
    }),
    delete: catchWrapDbObjectBuilder(`${NAMESPACE}.delete`, async (req) => {
        try {
            const data = struct.decode(req.data)

            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

            const response = await tableInfo.models.deleteOne({ guid: data.id });
            let event = {}
            let table = {}
            table.guid = data.id
            table.table_slug = req.table_slug
            event.payload = table

            event.project_id = req.project_id 
            await sendMessageToTopic(conkafkaTopic.TopicObjectDeleteV1, event)

            return { table_slug: req.table_slug, data: response };
        } catch (err) {
            throw err
        }
    }),
    getListInExcel: catchWrapDbObjectBuilder(`${NAMESPACE}.getListInExcel`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

            const params = struct.decode(req.data)
            const limit = params.limit
            const offset = params.offset
            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
            let keys = Object.keys(params)
            let order = params.order
            let fields = tableInfo.fields
            let with_relations = params.with_relations

            // add regExp to params for filtering
            for (const key of keys) {
                if (key === req.table_slug + "_id" && params[key] !== "") {
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
                    let relationTable = await table.findOne({ slug: relation.table_to })

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
                            let childRelationTable = await table.findOne({ slug: field.slug.slice(0, -3) })
                            field._doc.table_label = relationTable.label
                            field.label = childRelationTable.label
                            changedField = field
                            changedField._doc.path_slug = relationTable.slug + "_id_data" + "." + field.slug
                            let splitedField = field.slug.split('_')
                            changedField._doc.table_slug = splitedField[0]
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

            let result, count, prev;
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
            }
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

                let populateArr = []

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
                        } else {
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
                    } else if (relation.type === "Many2Many" && relation.table_to === req.table_slug) {
                        relation.field_to = relation.field_from
                    }
                    let table_to_slug = ""
                    let deepRelations = []
                    const field = tableInfo.fields.find(val => (val.relation_id === relation.id))
                    if (field) {
                        table_to_slug = field.slug + "_data"
                    }
                    if (table_to_slug === "") {
                        continue
                    }

                    if (with_relations) {
                        if (relation.type === "Many2Dynamic") {
                            for (dynamic_table of relation.dynamic_tables) {
                                deepPopulateRelations = await Relation.find({ table_from: dynamic_table.table_slug })
                                for (const deepRelation of deepPopulateRelations) {
                                    if (deepRelation.table_to !== dynamic_table.table_slug) {
                                        let deepPopulate = {
                                            path: deepRelation.table_to
                                        }
                                        deepRelations.push(deepPopulate)
                                    }
                                }
                            }
                        } else {
                            deepPopulateRelations = await Relation.find({ table_from: relation.table_to })
                            for (const deepRelation of deepPopulateRelations) {
                                if (deepRelation.type === "One2Many") {
                                    deepRelation.table_to = deepRelation.table_from
                                } else if (deepRelation.type === "Many2Many" && deepRelation.table_to === relation.table_to) {
                                    deepRelation.field_to = deepRelation.field_from
                                }
                                let deep_table_to_slug = "";
                                const field = await Field.findOne({
                                    relation_id: deepRelation.id
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
                                    path: dynamic_table.table_slug,
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
                    }, { sort: { createdAt: -1 } }
                )
                    .skip(offset)
                    .limit(limit)
                    .populate(populateArr)
                    .lean()

                count = await tableInfo.models.count(params);
                let prev = result.length

                result = result.filter(obj => Object.keys(tableParams).every(key => obj[key]))
                count = count - (prev - result.length)
            }
            let decodedFields = []
            // below for loop is in order to decode FIELD.ATTRIBUTES from proto struct to normal object
            for (const element of fields) {
                if (element.attributes && !(element.type === "LOOKUP" || element.type === "LOOKUPS")) {
                    let field = { ...element }
                    field.attributes = struct.decode(element.attributes)
                    decodedFields.push(field)
                } else {
                    let autofillFields = []
                    let elementField = { ...element }
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
                    const tableElement = await table.findOne({
                        slug: req.table_slug
                    })
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
                            }
                        }
                    }
                    field.view_fields = viewFields
                }
            }



            excelArr = []
            for (const obj of result) {
                excelObj = {}
                for (const field of decodedFields) {
                    if (field.type === "FORMULA") {
                        let attributes = field.attributes

                        if (attributes.table_from && attributes.sum_field) {
                            let groupBy = req.table_slug + '_id'
                            let groupByWithDollorSign = '$' + req.table_slug + '_id'
                            let sumFieldWithDollowSign = '$' + attributes["sum_field"]
                            let aggregateFunction = '$sum';
                            switch (attributes.type) {
                                case 'SUMM':
                                    aggregateFunction = '$sum'
                                    break;
                                case 'AVG':
                                    aggregateFunction = '$avg'
                                    break;
                                case 'MAX':
                                    aggregateFunction = '$max'
                                    break;
                            }
                            const pipelines = [
                                {
                                    '$match': {
                                        [groupBy]: {
                                            '$eq': obj.guid
                                        }
                                    }
                                }, {
                                    '$group': {
                                        '_id': groupByWithDollorSign,
                                        'res': {
                                            [aggregateFunction]: sumFieldWithDollowSign
                                        }
                                    }
                                }
                            ];

                            const resultFormula = await (await ObjectBuilder(true, req.project_id))[attributes.table_from].models.aggregate(pipelines)

                            if (resultFormula.length) {
                                obj[field.slug] = resultFormula[0].res
                            }
                        }
                    }

                    if (obj[field.slug]) {

                        if (field.type === "MULTI_LINE") {
                            obj[field.slug] = obj[field.slug].replace(/<[^>]+>/g, '')
                        }

                        if (field.type === "DATE") {
                            toDate = new Date(obj[field.slug])
                            try {
                                obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy')
                            } catch (error) {
                                console.log(`${toDate}`, obj[field.slug]);
                            }
                        }

                        if (field.type === "DATE_TIME") {
                            toDate = new Date(obj[field.slug])
                            try {
                                obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy HH:mm')
                            } catch (error) {
                                console.log(`${toDate}`, obj[field.slug]);
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

            return { table_slug: req.table_slug, data: response }
        } catch (err) {
            throw err
        }
    }),
    deleteManyToMany: catchWrapDbObjectBuilder(`${NAMESPACE}.deleteManyToMany`, async (data) => {
        try {
            const fromTableModel = (await ObjectBuilder(true, data.project_id))[data.table_from]
            const toTableModel = (await ObjectBuilder(true, data.project_id))[data.table_to]

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




            return data;
        } catch (err) {
            throw err
        }
    }),
    appendManyToMany: catchWrapDbObjectBuilder(`${NAMESPACE}.appendManyToMany`, async (data) => {
        try {
            const fromTableModel = (await ObjectBuilder(true, data.project_id))[data.table_from]
            const toTableModel = (await ObjectBuilder(true, data.project_id))[data.table_to]

            const modelFrom = await fromTableModel.models.findOne({
                guid: data.id_from,
            })
            for (const el of data.id_to) {
                if (modelFrom[data.table_to + "_ids"]) {
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
                })
                if (modelTo[data.table_from + "_ids"]) {
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


            return data;
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
            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
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
                    let relationTable = await table.findOne({ slug: relation.table_to })

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
                            let childRelationTable = await table.findOne({ slug: field.slug.slice(0, -3) })
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
            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']

            const params = {}
            const data = struct.decode(req.data)
            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

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

            return { table_slug: req.table_slug, data: result };
        } catch (err) {
            throw err
        }

    }),
    multipleUpdate: catchWrapDbObjectBuilder(`${NAMESPACE}.multipleUpdate`, async (req) => {
        try {

            const data = struct.decode(req.data)
            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
            let resp, allSum = 0

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
                if (object.guid) {
                    await objectBuilder.update(request)
                } else {
                    await objectBuilder.create(request)
                }
            }

            return;

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
                let {payload, data, event, appendMany2ManyObjects} = await PrepareFunction.prepareToCreateInObjectBuilder(request, mongoConn)
                appendMany2ManyObj = appendMany2ManyObjects
                objects.push(payload)

                await sendMessageToTopic(conkafkaTopic.TopicObjectCreateV1, event)


                req.current_data = object
                await sendMessageToTopic(conkafkaTopic.TopicEventCreateV1, {
                    payload: {
                        current_data: object,
                        table_slug: req.table_slug
                    }
                })
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
            for (const obj of datas.objects) {
                let request = {
                    data: struct.encode(obj),
                    table_slug: req.table_slug,
                    project_id: req.project_id,
                }

                let {data, event, appendMany2Many, deleteMany2Many} = await prepareFunction.prepareToUpdateInObjectBuilder(request, mongoConn)

                await sendMessageToTopic(conkafkaTopic.TopicObjectUpdateV1, event)
                let bulk = {
                    updateOne: {
                        filter:
                            { guid: data.guid },
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
            const mongoConn = await mongoPool.get(req.project_id)
            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']
            const request = struct.decode(req.data)
            const view = await View.findOne({
                id: request.view_id
            })
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
            let dates = await RangeDate(request.start, request.end, request.interval)
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
                            const optionTable = (await ObjectBuilder(true, req.project_id))[option.table_slug]
                            let groupBy = req.table_slug + '_id'
                            let groupByWithDollorSign = '$' + req.table_slug + '_id'
                            let sumFieldWithDollowSign = '$' + option.number_field
                            let dateBy = option.date_field
                            let aggregateFunction = "$sum"

                            let params = {}
                            //adding params
                            params[groupBy] = {'$eq': chartOfAccount.object_id}
                            params[dateBy] = date

                            if (option.filters && option.filters.length) {
                                for (const filter of option.filters) {
                                    let field = optionTable.fields.find(el => el.id == filter.field_id)
                                    if (field) {
                                        if (filter.value?.length) {
                                            params[field.slug] = {$in: filter.value}
                                        }
                                    }
                                }
                            }
                            const pipelines =   [
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
                        parentObj = objects.find(el => el.guid === parentObj[req.table_slug + "_id"])
                        monthlyAmount = parentMonthlyAmount
                        if (parentObj) {
                            parentMonthlyAmount = parentObj.amounts.find(el => el.month === key)
                        }
                    }
                }
            }
            return { table_slug: req.table_slug, data: struct.encode(data) }
        } catch (err) {
            throw err
        }
    })

}

module.exports = objectBuilder;
