const catchWrapDb = require("../../helper/catchWrapDb");
// const { v4 } = require("uuid");
const mongoPool = require('../../pkg/pool');

let NAMESPACE = "storage.query_folder"

let queryFolder = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const TableFolder = mongoConn.models["Table.folder"]

        const tableFolder = new TableFolder(data);
        var response = await tableFolder.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const TableFolder = mongoConn.models["Table.folder"]

        const tableFolderUpdate = await TableFolder.findOneAndUpdate(
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
        return tableFolderUpdate;
    }),
    getById: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const TableFolder = mongoConn.models["Table.folder"]

        const tableFolder = await TableFolder.findOne({
            id: data.id,
        })

        return tableFolder
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const TableFolder = mongoConn.models["Table.folder"]

        const queryFolders = await TableFolder.find({}).skip(data.offset).limit(data.limit);
    
        const count = await TableFolder.countDocuments();
        return {folders: queryFolders, count: count};
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const TableFolder = mongoConn.models["Table.folder"]

        const queryFolder = await TableFolder.findOneAndDelete({
            id: data.id,
        })

        return queryFolder
    }),
};

module.exports = queryFolder;