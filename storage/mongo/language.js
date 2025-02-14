const catchWrapDb = require("../../helper/catchWrapDb");
const mongoPool = require('../../pkg/pool');

let NAMESPACE = "storage.language";

let languageStore = {
    getList: catchWrapDb(`${NAMESPACE}.getList`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Language = mongoConn.models["Language"];

            const languages = await Language.find(
                query,
                { _id: 0, __v: 0 },
                { sort: { created_at: -1 } }
            ).skip(data.offset || 0).limit(data.limit || 0);

            const count = await Language.countDocuments(query);
            return { languages, count };
        } catch (error) {
            throw error;
        }
    }),

    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Language = mongoConn.models["Language"];
            data.updated_at = new Date().toISOString();

            return await Language.updateOne({ id: data.id }, { $set: data });
        } catch (error) {
            throw error;
        }
    })
};

module.exports = languageStore;
