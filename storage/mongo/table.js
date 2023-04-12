const cfg = require('../../config/index')
const catchWrapDb = require("../../helper/catchWrapDb");
const con = require("../../config/kafkaTopics");
const sendMessageToTopic = require("../../config/kafka");
const ObjectBuilder = require("../../models/object_builder");
const { v4 } = require("uuid");

const mongoPool = require('../../pkg/pool');




let NAMESPACE = "storage.table";


let tableStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table_history']
            const App = mongoConn.models['App']

            const table = new Table(data);
            const response = await table.save();
            if(response) {
                let payload = {}
                
                payload = Object.assign(payload, response._doc)
                delete payload._id
                payload.action_type = "CREATE",
                payload.action_time = new Date()
                const history_resp = await TableHistory.create(payload)
                
                response.commit_guid = history_resp.guid
                await response.save()
            }
            const recordPermissionTable = (await ObjectBuilder(true, data.project_id))["record_permission"]
            const roleTable = (await ObjectBuilder(true, data.project_id))["role"]
            const roles = await roleTable?.models.find()
            for (const role of roles) {
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

            await App.updateOne(
                {
                    id: data.app_id
                },
                {
                    $addToSet:
                    {
                        tables:
                        {
                            table_id: table.id,
                            is_visible: true,
                            is_own_table: true
                        }
                    }
                }
            );
            return response;
        } catch (err) {
            throw err
        }

    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table_history']

            data.is_changed = true
            let del_payload = {id: data.id, version_ids: []}
            if(data.version_id) {
                del_payload.version_ids = { $in: [data.version_id] }
            }
            const tableBeforeUpdate = await Table.findOneAndDelete({
                id: data.id
            }, {new: true})
            const table = await Table.create(data)
            if(table) {
                let payload = {}
                
                payload = Object.assign(payload, table._doc)
                delete payload._id
                payload.action_type = "UPDATE",
                payload.action_time = new Date()
                const history_resp = await TableHistory.create(payload)
                
                table.commit_guid = history_resp.guid

                await table.save()
            }
            data["older_slug"] = tableBeforeUpdate.slug
            let event = {}
            event.payload = data
            event.project_id = data.project_id
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


            await sendMessageToTopic(con.TopicTableUpdeteV1, event)
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

            let query = {
                deleted_at: "1970-01-01T18:00:00.000+00:00",
                name: RegExp(data.search, "i")
            }

            let params = {version_ids: [], deleted_at: "1970-01-01T18:00:00.000+00:00",}
            if(data.version_id) {
                params.version_ids = { $in: [data.version_id] }
            }
            const tables = await Table.find(
                params,
                null,
                {
                    sort: { created_at: -1 }
                }
            )
            .skip(data.offset)
            .limit(data.limit);

            const count = await Table.countDocuments(params);
            return { tables, count };
        } catch (err) {
            throw err
        }

    }),
    getByID: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']

            let params = {id: data.id, version_ids: []}
            if(data.version_id) {
                params.version_ids = { $in: [data.version_id] }
            }

            const table = await Table.findOne(params, {}, { sort: { created_at: -1 }});

            return table;

        } catch (err) {
            throw err
        }
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table_history']
            const Field = mongoConn.models['Field']
            const Section = mongoConn.models['Section']
            const Relation = mongoConn.models['Relation']

            let payload = {id: data.id, version_ids: []}
            if(data.version_id) {
                payload.version_ids = { $in: [data.version_id] }
            }
            const table = await Table.findOne(payload)
            if(!table) throw new Error("Table not found with given parameters")
            if(table) {
                let payload = {}
                
                payload = Object.assign(payload, table._doc)
                delete payload._id
                payload.action_type = "DELETE",
                payload.action_time = new Date()
                const history_resp = await TableHistory.create(payload)
                
                table.commit_guid = history_resp.guid

                await table.save()
            }
            const resp = await Table.updateOne(
                payload,
                {
                    $set: {
                        deleted_at: Date.now(),
                    }
                }
            );

            const getRelations = await Relation.find({
                $or: [
                    {
                        table_from: table.slug
                    },
                    {
                        table_to: table.slug
                    }
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

            const fields = await Field.deleteMany({
                table_id: params["table_id"]
            });
            if (relation_ids.length) {
                const fields = await Field.deleteMany({
                    relation_id: params["relation_id"]
                });
            }
            const sections = await Section.deleteMany({
                table_id: data.id
            });

            const relations = await Relation.deleteMany({
                $or: [
                    {
                        table_from: table.slug
                    },
                    {
                        table_to: table.slug
                    }
                ]
            });
            const fieldPermissionTable = (await ObjectBuilder(true, data.project_id))["field_permission"]
            const response = await fieldPermissionTable?.models.deleteMany({
                table_slug: table.slug
            })

            return table;
        } catch (err) {
            throw err
        }

    }),
};

module.exports = tableStore;
