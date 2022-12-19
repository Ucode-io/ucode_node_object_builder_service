
const cfg = require('../../config/index')
const catchWrapDb = require("../../helper/catchWrapDb");
const con = require("../../config/kafkaTopics");
const sendMessageToTopic = require("../../config/kafka");
const ObjectBuilder = require("../../models/object_builder");

const mongoPool = require('../../pkg/pool');

let NAMESPACE = "storage.table";


let tableStore = {

    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {

        try {

            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const App = mongoConn.models['App']


            const table = new Table(data);
            const response = await table.save();

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


    }
    ),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']

            data.is_changed = true
            const tableBeforeUpdate = await Table.findOne({
                id: data.id
            })
            const table = await Table.updateOne(
                {
                    id: data.id,
                },
                {
                    $set: data
                }
            )
            data["older_slug"] = tableBeforeUpdate.slug
            let event = {}
            event.payload = data
            event.project_id = data.project_id || cfg.ucodeDefaultProjectID

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
                id: data.id,
                deleted_at: "1970-01-01T18:00:00.000+00:00",
            });

            return table;

        } catch (err) {
            throw err
        }

    }
    ),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']

            let query = {
                deleted_at: "1970-01-01T18:00:00.000+00:00",
                name: RegExp(data.search, "i")
            }
            const tables = await Table.find(
                {
                    deleted_at: "1970-01-01T18:00:00.000+00:00",
                    name: RegExp(data.search, "i")
                },
                null,
                {
                    sort: { created_at: -1 }
                }
            ).skip(data.offset)
                .limit(data.limit);

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

            const table = await Table.findOne({ id: data.id });

            return table;

        } catch (err) {
            throw err
        }
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const Field = mongoConn.models['Field']
            const Section = mongoConn.models['Section']
            const Relation = mongoConn.models['Relation']

            const table = await Table.findOne({
                id: data.id
            })
            const resp = await Table.updateOne(
                {
                    id: data.id
                },
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
            const fieldPermissionTable = (await ObjectBuilder())["field_permission"]
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
