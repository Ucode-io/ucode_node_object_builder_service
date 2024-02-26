const catchWrapDb = require("../../helper/catchWrapDb");
const mongoPool = require('../../pkg/pool');
const { v4 } = require("uuid");

let NAMESPACE = "storage.version";

let versionStorage = {
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Version = mongoConn.models['object_builder_service.version'];
    
            const pipeline = [];
    
            // Match stage for filtering by date range
            const matchStage = {};
            if (data.from_date) {
                matchStage.created_at = { $gt: new Date(data.from_date) };
            }
            if (data.to_date) {
                if (!matchStage.created_at) {
                    matchStage.created_at = {};
                }
                matchStage.created_at.$lte = new Date(data.to_date);
            }
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
    
            // Add stage for filtering by is_current field
            if (data.live) {
                pipeline.push({ $match: { is_current: data.live } });
            }
    
            // Add projection stage to convert created_at to string format
            const projectionStage = {
                $project: {
                    id: 1,
                    name: 1,
                    is_current: 1,
                    description: 1,
                    version_number: 1,
                    user_info: 1,
                    created_at: {
                        $dateToString: {
                            format: "%Y-%m-%dT%H:%M:%S.%LZ",
                            date: "$created_at"
                        }
                    }
                }
            };
            pipeline.push(projectionStage);

            const count  = await Version.countDocuments(pipeline);
            console.log('count', count)
    
            // Add sort, skip, and limit stages
            const sortStage = { $sort: { created_at: data.order_by ? 1 : -1 } };
            const skipStage = { $skip: data.offset || 0 };
            const limitStage = { $limit: data.limit || 10 };
    
            pipeline.push(sortStage, skipStage, limitStage);
    
            // Execute the aggregation pipeline
            const resp = await Version.aggregate(pipeline);
            
            // Count documents matching the query
            // const countPipeline = pipeline.slice(); // Create a copy of the pipeline
            // countPipeline.push({ $count: "count" });
            // const [{ count }] = await Version.aggregate(countPipeline);
    
            
            return { versions: resp, count: count || 0 };
        } catch (err) {
            throw err;
        }
    }),
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Version = mongoConn.models['object_builder_service.version']
            const History = mongoConn.models['object_builder_service.version_history']

            if(!data.id) {
                data.id = v4()
            }

            const result = await History.updateMany(
                { $or: [{ version_id: '' }, { version_id: { $exists: false } }] },
                { $set: { version_id: data.id } }
            );

            if (result.modifiedCount <= 0) {
                throw new Error("There are no documents to update in activity log")
            }

            const updateLive = await Version.updateMany({},
                {$set: { is_current: false }}
            )

            data.is_current = true

            const resp = await Version.create(data)

            


            return resp
        } catch (err) {
            throw err
        }
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Version = mongoConn.models['object_builder_service.version']

            const resp = await Version.updateOne(
                {
                    id: data.id,
                },
                {
                    $set: data
                }
            )

            return resp

        } catch (err) {
            throw err
        }
    }),
    createAll: catchWrapDb(`${NAMESPACE}.createAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Version = mongoConn.models['object_builder_service.version']
            const result = await Version.insertMany(data.versions);
            return {versions: result};
        } catch (error) {
            throw error;
        }
    }),
    getSingle: catchWrapDb(`${NAMESPACE}.getByID`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Version = mongoConn.models['object_builder_service.version']

            let query;
            if (data.id) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[8,9,a,b][0-9a-f]{3}-[0-9a-f]{12}$/i;
                const isUUID = uuidRegex.test(data.id);
                if (isUUID) {
                    query = { id: data.id };
                }
            } else if (data.live) {
                query = { is_current: data.live };
            }

            const resp = await Version.findOne(query);


            return {
                id: resp.id,
                name: resp.name,
                is_current: resp.is_current,
                description: resp.description,
                created_at: resp.created_at.toISOString(),
              }
        } catch (err) {
            throw err
        }
    }),
    updateLive: catchWrapDb(`${NAMESPACE}.updateLive`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Version = mongoConn.models['object_builder_service.version']
            const res = await Version.updateMany(
                {
                },
                {
                    $set: { is_current: false }
                }
            )

            const resp = await Version.updateOne(
                {
                    id: data.id,
                },
                {
                    $set: { is_current: true }
                }
            )

            return resp

        } catch (err) {
            throw err
        }
    }),
};

module.exports = versionStorage;
