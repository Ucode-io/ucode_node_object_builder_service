const Query = require("../../models/query");
const catchWrapDb = require("../../helper/catchWrapDb");

let NAMESPACE = "storage.query"

let query = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        const query = new Query(data);
        var response = await query.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        const queryUpdate = await Query.findOneAndUpdate(
            {
                id: data.id,
            },
            {
                $set: data
            },
            {
                new: true
            }
        )
        return queryUpdate;
    }),
    getById: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        const query = await Query.findOne({
            id: data.id,
        })

        return query
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        const queries = await Query.find({

        }).skip(data.offset)
        .limit(data.limit);

        const count = await Query.countDocuments();
        return {queries: queries, count: count};
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        const query = await Query.deleteOne({
            id: data.id,
        })
    }),
};

module.exports = query;