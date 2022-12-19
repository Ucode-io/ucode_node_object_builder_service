const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");


const mongoPool = require('../../pkg/pool');

// const mongoConn = await mongoPool.get(data.project_id)
// const table = mongoConn.models['Table']
// const Field = mongoConn.models['Field']
// const Section = mongoConn.models['Section']
// const App = mongoConn.models['App']
// const View = mongoConn.models['View']
// const Relation = mongoConn.models['Relation']
// const ViewRelation = mongoConn.models['ViewRelation']
// const Function = mongoConn.models['Function']
let NAMESPACE = "storage.function";

let functionStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Function = mongoConn.models['Function']


            const func = new Function(data);

            const response = await func.save();

            return response;
        } catch (err) {
            throw err
        }

    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Function = mongoConn.models['Function']

            const func = await Function.updateOne(
                {
                    id: data.id,
                },
                {
                    $set: data
                }
            )

            return func;

        } catch (err) {
            throw err
        }

    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Function = mongoConn.models['Function']

            let query = {
                name: RegExp(data.search, "i"),
                path: RegExp(data.search, "i"),
            }
            const functions = await Function.find({
                $or: [{
                    name: RegExp(data.search, "i")
                },
                {
                    path: RegExp(data.search, "i")
                }
                ]
            },
                null,
                {
                    sort: { created_at: -1 }
                }
            ).limit(data.limit);

            const count = await Function.countDocuments(query);
            return { functions, count };

        } catch (err) {
            throw err
        }


    }
    ),
    getByID: catchWrapDb(`${NAMESPACE}.getByID`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Function = mongoConn.models['Function']


            const func = await Function.findOne({ id: data.id });
            return func;

        } catch (err) {
            throw err
        }

    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Function = mongoConn.models['Function']

            const func = await Function.deleteOne({ id: data.id });

            return func;

        } catch (err) {
            throw err
        }

    }
    ),
};

module.exports = functionStore;
