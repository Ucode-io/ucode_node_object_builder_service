const Document = require("../../models/document");
const catchWrapDb = require("../../helper/catchWrapDb");

let NAMESPACE = "storage.document";

let documentStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {
        const document = new Document(data);

        const response = await document.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
        const document = await Document.updateOne(
            {
                id: data.id,
            },
            {
                $set: data
            }
        )

        return document;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {        
        let query = {
            object_id: data.object_id,
        }
        if (data.start_date && data.end_date) {
            let startDate = new Date(data.start_date)
            let endDate = new Date(data.end_date)
            endDate.setDate(endDate.getDate()+1)
            query["created_at"] = {
                $gte: startDate.toISOString(),
                $lt: endDate.toISOString()
            }
        }
        if (data.tags) {
            let splitedTags = data.tags.split(",")
            query["tags"] = {$in: splitedTags}
        }
        const documents = await Document.find(
            query,
            null,
            {
                sort: {created_at: -1}
            }
        );
        const count = await Document.countDocuments(query);
        return {documents, count};
    }),
    getSingle: catchWrapDb(`${NAMESPACE}.getSingle`, async(data) => {     
        const document = await Document.findOne(
        {
            id: data.id
        },
        {
            _id: 0,
            created_at: 0,
            updated_at: 0,
            __v: 0
        });
        return document;
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const document = await Document.findOne({id:data.id})

        const resp = await Document.deleteOne({id: data.id});

        return resp;
    }),

}
module.exports = documentStore
