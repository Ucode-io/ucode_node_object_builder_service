const mongoose = require("mongoose");
const { v4 } = require("uuid");
const Constants = require("../helper/constants");
const Config = require('../config/index')
const newMongoDBConn = require('../config/mongoConn')


let mongooseObject = {};

async function buildModels(is_build = true) {

    const mongoDBConn = await newMongoDBConn()

    const Table = mongoDBConn.models['Table']
    const Field = mongoDBConn.models['Field']
    const Relation = mongoDBConn.models['Relation']
    const Section = mongoDBConn.models['Section']
    const View = mongoDBConn.models['View']

    // hi guys, comments will be written below in order to
    // explain what is going on in auto-object-builder logic

    // all tables should be got to build their schema
    let tables = []
    if (!is_build) {
        tables = await Table.find({
            deleted_at: "1970-01-01T18:00:00.000+00:00",
        });
    } else {
        tables = await Table.find({
            deleted_at: "1970-01-01T18:00:00.000+00:00",
            is_changed: true
        });
    }


    let tempArray = []
    for (const table of tables) {
        // declare isReferences var to indicate that fields related to a table were added to schema
        let isReferenced = false

        // get all relations and fields of a table
        let relations = await Relation.find({
            $or: [{
                $and: [{
                    table_from: table.slug
                }, {
                    type: "Many2One"
                }]
            },
            {
                $and: [{
                    table_to: table.slug
                }, {
                    type: "One2Many"
                }]
            },
            {
                $and: [{
                    $or: [{
                        table_from: table.slug
                    },
                    {
                        "dynamic_tables.table_slug": table.slug
                    }]
                },
                {
                    type: "Many2Dynamic"
                }
                ]
            }
            ]
        });
        let relationsM2M = await Relation.find({
            $or: [{
                table_from: table.slug
            },
            {
                table_to: table.slug
            }],
            $and: [{
                type: "Many2Many"
            }]
        });
        relations = relations.concat(relationsM2M);
        const fields = await Field.find({
            table_id: table.id,
        },
            {
                created_at: 0,
                updated_at: 0,
                _id: 0,
                __v: 0,
            });
        let fieldObject = {};
        let fieldsModel = [];
        let fieldsIndex = {};
        if (fields) {
            for (const field of fields) {
                let fieldType;

                // below we convert given by front types to our usual datatypes
                if (Constants.STRING_TYPES.includes(field.type)) {
                    fieldType = "String";
                } else if (Constants.NUMBER_TYPES.includes(field.type)) {
                    fieldType = "Number";
                } else if (Constants.BOOLEAN_TYPES.includes(field.type)) {
                    fieldType = "Boolean";
                    field.default = false
                } else if (Constants.MIXED_TYPES.includes(field.type)) {
                    fieldType = mongoose.Schema.Types.Mixed;
                } else {
                    fieldType = "String";
                }

                // we need to call v4 func if default is equal to "v4", it is in the case of UUID
                let _default = {};
                if (field.default === "v4") {
                    _default = v4
                } else {
                    _default = field.default
                }

                // below field is built for mongoose schema
                if (field.type != "BARCODE") {
                    fieldObject = {
                        ...fieldObject,
                        [field.slug]: {
                            type: fieldType,
                            required: field.required,
                            default: _default,
                        }
                    }
                } else {
                    fieldObject = {
                        ...fieldObject,
                        [field.slug]: {
                            type: fieldType,
                            required: field.required,
                            default: _default,
                            unique: true,
                        }
                    }
                }


                // in case if field.type is not equal to LOOKUP(which is datatype for relations) and ID, we push all field into one array for mongoose schema
                if (field.type != "LOOKUP" && field.label != "ID" && field.type != "LOOKUPS") {
                    fieldsModel.push(field._doc)
                    fieldsIndex[field.slug] = 'text'
                } else if ((field.type === "LOOKUP" || field.type === "LOOKUPS") && isReferenced == false) {
                    // else if we need to add all relation fields to related table fields

                    // sections have to be got, so that we can specify by which fields tables are related

                    // if section.field contains '#' (it is M2O and O2M related tables field) OR (@ is for O2O relation field)

                    // relation fields get by field.relation_id
                    const relation = await Relation.findOne({ id: field.relation_id })
                    const view = await View.findOne({ relation_id: field.relation_id, relation_table_slug: table.slug })
                    let resField = {}
                    resField.id = field.id
                    resField.label = view?.name
                    resField.type = field.type
                    resField.table_id = field.table_id
                    resField.relation_id = field.relation_id
                    resField.slug = field.slug
                    let fieldAsAttribute = []
                    resField.attributes = field.attributes
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
                        if (!resField.attributes) {
                            resField.attributes = {}
                        }
                        resField.attributes["view_fields"] = fieldAsAttribute
                        fieldsModel.push(resField)
                    }
                    // if (field.id.includes("@")) {
                    //     splitedID = field.id.split("@")
                    // }

                    // // we need to find this field and push it to array of fields
                    // let sectionField = await Field.findOne({
                    //     id: splitedID[1]
                    // },
                    // {
                    //     created_at: 0,
                    //     updated_at: 0,
                    //     _id: 0,
                    //     __v: 0,
                    // });
                    // if (sectionField) {
                    //     sectionField._doc.slug = splitedID[0] + "." + sectionField._doc.slug
                    //     sectionField._doc.label = field.field_name
                    //     fieldsModel.push(sectionField._doc)
                    // }
                    // after the first time when all relation fields are appended to our field array, 
                    // we change isReferenced to true in order to avoid adding the same fields twice or more
                }
            }
            isReferenced = true
        }


        temp = mongoose.Schema(
            {
                ...fieldObject,
                createdAt: { type: Date, select: false },
                updatedAt: { type: Date, select: false }
            },
            {
                timestamps: true,
                toObject: {
                    virtuals: true
                },
                toJSON: {
                    virtuals: true
                },
            }
        )



        // create populate virtual for relation tables
        let populateParams;
        for (const relation of relations) {
            let field = await Field.findOne({
                relation_id: relation.id
            })
            if (!field) {
                continue
            }
            let slug = field?.slug + "_data"
            if (relation.type === "Many2Many" && relation.table_to === table.slug) {
                relation.table_to = relation.table_from
                if (!relation.field_to) {
                    continue
                }
                populateParams = {
                    ref: relation.table_from,
                    localField: relation.field_to,
                    foreignField: 'guid',
                    justOne: false
                }
                slug = relation.field_to + "_data"
            } else if (relation.type === "Many2Many" && relation.table_from === table.slug) {
                if (!relation.field_to) {
                    continue
                }
                populateParams = {
                    ref: relation.table_to,
                    localField: 'guid',
                    foreignField: relation.field_to,
                    justOne: false
                }
                slug = relation.field_from + "_data"
            } else if (relation.type === "Many2One") {
                populateParams = {
                    ref: relation.table_to,
                    localField: field?.slug,
                    foreignField: 'guid',
                    justOne: true
                }
            } else if (relation.type === "Recursive") {
                populateParams = {
                    ref: relation.table_to,
                    localField: field?.slug,
                    foreignField: 'guid',
                    justOne: true
                }
            } else if (relation.type === "One2Many") {
                relation.table_to = relation.table_from
                populateParams = {
                    ref: relation.table_to,
                    localField: field?.slug,
                    foreignField: 'guid',
                    justOne: true
                }
            } else if (relation.type === "Many2Dynamic") {
                for (dynamic_table of relation.dynamic_tables) {
                    populateParams = {
                        ref: dynamic_table.table_slug,
                        localField: "dynamic." + dynamic_table.table_slug + "_id",
                        foreignField: 'guid',
                        justOne: true
                    }
                    temp.virtual(dynamic_table.table_slug, populateParams);
                }
                continue;
            }


            temp.virtual(slug, populateParams);
        }
        temp.index(fieldsIndex);

        let views = await View.find({
            table_slug: table.slug
        },
            {
                created_at: 0,
                updated_at: 0,
                _id: 0,
                __v: 0,
            }).lean()
        tempArray.push({ field: fieldsModel, model: temp, relation: relations, view: views, slug: table.slug });
    }

    // build mongoose schemas for tables
    for (const model of tempArray) {

        // delete previous mongoose schema for a table, if new fields are added or fields are deleted, schema has to renewed
        // delete mongoose.connection.models[model.slug]
        delete mongoDBConn.models[model.slug]
        delete mongooseObject[model.slug]
        mongooseObject[model.slug] = {};
        // mongooseObject[model.slug].models = mongoose.model(model.slug, model.model);
        mongooseObject[model.slug].models = mongoDBConn.model(model.slug, model.model);
        mongooseObject[model.slug].fields = model.field;
        mongooseObject[model.slug].relations = model.relation;
        mongooseObject[model.slug].views = model.view;

        const resp = await Table.updateOne({
            slug: model.slug,
        },
            {
                $set: {
                    is_changed: false
                }
            })
    }
    return mongooseObject
}

module.exports = buildModels;

