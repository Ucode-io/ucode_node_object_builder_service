const catchWrapDb = require("../../helper/catchWrapDb");
const mongoPool = require('../../pkg/pool');


let NAMESPACE = "storage.file";

let fileStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {

        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['File']
        const response = await Files.create(data);

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['File']

        const file = await Files.updateOne(
            {
                id: data.id,
            },
            {
                $set: {
                    description: data.description,
                    file_name_download: data.file_name_download,
                    tags: data.tags,
                    title: data.title
                }
            }
        )

        return file;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {   
        
        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['File']

        let query = {}
        if (data.search != "") {
            query = {
                    title: { $regex: ".*" + data.search + ".*", $options: "i" }
                    }
        }
        switch (data.sort) {
            case "asc":
                query = {
                    ...query,
                    sort: { createdAt: -1 }
                };
                break;
            case "desc":
                query = {
                    ...query,
                    sort: { createdAt: 1 }
                };
                break;
            }
        const files = await Files.find(query, {});

        const count = await Files.countDocuments(query);
        return {files, count};
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {   
        
        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['File']
        
        const file = await Files.findOne(
        {
            id: data.id
        },
        {
            _id: 0,
            created_at: 0,
            updated_at: 0,
            __v: 0
        });
        return file;
    }
    ),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['File']

        const resp = await Files.deleteMany({id: {$in: data.ids}});

        return resp;
    }
    ),
};

module.exports = fileStore;
