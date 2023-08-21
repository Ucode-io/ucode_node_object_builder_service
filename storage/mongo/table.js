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
            const TableHistory = mongoConn.models['Table.history']
            const App = mongoConn.models['App']

            const table = new Table(data);
            const response = await table.save();
            if (response) {
                let payload = {}

                payload = Object.assign(payload, response._doc)
                delete payload._id
                payload.commit_type = data.commit_type,
                    payload.name = data.name,
                    payload.action_time = new Date()
                payload.author_id = data.author_id
                const tableHistory = await TableHistory.create(payload)

                table.commit_guid = tableHistory.guid
                await table.save()
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
            const TableHistory = mongoConn.models['Table.history']

            data.is_changed = true

            const isSystemTable = await Table.findOne({
                id: data.id
            })

            if(isSystemTable && isSystemTable.is_system) {
                throw  new Error("This table is system table")
            }

            let tableBeforeUpdate = await Table.findOneAndDelete({
                id: data.id,
            })
            
            const table = await Table.create(data)
            if (table) {
                let payload = {}

                payload = Object.assign(payload, table._doc)
                delete payload._id
                payload.commit_type = data.commit_type,
                    payload.name = data.name,
                    payload.action_time = new Date()
                payload.author_id = data.author_id
                const tableHistory = await TableHistory.create(payload)
                table.commit_guid = tableHistory.guid
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

            // await sendMessageToTopic(con.TopicTableUpdeteV1, event)
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
            const TableVersion = mongoConn.models['Table.version']
            const TablePermissions = (await ObjectBuilder(true, data.project_id))['record_permission']

            let query = {
                deleted_at: "1970-01-01T18:00:00.000+00:00",
                label: RegExp(data.search, "i")
            }

            if (data.folder_id) {
                query.folder_id = data.folder_id
            }
            if (data.is_login_table) {
                query.is_login_table = data.is_login_table
            }

            let tables = [], tableSlugs = [];
            if (data.role_id) {
                let tablePermissions = await TablePermissions.models.find({ role_id: data.role_id, read: 'Yes' }).populate({ path: 'role_id_data' })
                let isDefaultAdmin = false
                for (const permission of tablePermissions) {
                    if (permission?.role_id_data?.name === 'DEFAULT ADMIN') {
                        isDefaultAdmin = true;
                        break;
                    }
                    tableSlugs.push(permission.table_slug)
                };
                if (!tableSlugs.length && !isDefaultAdmin) {
                    return { tables: [], count: 0 }
                } else {
                    if (!isDefaultAdmin) {
                        query["slug"] = { $in: tableSlugs }
                    }
                }
            }

            if (data.version_id) {
                query.version_id = data.version_id
                tables = await TableVersion.find(query).skip(data.offset).limit(data.limit)
            } else {
                tables = await Table.find(
                    query,
                    null,
                    {
                        sort: { created_at: -1 }
                    }
                )
                    .skip(data.offset)
                    .limit(data.limit)
            }


            const count = await Table.countDocuments(query);
            return { tables, count };
        } catch (err) {
            throw err
        }

    }),
    getByID: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableVersion = mongoConn.models['Table.version']
            const TableHistory = mongoConn.models['Table.history']

            let params = { id: data.id }
            let table = null
            if (data.version_id) {
                params.version_id = data.version_id
                table = await TableVersion.findOne(params).lean()

            } else {
                table = await Table.findOne(params).lean()

            }

            if (table) {
                const history = await TableHistory.findOne({ guid: table.commit_guid }).lean()
                if (history) {
                    history.id = history.guid
                    history.version_ids = []
                    let version_ids = await TableVersion.find({ commit_guid: history.guid })
                    for (let el of version_ids) {
                        history.version_ids.push(el.version_id)
                    }

                    table.commit_info = {
                        id: history.guid,
                        version_ids: version_ids,
                        commit_type: history.commit_type,
                        created_at: history.created_at,
                        name: history.name
                    }
                }
            }
            // console.log(":::::::::::::::::::: test 1", table)
            return table
        } catch (err) {
            throw err
        }
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table.history']
            const TableVersion = mongoConn.models['Table.version']
            const Field = mongoConn.models['Field']
            const Section = mongoConn.models['Section']
            const Relation = mongoConn.models['Relation']

            let payload = { id: data.id}
            if (data.version_id) {
                payload.version_ids = { $in: [data.version_id] }
            }
            const table = await Table.findOne(payload)
            if (!table) throw new Error("Table not found with given parameters")
            if(table.is_system) {
                throw  new Error("This table is system table")
            }
            if (table) {
                let payload = {}

                payload = Object.assign(payload, table._doc)
                delete payload._id
                payload.commit_type = data.commit_type,
                    payload.name = data.name,
                    payload.action_time = new Date()
                payload.author_id = data.author_id
                const history_resp = await TableHistory.create(payload)

                table.commit_guid = history_resp.guid
                await table.save()
            }
            let resp = {}
            if(data.version_id) {
                resp = await TableVersion.updateOne(
                    payload,
                    {
                        $set: {
                            deleted_at: Date.now(),
                        }
                    }
                );
            } else {
                resp = await Table.updateOne(
                    payload,
                    {
                        $set: {
                            deleted_at: Date.now(),
                        }
                    }
                );
            }

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
            const tablePermission = (await ObjectBuilder(true, data.project_id))["record_permission"]
            tablePermission?.models?.deleteMany({ table_slug: table.slug })

            return table;
        } catch (err) {
            throw err
        }

    }),
    GetListTableHistory: catchWrapDb(`${NAMESPACE}.GetListTableHistory`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table.history']
            const TableVersion = mongoConn.models['Table.version']

            const histories = await TableHistory.find({ id: data.table_id }).sort({ created_at: -1 })
            const versions = await TableVersion.aggregate([
                {
                    $match: {
                        id: data.table_id
                    }
                },
                {
                    $group: {
                        _id: "$commit_guid",
                        itemSold: {
                            $push: {
                                version_id: "$version_id",
                            }
                        }
                    },
                }
            ])

            let map_versions = {}
            for (let el of versions) {
                map_versions[el._id] = el.itemSold.map(el => el.version_id)
            }
            let result = []
            for (let el of histories) {

                result.push({
                    name: el.name,
                    version_ids: map_versions[el.guid],
                    id: el.guid,
                    created_at: el.created_at,
                    commit_type: el.commit_type
                })
            }

            return { items: result };
        } catch (err) {
            throw err
        }

    }),
    GetTableHistoryById: catchWrapDb(`${NAMESPACE}.GetTableHistoryById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table.history']
            const TableVersion = mongoConn.models['Table.version']

            const table = await TableHistory.findOne({ guid: data.id }).lean()
            if (!table) {
                throw new Error("Table not found with given parameters")
            }
            const version_ids = await TableVersion.find({ commit_guid: table.guid }, { version_id: 1 })
            table.version_ids = []
            table.id = table.guid
            for (let el of version_ids) {
                table.version_ids.push(el.version_id)
            }
            return table
        } catch (err) {
            let ids = []
            throw err
        }

    }),
    RevertTableHistory: catchWrapDb(`${NAMESPACE}.RevertTableHistory`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const TableHistory = mongoConn.models['Table.history']

            let table = await TableHistory.findOne({ guid: data.id }).lean()
            if (!table) {
                throw new Error("Table not found with given parameters")
            }

            delete table._id,
                delete table.guid
            table.version_ids = []
            table.commit_type = data.commit_type
            table.name = data.name
            table.action_time = new Date()
            table.created_at = new Date()
            let reverted = await TableHistory.create(table)

            const deleted = await Table.findOneAndDelete({
                id: reverted.id,
            })
            if (!deleted) {
                await TableHistory.findOneAndDelete({ guid: reverted.guid })
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
            const TableHistory = mongoConn.models['Table.history']
            const TableVersion = mongoConn.models['Table.version']

            const history = await TableHistory.findOne({ guid: data.id }).lean()

            const deleted = await TableVersion.deleteMany({ version_id: { $in: data.version_ids } })

            let payload = []
            for (let el of data.version_ids) {
                payload.push({
                    id: history.id,
                    label: history.label,
                    slug: history.slug,
                    description: history.description,
                    show_in_menu: history.show_in_menu,
                    is_changed: history.is_changed,
                    icon: history.icon,
                    subtitle_field_slug: history.subtitle_field_slug,
                    version_id: el,
                    commit_guid: history.guid
                })
            }

            await TableVersion.insertMany(payload)
            history.id = history.guid
            history.version_ids = data.version_ids
            return history
        } catch (err) {
            throw err
        }
    }),
};

module.exports = tableStore;
