const mongoose = require("mongoose");
const { v4 } = require("uuid");
const Constants = require("../helper/constants");
const mongoPool = require('../pkg/pool')

const passwordTools = require('../helper/passwordTools');
const { struct } = require("pb-util");
const logger = require("../config/logger");
let mongooseObject = {};

async function buildModels(is_build = true, project_id) {

    console.log('REQUEST CAME TO MODELS BUILDER FOR', project_id)

    if (!project_id) {
        console.warn('WARNING:: Using default project id in build models...')
    }

    const mongoDBConn = await mongoPool.get(project_id)
   
    const Table = mongoDBConn.models['Table']
    const Field = mongoDBConn.models['Field']
    const Relation = mongoDBConn.models['Relation']
    const Section = mongoDBConn.models['Section']
    const View = mongoDBConn.models['View']

    // hi guys, comments will be written below in order to explain what is going on in auto-object-builder logic

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
                    }]},   
                    {
                        type: "Many2Dynamic"
                    }
                ]
            },
            //   {
            //     $and: [{
            //         table_from: table.slug
            //     }, {
            //         type: "Recursive"
            //     }]
            //   }
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
        let fieldsIndex = [];
        let dropIndex = {};
        let hashPasswordOnSaveMiddleware = {};
        let hashPasswordOnUpdateMiddleware = {};
        let arrayOfMiddlewares = []
        let hasPasswordField = false;
        if (fields) {
            for (const field of fields) {
                let fieldType;
                if (field?.type === 'PASSWORD') {
                    hasPasswordField = true;
                    arrayOfMiddlewares.push(
                        {
                            type: 'pre',
                            method: 'save',
                            _function: function(next) {
                                if (this[field.slug]) {
                                    let checkPassword = this[field.slug].substring(0,4)
                                    if (checkPassword !== "$2b$" && checkPassword !== "$2a$") {
                                        this[field.slug] = passwordTools.generatePasswordHash(this[field.slug]);
                                    } else {
                                        throw new Error("Wrong password type. Password must not be started '$2a$' or $2b$' ")
                                    }
                                }
                                next()
                            }
                        },
                        {
                            type: 'pre',
                            method: 'updateOne',
                            _function: function(next) {
                                if (this.getUpdate()?.$set[field.slug] && this.getUpdate()?.$set[field.slug] !== '') {
                                    let checkHashedPass = this.getUpdate()?.$set[field.slug].substring(0,4)
                                    if (checkHashedPass !== "$2b$" && checkHashedPass !== "$2a$") {
                                        this.set({[field.slug]: passwordTools.generatePasswordHash(this.getUpdate().$set[field.slug])});
                                    }
                                }
                                next()
                            }
                        }
                    )
                }

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

                    // checking field uniqueness
                    switch (field.unique) {
                        case true:
                            fieldObject[field.slug].unique = true
                            fieldsIndex.push(
                                {
                                    [field.slug]: 1,
                                },
                                {unique: true, dropDups: true, sparse: true},
                            )
                            break;
                        case false:
                            // if not unique then drop the index and remove uniqueness from object field
                            fieldObject[field.slug].unique = false
                            dropIndex = {
                                ...dropIndex,
                                [field.slug]: 1,
                            }
                        default:
                            break;
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
                if (field.type != "LOOKUP" && field.label != "ID" && field.type != "LOOKUPS" && field.type != "DYNAMIC") {
                    fieldsModel.push(field._doc) 
                    fieldsIndex.push({[field.slug]: 'text'})
                } else if ((field.type === "LOOKUP" || field.type === "LOOKUPS" || field.type === "DYNAMIC") && isReferenced == false){
                    // else if we need to add all relation fields to related table fields

                    // sections have to be got, so that we can specify by which fields tables are related
                    
                    // if section.field contains '#' (it is M2O and O2M related tables field) OR (@ is for O2O relation field)
                
                    // relation fields get by field.relation_id
                    const relation = await Relation.findOne({id: field.relation_id})
                    const view = await View.findOne({relation_id: field.relation_id, relation_table_slug: table.slug})
                    let resField = {}
                    resField.id = field.id
                    resField.label = view?.name
                    resField.type = field.type
                    resField.table_id = field.table_id
                    resField.relation_id = field.relation_id
                    resField.required = field.required
                    resField.slug = field.slug
                    resField.attributes = field.attributes
                    let fieldAsAttribute = []
                    let autofillFields = [];
                    let relationTableSlug;
                    let dynamicTables = []
                    if (!resField.attributes) {
                        resField.attributes = {}
                    }
                    if (relation) {
                        if (relation.type !== "Many2Dynamic") {
                            for (const fieldID of relation.view_fields) {
                                let field = await Field.findOne({
                                    id:fieldID
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
                            if (relation?.table_from === table.slug) {
                                relationTableSlug = relation?.table_to
                            } else {
                                relationTableSlug = relation?.table_from
                            }
                            resField.attributes["view_fields"] = fieldAsAttribute
                            const tableElement = await Table.findOne({
                                slug: table.slug
                            })
                            const tableElementFields = await Field.find({
                                table_id: tableElement.id
                            })
                            for (const field of tableElementFields) {
                                if (field.autofill_field && field.autofill_table && field.autofill_table === relationTableSlug) {
                                    let autofill = {
                                        field_from : field.autofill_field,
                                        field_to: field.slug,
                                        automatic: field.automatic,
                                    }
                                    autofillFields.push(autofill)
                                }
                            }
                        } else {
                            for (const dynamicTable of relation.dynamic_tables) {
                                const dynamicTableInfo = await Table.findOne(
                                    {  
                                        slug: dynamicTable.table_slug
                                    },
                                    {
                                        deletedAt: 0,
                                        deleted_at: 0,
                                        createdAt: 0, 
                                        updatedAt: 0,
                                        created_at: 0, 
                                        updated_at: 0,
                                        _id: 0, 
                                        __v: 0
                                    }
                                )
                                dynamicTableToAttribute = dynamicTable
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
                                    if (view_field.attributes) {
                                        view_field.attributes = struct.decode(view_field.attributes)
                                    }
                                    viewFieldsInDynamicTable.push(view_field._doc)
                                }
                                dynamicTableToAttribute.view_fields = viewFieldsInDynamicTable
                                dynamicTables.push(dynamicTableToAttribute)
                            }
                            resField.attributes["relation_field_slug"] = relation?.relation_field_slug
                            resField.attributes["dynamic_tables"] = dynamicTables
                        }
                        resField.attributes["autofill"] = autofillFields
                        resField.attributes["cascadings"] = relation?.cascadings
                        resField.attributes["cascading_tree_table_slug"] = relation?.cascading_tree_table_slug
                        resField.attributes["cascading_tree_field_slug"] = relation?.cascading_tree_field_slug
                        resField.attributes["auto_filters"] = relation?.auto_filters
                        resField.attributes["is_user_id_default"] = relation?.is_user_id_default
                        resField.attributes["object_id_from_jwt"] = relation?.object_id_from_jwt
                        
                        resField.table_slug = relationTableSlug
                        if (view) {
                            if (view.default_values && view.default_values.length) {
                                resField.attributes["default_values"] = view.default_values
                            }
                        }
                        resField.attributes = struct.encode(resField.attributes)
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
        

        temp =  mongoose.Schema(
            {
            ...fieldObject,
            createdAt: {type: Date, select: false},
            updatedAt: {type: Date, select: false}
        },
        {
            timestamps: true,
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            },
        })
        if (hasPasswordField) {
            for (let i=0; i<arrayOfMiddlewares.length; i++) {
                temp[arrayOfMiddlewares[i].type](arrayOfMiddlewares[i].method, arrayOfMiddlewares[i]._function)
            }
        }

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
            } else if (relation.type === "Many2One"){
                populateParams = {
                    ref: relation.table_to,
                    localField: field?.slug,
                    foreignField: 'guid',
                    justOne: true
                }
            } else if (relation.type === "Recursive"){
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
            } else if (relation.type === "Many2Dynamic"){
                for (dynamic_table of relation.dynamic_tables) {
                    populateParams = {
                        ref: dynamic_table.table_slug,
                        localField: relation.relation_field_slug + "." + dynamic_table.table_slug + "_id",
                        foreignField: 'guid',
                        justOne: true
                    }
                    temp.virtual(populateParams.localField+"_data", populateParams);
                }
                continue;
            }
            
            temp.virtual(slug, populateParams);
        }

        for (const index of fieldsIndex) {
            temp.index(index);
        }

        let views = await View.find({
            table_slug: table.slug
        },
        {
            created_at: 0,
            updated_at: 0,
            _id: 0,
            __v: 0,
        }).lean()
        tempArray.push({field: fieldsModel, model: temp, relation: relations, view: views, slug: table.slug, dropIndex: dropIndex});
    }

    mongooseObject[project_id] = mongooseObject[project_id] ? mongooseObject[project_id] : {}

    // build mongoose schemas for tables
    for (const model of tempArray) {
        // delete previous mongoose schema for a table, if new fields are added or fields are deleted, schema has to renewed
        
        delete mongoDBConn.models[model.slug]
        // delete mongooseObject[project_id]

        mongooseObject[project_id][model.slug] = {};
        mongooseObject[project_id][model.slug].models = mongoDBConn.model(model.slug, model.model);
        mongooseObject[project_id][model.slug].fields = model.field;
        mongooseObject[project_id][model.slug].relations = model.relation;
        mongooseObject[project_id][model.slug].views = model.view;
        
        // delete mongoDBConn.models[model.slug]
        // delete mongooseObject[model.slug]
        // mongooseObject[model.slug] = {};
        // mongooseObject[model.slug].models = mongoDBConn.model(model.slug, model.model);
        // mongooseObject[model.slug].fields = model.field;
        // mongooseObject[model.slug].relations = model.relation;
        // mongooseObject[model.slug].views = model.view;

        // drop indexes if unique is disabled
        let index_list, dropIndexes;
        try {
            index_list = await mongooseObject[project_id][model.slug].models.collection.getIndexes()
            dropIndexes = model.dropIndex
            for (const index_name in dropIndexes) {
                if (!(index_name.concat('_1') in index_list)) {
                    delete dropIndexes[index_name]
                }
            } 
        } catch (error) {
            logger.info("error while get index");
        }
        if(dropIndexes && Object.keys(dropIndexes).length > 0) {
            mongooseObject[project_id][model.slug].models.collection.dropIndex(dropIndexes);
        }
        const resp = await Table.updateOne({
            slug: model.slug,
        },
        {
            $set: {
                is_changed: false
            }
        })
    }
    return mongooseObject[project_id]

}

module.exports = buildModels;

