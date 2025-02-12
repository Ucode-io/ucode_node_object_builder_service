const { data } = require("../../config/logger");
const catchWrapDb = require("../../helper/catchWrapDb");
const mongoPool = require('../../pkg/pool');

let NAMESPACE = "storage.function";

let functionStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Function = mongoConn.models["function_service.function"];

            if (!data.request_type || data.request_type == "") {
                data.request_type = "ASYNC"
            }
            const func = new Function(data);

            func.request_time = new Date().toISOString();

            return await func.save();
        } catch (error) {
            throw error;
        }
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Function = mongoConn.models["function_service.function"];
            return await Function.updateOne( { id: data.id }, { $set: data } );
        } catch (error) {
            throw error;
        }
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Function = mongoConn.models["function_service.function"];
            let query = { type: { $in: data.type } };
            
            if (data.search) { query.name = RegExp(data.search, "i") }

            const functions = await Function.find(
                query,
                { _id: 0, __v: 0 },
                { sort: { created_at: -1 } }
            ).skip(data.offset).limit(data.limit);

            const count = await Function.countDocuments(query);
            return { functions, count };
        } catch (error) {
            throw error;
        }
    }),
    getByID: catchWrapDb(`${NAMESPACE}.getByID`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Function = mongoConn.models["function_service.function"];
            let query = {}
            if (data.id) {
                query = { id: data.id }
            } else if (data.path) {
                query = { path: data.path}
            } else if (data.source_url && data.branch) {
                query = { source_url: data.source_url, branch: data.branch }  
            }

            const func = await Function.findOne(query);
            await Function.updateOne(
                { id: data.id },
                { request_time: new Date().toISOString() }
            );

            return func;
        } catch (error) {
            throw error;
        }
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Function = mongoConn.models["function_service.function"];
            return await Function.deleteOne({ id: data.id });
        } catch (error) {
            throw error;
        }
    }),
    getAllByRequestTime: catchWrapDb(`${NAMESPACE}.getAllByRequestTime`, async (data) => {
        try {
            let newDate = new Date();
            let date = subHours(newDate, 1).toISOString();
            let mongoConn = await mongoPool.get(data.project_id);
    
            const Function = mongoConn.models["function_service.function"];
            const functions = await Function.find({
                request_time: {
                    $lte: date,
                },
                type: data.type
            });

            const count = await Function.countDocuments({
                request_time: {
                    $lte: date,
                },
                type: data.type
            });
            return { functions, count };
        } catch (error) {
            throw error;
        }
    }),
    updateManyByRequestTime: catchWrapDb(`${NAMESPACE}.updateManyByRequestTime`, async (data) => {
        try {
            let mongoConn = await mongoPool.get(data.project_id);
            if (!mongoConn) {
                await projectStore.autoConnect();
                mongoConn = await mongoPool.get(data.project_id);
            }

            const Function = mongoConn.models["function_service.function"];
            let functionBulk = [];
            data.ids.forEach((id) => {
                functionBulk.push({
                    updateOne: {
                        filter: { id: id },
                        update: { url: "" },
                    },
                });
            });
            await Function.bulkWrite(functionBulk);
        } catch (error) {
            throw error;
        }
    }),
    GetCountByType: catchWrapDb(`${NAMESPACE}.GetCountByType`, async(data) =>{
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Function = mongoConn.models["function_service.function"]

            const count = await Function.countDocuments({ type: {$in: data.type} })

            return { count: count }
        }catch(error){
            throw error
        }
    })
};

module.exports = functionStore;
