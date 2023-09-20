const { struct } = require('pb-util');
const con = require("./constants");
const converter = require("./converter");
const generators = require("./generator")
const ObjectBuilder = require("./../models/object_builder");

const tableVersion = require("../helper/table_version")
const grpcClient = require("./../services/grpc/client");




let prepareFunction = {
    prepareToCreateInObjectBuilder: async (req, mongoConn) => {

        // this function prepare data to create in object builder service
        const table = mongoConn.models['Table']
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']

        const data = struct.decode(req.data)
        let ownGuid;
        if (data.guid) {
            ownGuid = data.guid
        }
        let allTableInfos = await ObjectBuilder(true, req.project_id)
        const tableInfo = allTableInfos[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }
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
                    table_id: tableData?.id
                })
                if (!data[field?.slug]) {
                    data[field?.slug] = data.object_id
                }
            }
        }

        let randomNumbers = await Field.findOne({
            table_id: tableData?.id,
            type: "RANDOM_NUMBERS"
        })

        if (randomNumbers) {
            let attributes = struct.decode(randomNumbers.attributes)
            let randomNumber = generators.generateRandomNumber(attributes.prefix, attributes.digit_number)
            let params = {}
            params[randomNumbers.slug] = randomNumber.toString()

            const isExists = await tableInfo.models.findOne({
                $and: [params]
            })
            if (isExists) {
                return await prepareToCreateInObjectBuilder(req, mongoConn)
            } else {
                data[randomNumbers.slug] = randomNumber
            }
        }


        let incrementField = await Field.findOne({
            table_id: tableData?.id,
            type: "INCREMENT_ID"
        })
        if (incrementField) {
            let last = await tableInfo.models.findOne({}, {}, { sort: { 'createdAt': -1 } })
            let attributes = struct.decode(incrementField.attributes)
            let incrementLength = attributes.prefix?.length
            if (!last || !last[incrementField.slug]) {
                data[incrementField.slug] = attributes.prefix + '-' + '1'.padStart(attributes.digit_number, '0')
            } else {
                nextIncrement = parseInt(last[incrementField.slug].slice(incrementLength + 1, last[incrementField.slug]?.length)) + 1
                data[incrementField.slug] = attributes.prefix + '-' + nextIncrement.toString().padStart(attributes.digit_number, '0')
            }
        }

        let incrementNum = await Field.findOne({
            table_id: tableData?.id,
            type: "INCREMENT_NUMBER"
        })
        if (incrementNum) {
            let last = await tableInfo.models.findOne({}, {}, { sort: { 'createdAt': -1 } })
            // console.log(">>>>>>>>>>>>>>> last ", last)
            // console.log(">>>>>>>>>>>>>>> increment field ", incrementNum)

            let attributes = struct.decode(incrementNum.attributes)
            let incrementLength = attributes.prefix?.length
            if (!last || !last[incrementNum.slug]) {
                data[incrementNum.slug] = (attributes.prefix ? attributes.prefix : "") + '1'.padStart(attributes.digit_number, '0')
            } else {
                if (incrementLength) {
                    nextIncrement = parseInt(last[incrementNum.slug].slice(incrementLength + 1, last[incrementNum.slug]?.length)) + 1
                    // console.log("@@@@@@@@@@  ", nextIncrement)
                    data[incrementNum.slug] = attributes.prefix + (nextIncrement + "").padStart(attributes.digit_number, '0')

                } else {
                    nextIncrement = parseInt(last[incrementNum.slug]) + 1
                    // console.log("!!!!!!!! ", nextIncrement)
                    data[incrementNum.slug] = attributes.prefix + (nextIncrement + "").padStart(attributes.digit_number, '0')
                }

            }
        }
        const relations = await Relation.find({
            table_from: req.table_slug
        })
        let decodedFields = []
        for (const element of tableInfo.fields) {
            if (element.attributes && (element.type === "LOOKUP" || element.type === "LOOKUPS")) {
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
        for (let el of tableInfo.fields) {
            if (!data[el.slug] && el.autofill_table && el.autofill_field) {
                const AutiFillTable = allTableInfos[el.autofill_table]
                if (AutiFillTable) {
                    const autofillObject = await AutiFillTable.models.findOne({ guid: data[el.autofill_table + "_id"] }).lean() || {}
                    data[el.slug] = autofillObject[el.autofill_field]
                }
            }
            if (el.attributes) {
                if (struct.decode(el.attributes).defaultValue && !data[el.slug]) {
                    if (typeof data[el.slug] === "boolean") {
                        data[el.slug] = false
                    } else {
                        if (con.NUMBER_TYPES.includes(el.type)) {
                            data[el.slug] = Number(struct.decode(el.attributes).defaultValue)
                        } else if (el.type === "DATE_TIME" || el.type === "DATE") {
                            data[el.slug] = new Date().toISOString()
                        } else if (el.type === "SWITCH") {
                            let default_value = struct.decode(el.attributes).defaultValue?.toLocaleLowerCase()
                            if (default_value == "true") {
                                data[el.slug] = true
                            } else if (default_value == "false") {
                                data[el.slug] = false
                            }
                        } else {
                            data[el.slug] = struct.decode(el.attributes).defaultValue
                        }
                    }
                } else if (struct.decode(el.attributes)?.default_values?.length && !data[el.slug]) {
                    data[el.slug] = struct.decode(el.attributes)?.default_values[0]

                }
            }
        }

        let payload = new tableInfo.models(data);

        if (ownGuid) {
            payload.guid = ownGuid
        }
        let fields = await Field.find(
            {
                table_id: tableData?.id
            }
        )

        //deleted kafka to send topic to analytics
        let appendMany2ManyObjects = []
        for (const field of fields) {
            if (field.type === "LOOKUPS") {
                if (data[field.slug] && data[field.slug]?.length) {
                    const relation = await Relation.findOne({
                        id: field.relation_id
                    })

                    let appendMany2Many = {
                        project_id: req.project_id
                    }
                    appendMany2Many.id_from = data.guid
                    appendMany2Many.id_to = data[field.slug]
                    appendMany2Many.table_from = req.table_slug
                    if (relation.table_to === req.table_slug) {
                        appendMany2Many.table_to = relation.table_from
                    } else if (relation.table_from === req.table_slug) {
                        appendMany2Many.table_to = relation.table_to
                    }
                    appendMany2ManyObjects.push(appendMany2Many)
                }
            }
        }

        return { payload, data, appendMany2ManyObjects }
    },
    prepareToUpdateInObjectBuilder: async (req, mongoConn) => {
        const Relation = mongoConn.models['Relation']
        const Field = mongoConn.models['Field']

        const data = struct.decode(req.data)
        if (!data.guid) {
            data.guid = data.id
        }
        data.id = data.guid
        if (data.auth_guid) {
            data.guid = data.auth_guid
        }
        const tableInfo = (await ObjectBuilder(true, req.project_id))[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }
        const objectBeforeUpdate = await tableInfo.models.findOne({ guid: data.guid });

        const relations = await Relation.find({
            id: { $in: relation_ids }
        })
        let relationMap = {}

        for (const relation of relations) {
            relationMap[relation.id] = relation
        }
        let decodedFields = []
        for (const element of tableInfo.fields) {
            if (element.attributes && (element.type === "LOOKUP" || element.type === "LOOKUPS")) {
                let autofillFields = []
                let elementField = { ...element }
                const relation = relationMap[elementField.relation_id]

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
        let event = {}
        let field_types = {}
        event.payload = {}
        event.payload.data = data
        event.payload.table_slug = req.table_slug
        let dataToAnalytics = {}
        let appendMany2Many = [], deleteMany2Many = []

        let relation_ids = []
        for (const field of tableInfo.fields) {
            if (field.type === "LOOKUPS") {
                relation_ids.push(field.relation_id)
            }
        }

        for (const field of tableInfo.fields) {
            let type = converter(field.type);
            if (field.type == "FORMULA" || field.type == "FORMULA_FRONTEND") {
                type = "String"
            }
            field_types[field.slug] = type
            let newIds = [], deletedIds = []

            // this is many2many append and delete when many2many relation field type input
            if (field.type === "LOOKUPS") {
                if (data[field.slug] && objectBeforeUpdate[field.slug]) {
                    let olderArr = objectBeforeUpdate[field.slug]
                    let newArr = data[field.slug]
                    if (Array.isArray(newArr)) {
                        newIds = newArr.filter(val => !olderArr.includes(val))
                        deletedIds = olderArr.filter(val => !newArr.includes(val) && !newIds.includes(val))
                    }
                }

                const relation = relationMap[field.relation_id]

                if (newIds.length) {
                    let appendMany2ManyObj = {
                        project_id: req.project_id
                    }
                    appendMany2ManyObj.id_from = data.guid
                    appendMany2ManyObj.id_to = newIds
                    appendMany2ManyObj.table_from = req.table_slug
                    if (relation.table_to === req.table_slug) {
                        appendMany2ManyObj.table_to = relation.table_from
                    } else if (relation.table_from === req.table_slug) {
                        appendMany2ManyObj.table_to = relation.table_to
                    }
                    appendMany2Many.push(appendMany2ManyObj)
                }
                if (deletedIds.length) {
                    let deleteMany2ManyObj = {
                        project_id: req.project_id
                    }
                    deleteMany2ManyObj.id_from = data.guid
                    deleteMany2ManyObj.id_to = deletedIds
                    deleteMany2ManyObj.table_from = req.table_slug
                    if (relation.table_to === req.table_slug) {
                        deleteMany2ManyObj.table_to = relation.table_from
                    } else if (relation.table_from === req.table_slug) {
                        deleteMany2ManyObj.table_to = relation.table_to
                    }
                    deleteMany2Many.push(deleteMany2ManyObj)
                }
                dataToAnalytics[field.slug] = data[field.slug]
            }
        }
        field_types.guid = "String"
        event.payload.field_types = field_types
        event.payload.data = dataToAnalytics
        event.project_id = req.project_id
        return { data, event, appendMany2Many, deleteMany2Many, decodedFields }
    },
}

module.exports = prepareFunction