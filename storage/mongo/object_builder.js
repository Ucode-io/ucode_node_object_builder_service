const XLSX = require('xlsx');
const fs = require('fs');
const Minio = require('minio');
const { struct } = require('pb-util');

const cfg = require("../../config/index");
const logger = require("../../config/logger");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
const { v4 } = require("uuid");
const con = require("../../config/kafkaTopics");
const sendMessageToTopic = require("../../config/kafka");
const converter = require("../../helper/converter");
const { read, data } = require("../../config/logger");
var fns_format = require('date-fns/format');
const generators = require("../../helper/generator")
const ObjectBuilder = require("../../models/object_builder");

const { exists } = require("../../models/table");


const mongoPool = require('../../pkg/pool');


let NAMESPACE = "storage.object_builder";

let objectBuilder = {
    create: catchWrapDbObjectBuilder(`${NAMESPACE}.create`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

            const data = struct.decode(req.data)
            data.guid = v4()

            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
            let tableData = await table.findOne(
                {
                    slug: req.table_slug
                }
            )
            if (req.table_slug === "template" || req.table_slug === "file") {
                const relation = await Relation.findOne({
                    $or: [
                        {
                            $and: [
                                { table_to: req.table_slug },
                                { table_from: data.table_slug }
                            ]
                        },
                        {
                            $and: [
                                { table_to: data.table_slug },
                                { table_from: req.table_slug }
                            ]
                        }
                    ]
                })
                if (relation) {
                    const field = await Field.findOne({
                        relation_id: relation.id,
                        table_id: tableData.id
                    })
                    if (!data[field?.slug]) {
                        data[field?.slug] = data.object_id
                    }
                }
            }

            let randomNumbers = await Field.findOne({
                table_id: tableData.id,
                type: "RANDOM_NUMBERS"
            })

            if (randomNumbers) {
                let attributes = struct.decode(randomNumbers.attributes)
                let randomNumber = generators.generateRandomNumber(attributes.prefix, attributes.digit_number)
                console.log("random number ::::: ", randomNumber)
                let params = {}
                params[randomNumbers.slug] = randomNumber.toString()

                const isExists = await tableInfo.models.findOne({
                    $and: [params]
                })
                if (isExists) {
                    return await objectBuilder.create(data)
                } else {
                    data[randomNumbers.slug] = randomNumber
                }
            }


            let incrementField = await Field.findOne({
                table_id: tableData.id,
                type: "INCREMENT_ID"
            })


            if (incrementField) {
                let last = await tableInfo.models.findOne({}, {}, { sort: { 'createdAt': -1 } })
                let attributes = struct.decode(incrementField.attributes)
                let incrementLength = attributes.prefix.length
                if (!last || !last[incrementField.slug]) {
                    data[incrementField.slug] = attributes.prefix + '-' + '1'.padStart(attributes.digit_number, '0')
                } else {
                    nextIncrement = parseInt(last[incrementField.slug].slice(incrementLength + 1, last[incrementField.slug].length)) + 1
                    data[incrementField.slug] = attributes.prefix + '-' + nextIncrement.toString().padStart(attributes.digit_number, '0')
                }
            }

            let payload = new tableInfo.models(data);
            await payload.save();

            let fields = await Field.find(
                {
                    table_id: tableData.id
                }
            )
            // TODO::: move kafka to service level
            let event = {}
            let field_types = {}
            event.payload = {}
            event.payload.data = data
            event.payload.table_slug = req.table_slug

            for (const field of fields) {
                let type = converter(field.type);
                if (field.type === "LOOKUPS") {
                    if (data[field.slug]) {
                        const relation = await Relation.findOne({
                            id: field.relation_id
                        })

                        if (!relation) {
                            console.log("RELATION ERROR", relation.table_to)
                        }

                        let appendMany2Many = {}
                        appendMany2Many.id_from = data.guid
                        appendMany2Many.id_to = data[field.slug]
                        appendMany2Many.table_from = req.table_slug
                        if (relation.table_to === req.table_slug) {
                            appendMany2Many.table_to = relation.table_from
                        } else if (relation.table_from === req.table_slug) {
                            appendMany2Many.table_to = relation.table_to
                        }
                        await objectBuilder.appendManyToMany(appendMany2Many)
                    }
                }
                field_types[field.slug] = type
            }
            field_types.guid = "String"
            event.payload.field_types = field_types
            event.project_id = req.project_id || cfg.ucodeDefaultProjectID
            await sendMessageToTopic(con.TopicObjectCreateV1, event)


            req.current_data = data
            await sendMessageToTopic(con.TopicEventCreateV1, {
                payload: {
                    current_data: data,
                    table_slug: req.table_slug
                },
                project_id: req.project_id || cfg.ucodeDefaultProjectID
            })


            const object = struct.encode({ data });
            return { table_slug: req.table_slug, data: object };

        } catch (err) {
            throw err
        }

    }),
    update: catchWrapDbObjectBuilder(`${NAMESPACE}.update`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const Relation = mongoConn.models['Relation']

            const data = struct.decode(req.data)
            if (!data.guid) {
                data.guid = data.id
            }
            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
            const response = await tableInfo.models.updateOne({ guid: data.guid }, { $set: data });
            let event = {}
            let field_types = {}
            event.payload = {}
            event.payload.data = data
            event.payload.table_slug = req.table_slug

            for (const field of tableInfo.fields) {
                let type = converter(field.type);
                field_types[field.slug] = type
                let newIds = [], deletedIds = []

                // this is many2many append and delete when many2many relation field type input
                if (field.type === "LOOKUPS") {
                    if (data[field.slug] && objectBeforeUpdate[field.slug]) {
                        let olderArr = objectBeforeUpdate[field.slug]
                        newArr = data[field.slug]
                        newIds = newArr.filter(val => !olderArr.includes(val))
                        deletedIds = olderArr.filter(val => !newArr.includes(val) && !newIds.includes(val))
                    }

                    const relation = await Relation.findOne({
                        id: field.relation_id
                    })

                    if (newIds.length) {
                        let appendMany2Many = {}
                        appendMany2Many.id_from = data.guid
                        appendMany2Many.id_to = newIds
                        appendMany2Many.table_from = req.table_slug
                        if (relation.table_to === req.table_slug) {
                            appendMany2Many.table_to = relation.table_from
                        } else if (relation.table_from === req.table_slug) {
                            appendMany2Many.table_to = relation.table_to
                        }
                        await objectBuilder.appendManyToMany(appendMany2Many)
                    }
                    if (deletedIds.length) {
                        let deleteMany2Many = {}
                        deleteMany2Many.id_from = data.guid
                        deleteMany2Many.id_to = deletedIds
                        deleteMany2Many.table_from = req.table_slug
                        if (relation.table_to === req.table_slug) {
                            deleteMany2Many.table_to = relation.table_from
                        } else if (relation.table_from === req.table_slug) {
                            deleteMany2Many.table_to = relation.table_to
                        }
                        await objectBuilder.deleteManyToMany(deleteMany2Many)
                    }

                }
            }
            field_types.guid = "String"
            event.payload.field_types = field_types
            event.project_id = req.project_id || cfg.ucodeDefaultProjectID
            await sendMessageToTopic(con.TopicObjectUpdateV1, event)

            return response;

        } catch (err) {
            throw err
        }


    }),
    getSingle: catchWrapDbObjectBuilder(`${NAMESPACE}.getSingle`, async (req) => {
        try {
            const mongoConn = await mongoPool.get(req.project_id)
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

            const data = struct.decode(req.data)

            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]

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


            let relatedTable = []
            for (const relation of relations) {
                const field = await Field.findOne({
                    relation_id: relation.id
                })
                if (field) {
                    relatedTable.push(field?.slug + "_data")
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

            for (const field of tableInfo.fields) {
                if (field.type === "FORMULA") {

                    let attributes = struct.decode(field.attributes)
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
                                        '$eq': data.id
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


                        const result = await (await ObjectBuilder(true, req.project_id))[attributes.table_from].models.aggregate(pipelines)
                        if (result.length) {
                            output[field.slug] = result[0].res
                        }

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

            return {
                table_slug: data.table_slug,
                data: struct.encode({
                    response: output,
                    fields: tableInfo.fields
                })
            }

        } catch (err) {
            throw err
        }


    }),
    getList: catchWrapDbObjectBuilder(`${NAMESPACE}.getList`, async (req) => {
        try {
            let start = Date.now();
            let millis;

            millis = Date.now() - start;
            console.log(`begin[0] seconds elapsed = ${Math.floor(millis / 1000)}`);

            const mongoConn = await mongoPool.get(req.project_id)
            millis = Date.now() - start;
            console.log(`[1] seconds elapsed = ${Math.floor(millis / 1000)}`);

            const table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

            millis = Date.now() - start;
            console.log(`[2] seconds elapsed = ${Math.floor(millis / 1000)}`);

            const params = struct.decode(req.data)
            const limit = params.limit
            const offset = params.offset
            let clientTypeId = params["client_type_id_from_token"]
            delete params["client_type_id_from_token"]
            const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
            millis = Date.now() - start;
            console.log(`[3] seconds elapsed = ${Math.floor(millis / 1000)}`);
            let keys = Object.keys(params)
            let order = params.order
            let fields = tableInfo.fields
            let with_relations = params.with_relations
            const permissionTable = (await ObjectBuilder(true, req.project_id))["record_permission"]
            millis = Date.now() - start;
            console.log(`[4] seconds elapsed = ${Math.floor(millis / 1000)}`);
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
            millis = Date.now() - start;
            console.log(`[5] seconds elapsed = ${Math.floor(millis / 1000)}`);
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
                                params[autoFilter.object_field + "_id"] = params["user_id_from_token"]
                                params[autoFilter.object_field + "ids"] = { $in: params["user_id_from_token"] }
                            } else {
                                params["guid"] = params["user_id_from_token"]
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

            }
            millis = Date.now() - start;
            console.log(`[6] seconds elapsed = ${Math.floor(millis / 1000)}`);
            if (params.view_fields) {
                if (params.view_fields.length) {
                    let arrayOfViewFields = [];
                    for (const view_field of params.view_fields) {
                        let field = tableInfo.fields.filter(val => (val.slug === view_field))
                        if (field[0].type !== "NUMBER" && field[0].type !== "SWITCH") {
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
            millis = Date.now() - start;
            console.log(`[7] seconds elapsed = ${Math.floor(millis / 1000)}`);
            if (clientTypeId) {
                const clientTypeTable = (await ObjectBuilder(true, req.project_id))["client_type"]
                const clientType = await clientTypeTable?.models.findOne({
                    guid: clientTypeId
                })
                if (clientType.name === "DOCTOR" && req.table_slug === "doctors") {
                    params["guid"] = params["user_id_from_token"]
                }
            }
            // add regExp to params for filtering
            for (const key of keys) {
                if (key === req.table_slug + "_id" && params[key] !== "") {
                    params["guid"] = params[key]
                }

                if (params[key] === "true") {
                    params[key] = (params[key] === 'true')
                } else if (params[key] === "false") {
                    params[key] = (params[key] === 'false')
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
                },
                {
                    $and: [{
                        $or: [{
                            table_from: req.table_slug
                        },
                        {
                            "dynamic_tables.table_slug": req.table_slug
                        }]
                    },
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
                }
                ]
            })
            millis = Date.now() - start;
            console.log(`[8] seconds elapsed = ${Math.floor(millis / 1000)}`);
            let relationsFields = []
            if (with_relations) {
                for (const relation of relations) {
                    if (relation.type !== "Many2Dynamic") {
                        if (relation.type === "Many2Many" && relation.table_to === req.table_slug) {
                            relation.table_to = relation.table_from
                        }
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
                                changedField._doc.table_slug = relationTable?.slug
                                relationsFields.push(changedField._doc)
                            } else {
                                await ObjectBuilder(true, req.project_id)
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

            millis = Date.now() - start;
            console.log(`[9] seconds elapsed = ${Math.floor(millis / 1000)}`);
            let result, count;
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

            millis = Date.now() - start;
            console.log(`[10] seconds elapsed = ${Math.floor(millis / 1000)}`);

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
                millis = Date.now() - start;
                console.log(`[11] seconds elapsed = ${Math.floor(millis / 1000)}`);
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
                millis = Date.now() - start;
                console.log(`[12] seconds elapsed = ${Math.floor(millis / 1000)}`);
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

            millis = Date.now() - start;
            console.log(`[13] seconds elapsed = ${Math.floor(millis / 1000)}`);
            let decodedFields = []
            // below for loop is in order to decode FIELD.ATTRIBUTES from proto struct to normal object
            for (const element of fields) {
                const fieldPermissionTable = (await ObjectBuilder(true, req.project_id))["field_permission"]
                const field_permission = await fieldPermissionTable?.models.findOne({
                    $and: [
                        {
                            field_id: element.id
                        },
                        {
                            role_id: params["role_id_from_token"]
                        }
                    ]
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
                if (element.attributes && !(element.type === "LOOKUP" || element.type === "LOOKUPS")) {
                    let field = { ...element }
                    field.attributes = struct.decode(element.attributes)
                    field.attributes["field_permission"] = field_permission?._doc
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
                        elementField.attributes["field_permission"] = field_permission?._doc
                    decodedFields.push(elementField)
                }
            };

            millis = Date.now() - start;
            console.log(`[14] seconds elapsed = ${Math.floor(millis / 1000)}`);
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

            millis = Date.now() - start;
            console.log(`[15] seconds elapsed = ${Math.floor(millis / 1000)}`);
            if (params.additional_request && params.additional_request.additional_values.length && params.additional_request.additional_field) {
                let additional_results;
                const additional_param = {};
                additional_param[params.additional_request.additional_field] = { $in: params.additional_request.additional_values }

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
                        }, { sort: order }
                    )
                        .lean();
                } else {
                    let populateArr = []

                    tableParams = []
                    for (const key of Object.keys(params)) {
                        if (key.includes('.')) {
                            tableParams[key.split('.')[0]] = {
                                [key.split('.')[1]]: { $regex: params[key] },
                                select: '-_id'
                            }
                        }
                    }

                    for (const relation of relations) {
                        if (relation.type === "One2Many") {
                            relation.table_to = relation.table_from
                        } else if (relation.type === "Many2Many" && relation.table_to === req.table_slug) {
                            relation.table_to = relation.table_from
                        }
                        let deepRelations = []

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
                                    if (deepRelation.table_to !== relation.table_to) {
                                        let deepPopulate = {
                                            path: deepRelation.table_to
                                        }
                                        deepRelations.push(deepPopulate)
                                    }
                                }
                            }
                        }
                        if (tableParams[relation.table_to]) {
                            papulateTable = {
                                path: relation.table_to,
                                match: tableParams[relation.table_to],
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
                                path: relation.table_to,
                                populate: deepRelations
                            }
                        }
                        populateArr.push(papulateTable)
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
                result = result.concat(additional_results)
            }
            millis = Date.now() - start;
            console.log(`[16] seconds elapsed = ${Math.floor(millis / 1000)}`);
            let responseResult = []
            let formulaFields = tableInfo.fields.filter(val => val.type === "FORMULA")
            for (const res of result) {
                let editedResult = { ...res }
                for (const field of formulaFields) {
                    let attributes = struct.decode(field.attributes)
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
                                        '$eq': editedResult.guid
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

                        const result = await (await ObjectBuilder(true, req.project_id))[attributes.table_from].models.aggregate(pipelines)
                        if (result.length) {
                            editedResult[field.slug] = result[0].res
                        }
                    }
                }
                responseResult.push(editedResult)
            }
            if (!responseResult.length) {
                responseResult = result
            }

            millis = Date.now() - start;
            console.log(`[17] seconds elapsed = ${Math.floor(millis / 1000)}`);
            console.log()
            const response = struct.encode({
                count: count,
                response: responseResult,
                fields: decodedFields,
                views: tableInfo.views,
                relation_fields: relationsFields,
            });

            millis = Date.now() - start;
            console.log(`finish[18] seconds elapsed = ${Math.floor(millis / 1000)}`);
            return { table_slug: req.table_slug, data: response }

        } catch (err) {
            throw err
        }


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
            event.project_id = req.project_id || cfg.ucodeDefaultProjectID

            await sendMessageToTopic(con.TopicObjectDeleteV1, event)

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
                    params[key] = { $in: params[key] }
                } else if (!key.includes('.') && typeof (params[key]) !== "number" && key !== "search") {
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

            let result, count;
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
                    }, { sort: order }
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
                                viewFields.push(viewField._doc)
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
                    if (obj[field.slug]) {

                        if (field.type === "MULTI_LINE") {
                            obj[field.slug] = obj[field.slug].replace(/<[^>]+>/g, '')
                        }

                        if (field.type === "DATE") {
                            toDate = new Date(obj[field.slug])
                            obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy')
                        }

                        if (field.type === "DATE_TIME") {
                            toDate = new Date(obj[field.slug])
                            obj[field.slug] = fns_format(toDate, 'dd.MM.yyyy HH:mm')
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
                            let multiselectValue = "";
                            for (const value of obj[field.slug]) {
                                multiselectValue = multiselectValue + value + ","
                            }
                            if (multiselectValue !== "") {
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

            let filepath = "./" + filename

            var minioClient = new Minio.Client({
                endPoint: "172.20.20.17",
                port: 9001,
                useSSL: false,
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
                console.log("uploaded successfully")
                fs.unlink(filename, (err => {
                    if (err) console.log(err);
                    else {
                        console.log("Deleted file: ", filename);
                    }
                }));
            });

            const response = struct.encode({
                link: "cdn.medion.uz" + "/reports/" + filename,
            });
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


    }
    ),
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


    }
    ),
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
            data.guid = v4()
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
                    result = await tableInfo.models.updateOne(
                        { guid: objectFromTable.guid }, { $set: object }
                    )
                    let event = {}
                    let field_types = {}
                    event.payload = {}
                    event.payload.data = object
                    event.payload.table_slug = req.table_slug

                    for (const field of tableInfo.fields) {
                        let type = converter(field.type);
                        field_types[field.slug] = type
                    }
                    field_types.guid = "String"
                    event.payload.field_types = field_types
                    event.project_id = req.project_id || cfg.ucodeDefaultProjectID

                    await sendMessageToTopic(con.TopicObjectUpdateV1, event)

                } else {
                    object.guid = v4()
                    let tableData = await table.find(
                        {
                            slug: req.table_slug
                        }
                    )

                    let incrementField = await Field.findOne({
                        table_id: tableData.id,
                        type: "INCREMENT_ID"
                    })


                    if (incrementField) {
                        let last = await tableInfo.models.findOne({}, {}, { sort: { 'createdAt': -1 } })
                        let attributes = struct.decode(incrementField.attributes)
                        let incrementLength = attributes.prefix.length
                        if (!last || !last[incrementField.slug]) {
                            data[incrementField.slug] = attributes.prefix + '-' + '1'.padStart(attributes.digit_number, '0')
                        } else {
                            nextIncrement = parseInt(last[incrementField.slug].slice(incrementLength + 1, last[incrementField.slug].length)) + 1
                            data[incrementField.slug] = attributes.prefix + '-' + nextIncrement.toString().padStart(attributes.digit_number, '0')
                        }
                    }

                    let payload = new tableInfo.models(object);
                    result = await payload.save();

                    let fields = await Field.find(
                        {
                            table_id: tableData.id
                        }
                    )
                    // TODO::: move kafka to service level
                    let event = {}
                    let field_types = {}
                    event.payload = {}
                    event.payload.data = object
                    event.payload.table_slug = req.table_slug

                    for (const field of fields) {
                        let type = converter(field.type);
                        field_types[field.slug] = type
                    }
                    field_types.guid = "String"
                    event.payload.field_types = field_types
                    event.project_id = req.project_id || cfg.ucodeDefaultProjectID

                    await sendMessageToTopic(con.TopicObjectCreateV1, event)
                }
            }



            const object = struct.encode({ data });
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


    })
}

module.exports = objectBuilder;
