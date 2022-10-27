const App = require("../../models/app");
const Table = require("../../models/table");
const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const table = require("../../models/table");


let NAMESPACE = "storage.app";

let appStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {
        const app = new App(data);

        const response = await app.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
    
        const app = await App.updateOne(
            {
                id: data.id,
            },
            {
                $set: data
            }
        )
        
        return app;
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async(data) => {        
        let query = {
            name: RegExp(data.search,"i"),
        }
        const apps = await App.find(
            {
                name: RegExp(data.search,"i"),
            },
            null,
            {
                sort: {created_at: -1}
            }
        ).skip(data.offset)
        .limit(data.limit);

        const count = await App.countDocuments(query);
        return {apps, count};
    }
    ),
    getByID: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        const app = await App.findOne({id: data.id});
        let tables = []
        if (app.tables) {
            for (const single_table of app.tables) {
                let table = {}
                table = await Table.findOne({id:single_table.table_id, deleted_at: "1970-01-01T18:00:00.000+00:00"})
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
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const app = await App.deleteOne({id: data.id});

        return app;
    }
    ),
};

module.exports = appStore;
