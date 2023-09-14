const catchWrapDb = require("../../helper/catchWrapDb");

const { struct } = require('pb-util');
const { v4 } = require("uuid");
const relationStore = require("../mongo/relation");
const AddPermission = require("../../helper/addPermission");
const tableVersion = require("../../helper/table_version")
const mongoPool = require('../../pkg/pool');
const ObjectBuilder = require("../../models/object_builder");

// const mongoConn = await mongoPool.get(data.project_id)
// const Table = mongoConn.models['Table']
// const Field = mongoConn.models['Field']
// const Section = mongoConn.models['Section']
// const App = mongoConn.models['App']
// const View = mongoConn.models['View']
// const Relation = mongoConn.models['Relation']
// const ViewRelation = mongoConn.models['ViewRelation']


// const mongoConn = await mongoPool.get(data.project_id)
// const Table = mongoConn.models['Table']
// const Field = mongoConn.models['Field']
// const Section = mongoConn.models['Section']
// const App = mongoConn.models['App']
// const View = mongoConn.models['View']
// const Relation = mongoConn.models['Relation']
// const ViewRelation = mongoConn.models['ViewRelation']


let NAMESPACE = "storage.section";

let sectionStore = {
    createAll: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Section = mongoConn.models['Section']

            for (const sectionReq of data.sections) {
                const section = new Section(sectionReq);
                section.table_id = data.id;
                var response = section.save();
            }

            const resp = await Table.updateOne({
                id: data.id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                })

            return response;
        } catch (err) {
            throw err
        }
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Section = mongoConn.models['Section']

            const count = await Section.deleteMany(
                {
                    table_id: data.table_id,
                }
            )
            for (const sectionReq of data.sections) {
                const section = new Section(sectionReq);
                section.table_id = data.table_id;
                var response = section.save();
            }

            const resp = await Table.updateOne({
                id: data.table_id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                })

            return;
        } catch (err) {
            throw err
        }

    }),
    upsertViewRelations: catchWrapDb(`${NAMESPACE}.upsertViewRelations`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const ViewRelation = mongoConn.models['ViewRelation']

            await ViewRelation.deleteMany(
                {
                    table_slug: data.table_slug,
                }
            )
            if (data.table_slug === "") {
                // const table = await Table.findOne({
                //     id: data.table_id,
                // })
                const table = await tableVersion(mongoConn, { id: data.table_id }, data.version_id, true)
                data.table_slug = table.slug
            }
            let viewRelationReq = {}
            viewRelationReq["id"] = v4()
            viewRelationReq["relations"] = data.view_relations
            viewRelationReq["table_slug"] = data.table_slug

            const viewRelation = new ViewRelation(viewRelationReq);
            viewRelation.table_slug = data.table_slug;
            viewRelation.save();

            // console.log("TEST::::::::1")

            const viewRelationPermissionTable = (await ObjectBuilder(true, data.project_id))["view_relation_permission"]
            await viewRelationPermissionTable.models.deleteMany(
                {
                    table_slug: data.table_slug,
                }
            )
            // console.log("TEST::::::::2")
            const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
            const roles = await roleTable?.models.find()
            // console.log("TEST::::::::3", roles)
            for (const role of roles) {
                let view_relations = data.view_relations ? data.view_relations : []
                // console.log("TEST::::::::4", view_relations)
                for (const relation of view_relations) {
                    let is_exist_view = await viewRelationPermissionTable?.models.findOne({
                        $and: [
                            {
                                table_slug: data.table_slug,
                            },
                            {
                                relation_id: relation.relation_id,
                            },
                            {
                                role_id: role.guid
                            }
                        ]
                    }).lean()
                    // console.log("TEST::::::::5", is_exist_view)
                    if (!is_exist_view) {
                        // console.log("TEST::::::::6")
                        let permissionViewRelation = {
                            table_slug: data.table_slug,
                            relation_id: relation.relation_id,
                            view_permission: true,
                            guid: v4(),
                            role_id: role.guid
                        }

                        const viewRelationPermission = new viewRelationPermissionTable.models(permissionViewRelation)
                        viewRelationPermission.save()
                    }
                }
            }

            await Table.updateOne({
                id: data.table_id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                })

            return;
        } catch (err) {
            throw err
        }
    }),
    getAllViewRelations: catchWrapDb(`${NAMESPACE}.getAllViewRelations`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Relation = mongoConn.models['Relation']
            const ViewRelation = mongoConn.models['ViewRelation']

            let table = {};
            if (data.table_slug === "") {
                // table = await Table.findOne({
                //     slug: data.table_id
                // });
                table = await tableVersion(mongoConn, { slug: data.table_id }, data.version_id, true)
                data.table_slug = table.slug;
            }
            let query = {
                table: data.table_slug,
            }
            let view_relations = await ViewRelation.find(
                {
                    table_slug: data.table_slug,
                },
                null,
                {
                    sort: { created_at: -1 }
                }
            ).skip(data.offset)
                .limit(data.limit);
            let newRelations = []
            for (let index = 0; index < view_relations.length; index++) {
                let newRelation = { ...view_relations[index] }
                const relationBody = await Relation.findOne({ id: view_relations[index].relation_id })
                newRelation._doc.relation = relationBody
                newRelations.push(newRelation._doc)
            }

            const count = await ViewRelation.countDocuments(query);
            return { view_relations: newRelations, count: count };

        } catch (err) {
            throw err
        }
    }),
    getSingleViewRelation: catchWrapDb(`${NAMESPACE}.getSingleViewRelation`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const ViewRelation = mongoConn.models['ViewRelation']

            let table = {};
            if (data.table_slug === "") {
                // table = await Table.findOne({
                //     id: data.table_id
                // });
                table = await tableVersion(mongoConn, { id: data.table_id }, data.version_id, true);
                data.table_slug = table.slug;
            }
            let resp = {}
            const view_relation = await ViewRelation.findOne(
                {
                    table_slug: data.table_slug,
                }
            )
            let newRelations = []
            if (!view_relation) {
                return resp;
            }
            const { relations } = await relationStore.getAllForViewRelation({
                table_slug: view_relation.table_slug,
                role_id: data.role_id,
                project_id: data.project_id
            })
            let viewRelationWithPermissions = await AddPermission.toViewRelation(relations, data.role_id, data.table_slug, data.project_id)

            if (view_relation.relations) {
                for (let index = 0; index < view_relation.relations.length; index++) {
                    let newRelation = { ...view_relation.relations[index] }

                    if (newRelation.view_relation_type !== "FILE") {
                        let relationWithPermission = viewRelationWithPermissions.find(obj => obj.relation_id === newRelation.relation_id)
                        newRelation["relation"] = relationWithPermission
                    }
                    newRelations.push(newRelation)
                }
            }
            return {
                id: view_relation.id,
                table_slug: view_relation.table_slug,
                relations: newRelations,
            }
        } catch (err) {
            throw err
        }

    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Section = mongoConn.models['Section']
            const View = mongoConn.models['View']
            const Relation = mongoConn.models['Relation']

            let table = {};
            if (!data.table_id) {
                // table = await Table.findOne({
                //     slug: data.table_slug,
                // });
                table = await tableVersion(mongoConn, { slug: data.table_slug }, data.version_id, true);
                // console.log("bbbbb::", table);
                data.table_id = table.id;
            }
            // console.log("table id:::: " + table?.id);
            // console.log("table:::: " + table);

            let query = {}
            // if (data.table_id) {
            //     query.table_id = data.table_id;
            // }
            if (data.tab_id) {
                query.tab_id = data.tab_id;
            }

            const sections = await Section.find(
                query,
                null,
                {
                    sort: { order: 1 }
                }
            );
            // console.log("length: " + sections.length);
            let sectionsResponse = []
            for (const section of sections) {
                // console.log("Section: " + section.fields);
                let fieldsRes = [], fieldsWithPermissions = []
                for (const fieldReq of section.fields) {
                    let guid;
                    let field = {};
                    let encodedAttributes = {};
                    if (fieldReq.id.includes("#")) {
                        field.id = fieldReq.id
                        field.label = fieldReq.field_name
                        field.label_uz = fieldReq.field_name_uz
                        field.label_en = fieldReq.field_name_en
                        field.order = fieldReq.order
                        field.relation_type = fieldReq.relation_type
                        field.show_label = fieldReq.show_label || false
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
                        let fieldAsAttribute = []
                        let view_of_relation;
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
                            view_of_relation = await View.findOne({
                                relation_id: relation.id,
                                relation_table_slug: data.table_slug
                            })
                            field.is_editable = view_of_relation?.is_editable || false
                            // console.log(">>>>> field", field)
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
                                    // const dynamicTableInfo = await Table.findOne(
                                    //     {
                                    //         slug: dynamic_table.table_slug,
                                    //     },
                                    //     {
                                    //         deletedAt: 0,
                                    //         deleted_at: 0,
                                    //         createdAt: 0,
                                    //         updatedAt: 0,
                                    //         created_at: 0,
                                    //         updated_at: 0,
                                    //         _id: 0,
                                    //         __v: 0
                                    //     }
                                    // )
                                    const dynamicTableInfo = await tableVersion(mongoConn, { slug: dynamic_table.table_slug }, data.version_id, true)
                                    dynamicTableToAttribute = dynamic_table
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
                                        if (view_field) {
                                            if (view_field.attributes) {
                                                view_field.attributes = struct.decode(view_field.attributes)
                                            }
                                            viewFieldsInDynamicTable.push(view_field._doc)
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
                                originalAttributes = {... struct.decode(view_of_relation.attributes || {})}
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
                        fieldsRes.push(field)
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
                            fieldsRes.push(field);

                        }
                    }
                }
                // this function add field permission for each field by role iddynamicTableInfo
                fieldsWithPermissions = await AddPermission.toField(fieldsRes, data.role_id, data.table_slug ? data.table_slug : table.slug, data.project_id)
                section.fields = fieldsWithPermissions
                sectionsResponse.push(section)
            }
            return { sections: sectionsResponse };

        } catch (err) {
            throw err
        }

    })

};

module.exports = sectionStore;