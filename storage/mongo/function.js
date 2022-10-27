const Function = require("../../models/function");
const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");


let NAMESPACE = "storage.function";

let functionStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {
        const func = new Function(data);

        const response = await func.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
    
        const func = await Function.updateOne(
            {
                id: data.id,
            },
            {
                $set: data
            }
        )
        
        return func;
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async(data) => {        
        let query = {
            name: RegExp(data.search,"i"),
            path: RegExp(data.search,"i"),
        }
        const functions = await Function.find({
            $or: [{
                    name: RegExp(data.search,"i")
                },
                {
                    path: RegExp(data.search,"i")                   
                }
            ]},
            null,
            {
                sort: {created_at: -1}
            }
        ).limit(data.limit);

        const count = await Function.countDocuments(query);
        return {functions, count};
    }
    ),
    getByID: catchWrapDb(`${NAMESPACE}.getByID`, async (data) => {
        const func = await Function.findOne({id: data.id});
        return func;
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const func = await Function.deleteOne({id: data.id});

        return func;
    }
    ),
};

module.exports = functionStore;
