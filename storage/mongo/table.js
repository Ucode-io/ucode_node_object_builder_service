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
    GetListTableHistory: catchWrapDb(`${NAMESPACE}.GetListTableHistory`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table_history']

            const histories = (await TableHistory.find({id: data.table_id}).sort({created_at: -1})).map(el => {
                return {
                    ...el,
                    id: el.guid,
                    created_at: el.created_at
                }
            })
            
            return { items: histories };
        } catch (err) {
            throw err
        }

    }),
    GetTableHistoryById: catchWrapDb(`${NAMESPACE}.GetTableHistoryById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table_history']

            const table = await TableHistory.findOne({guid: data.id})
            if(!table) {
                throw new Error("Table not found with given parameters")
            }
            
            return table
        } catch (err) {
            throw err
        }

    }),
    RevertTableHistory: catchWrapDb(`${NAMESPACE}.RevertTableHistory`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table_history']

            let table = await TableHistory.findOne({guid: data.id}).lean()
            if(!table) {
                throw new Error("Table not found with given parameters")
            }

            delete table._id,
            delete table.guid
            table.version_ids = []
            table.action_type = "REVERT"
            table.action_time = new Date()
            table.created_at = new Date()
            let reverted = await TableHistory.create(table)

            const deleted = await Table.findOneAndDelete({
                id: reverted.id,
                version_ids: []
            })
            if(!deleted) {
                await TableHistory.findOneAndDelete({guid: reverted.guid})
                throw new Error("Table not deleted with given parameters")
            }

            let payload = Object.assign({}, reverted._doc)

            delete payload._id
            delete payload.guid
            payload.commit_guid = reverted.guid
            payload.version_ids = []
            
            const new_table = await Table.create(payload)
            
            let resp = Object.assign({}, reverted._doc)
            resp.id = resp.guid
            resp.created_at = resp.created_at

            return resp
        } catch (err) {
            throw err
        }

    }),
    InsertVersionsToCommit: catchWrapDb(`${NAMESPACE}.InsertVersionsToCommit`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table_history']

            const found_history = await TableHistory.findOne({guid: data.id})
            if(!found_history) {
                throw new Error("Table history not found with given parameters")
            }

            let resp = []
            const histories = await TableHistory.find({id: found_history.id})
            for(let h of histories) {
                if(h.guid === data.id) { 
                    h.version_ids = data.version_ids
                    resp.push({
                        id: h.guid,
                        created_at: h.created_at,
                        version_ids: h.version_ids
                    })
                    await h.save()
                    continue 
                }
                let r_count = 0
                for(let id of data.version_ids) {
                    const index = h.version_ids.indexOf(id)
                    if(index != -1) {
                        const rem = h.version_ids.splice(index, 1)
                        r_count += 1
                    }
                }

                if(r_count) {
                    await h.save()
                }
                resp.push({
                    id: h.guid,
                    created_at: h.created_at,
                    version_ids: h.version_ids
                })
            }

            const tables = await Table.find({id: found_history.id})
            let found_t = false
            for(let t of tables) {
                if(t.commit_guid == data.id) {
                    found_t = true
                    t.version_ids = data.version_ids
                    await t.save()
                    continue
                } 
                let r_count = 0
                for(let id of data.version_ids) {
                    const index = t.version_ids.indexOf(id)
                    if(index != -1) {
                        const rem = t.version_ids.splice(index, 1)
                        r_count += 1
                    }
                }

                if(r_count && !t.version_ids.length && data.version_ids.length) {
                   await Table.findOneAndDelete({_id: t._id})
                } else if (r_count && t.version_ids.length){
                    await t.save()
                }
            }

            if(!found_t && data.version_ids.length) {
                let payload = {
                    id: found_history.id,
                    commit_guid: data.id,
                    version_ids: data.version_ids,
                    label: found_history.label,
                    slug: found_history.slug,
                    description: found_history.description,
                    deleted_at: '1970-01-01T18:00:00.000+00:00',
                    show_in_menu: true,
                    is_changed: true,
                    icon: found_history.icon,
                    subtitle_field_slug: found_history.subtitle_field_slug,
                    created_at: new Date(),
                    update_at: new Date()
                }

                const a = await Table.create(payload)
            }
            
            return { items: resp};
        } catch (err) {
            throw err
        }

    }),
};

module.exports = tableStore;
