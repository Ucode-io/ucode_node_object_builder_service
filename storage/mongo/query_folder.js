const QueryFolder = require("../../models/query_folder");
const catchWrapDb = require("../../helper/catchWrapDb");

let NAMESPACE = "storage.query_folder"

let queryFolder = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        const queryFolder = new QueryFolder(data);
        var response = await queryFolder.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        const queryFolderUpdate = await QueryFolder.findOneAndUpdate(
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
        return queryFolderUpdate;
    }),
    getById: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        const queryFolder = await QueryFolder.findOne({
            id: data.id,
        })

        return queryFolder
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        const queryFolders = await QueryFolder.find({

        }).skip(data.offset)
            .limit(data.limit);
    
        const count = await QueryFolder.countDocuments();
        return {folders: queryFolders, count: count};
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        const queryFolder = await QueryFolder.deleteOne({
            id: data.id,
        })
    }),
};

module.exports = queryFolder;