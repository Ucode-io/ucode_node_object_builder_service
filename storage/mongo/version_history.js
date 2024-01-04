const catchWrapDb = require("../../helper/catchWrapDb");
const { struct } = require('pb-util');
const mongoPool = require('../../pkg/pool');
const { v4 } = require("uuid");
const { VIEW_TYPES } = require('../../helper/constants')
const { VERSION_SOURCE_TYPES_MAP, ACTION_TYPE_MAP } = require("../../helper/constants")



let NAMESPACE = "storage.version_history";

let versionHistoryStorage = {
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']

            const query = {
                is_used: {
                    $or: [
                        {
                            [data.env_id]: false
                        },
                        {
                            [data.env_id]: {
                                $exists: false
                            }
                        }
                    ]
                }
            }

            if (data.type) {
                query.action_source = data.type
            }

            const resp = await History.find(query).sort({created_at: -1})

            return resp

        } catch (err) {
            throw err
        }
    }),
    usedForEnv: catchWrapDb(`${NAMESPACE}.usedForEnv`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']

            const resp = await History.updateMany({
                id: {
                    $in: data.ids
                }
            }, {
                [`is_used.${data.env_id}`]: true
            })

            return resp

        } catch (err) {
            throw err
        }
    }),
    migrate: catchWrapDb(`${NAMESPACE}.migrate`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']

            const query = {
                is_used: {
                    $or: [
                        {
                            [data.env_id]: false
                        },
                        {
                            [data.env_id]: {
                                $exists: false
                            }
                        }
                    ]
                }
            }

            if (data.type) {
                query.action_source = data.type
            }

            const resp = await History.find(query).sort({created_at: -1})

            return resp

        } catch (err) {
            throw err
        }
    })
};

module.exports = versionHistoryStorage;
