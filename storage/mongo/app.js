const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const mongoPool = require('../../pkg/pool')
const tableVersion = require('../../helper/table_version')
let NAMESPACE = "storage.app";


let appStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id)

            const App = mongoConn.models['App']

            const app = new App(data);

            const response = await app.save();

            return response;
        } catch (err) {
            throw err
        }

    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)

            const App = mongoConn.models['App']
            const Table = mongoConn.models['Table']

            const app = await App.updateOne(
                {
                    id: data.id,
                },
                {
                    $set: data
                }
            )

            return app;
        } catch (err) {
            throw err
        }

    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id) // project_id: is resource_id

            const App = mongoConn.models['App']

            let query = {
                name: RegExp(data.search, "i"),
            }
            const apps = await App.find(
                {
                    name: RegExp(data.search, "i"),
                },
                null,
                {
                    sort: { created_at: -1 }
                }
            ).skip(data.offset)
                .limit(data.limit);

            const count = await App.countDocuments(query);
            return { apps, count };
        } catch (err) {
            throw err
        }

    }),
    getByID: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)

            const App = mongoConn.models['App']
            const Table = mongoConn.models['Table']

            const app = await App.findOne({ id: data.id });
            let tables = []
            if (app.tables) {
                for (const single_table of app.tables) {
                    // table = await Table.findOne({ id: single_table.table_id})
                    let table = await tableVersion(mongoConn, { id: single_table.table_id }, data.version_id, true)
                    if (table) {
                        tables.push({
                            ...table._doc,
                            is_visible: single_table.is_visible,
                            is_own_table: single_table.is_own_table,
                        })
                    }
                }
            }
            app.tables = tables
            return app;
        } catch (err) {
            throw err
        }


    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)

            const App = mongoConn.models['App']

            const app = await App.deleteOne({ id: data.id });

            return app;
        } catch (err) {
            throw err
        }
    }),
};

module.exports = appStore;
