const catchWrapDb = require("../../helper/catchWrapDb");
const tableVersion = require("../../helper/table_version")
const mongoPool = require('../../pkg/pool');

let NAMESPACE = "storage.custom_error_message";

let customErrorMessageStore = {
    createAll: catchWrapDb(`${NAMESPACE}.createAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const CustomErrorMessage = mongoConn.models['CustomErrorMessage']

            for (const customErrMsgReq of data.custom_error_messages) {
                const customErrMsg = new CustomErrorMessage(customErrMsgReq);
                customErrMsg.table_id = data.id;
                var response = customErrMsg.save();
            }
            await Table.updateOne({
                id: data.id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                })

            return response;
        } catch (err) {
            throw err
        }
    }),
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const CustomErrorMessage = mongoConn.models['CustomErrorMessage']

            const customErrMsg = new CustomErrorMessage(data);
            var response = customErrMsg.save();

            await Table.updateOne({
                id: data.table_id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                }
            )
            return response;
        } catch (err) {
            throw err
        }
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const CustomErrorMessage = mongoConn.models['CustomErrorMessage']
            await CustomErrorMessage.updateOne({
                id: data.id,
            },
                {
                    $set: data
                }
            )

            await Table.updateOne({
                id: data.table_id,
            },
                {
                    $set: {
                        is_changed: true
                    }
                }
            )

            return;
        } catch (err) {
            throw err
        }

    }),
    getById: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const CustomErrorMessage = mongoConn.models['CustomErrorMessage']

            const customErrMsg = await CustomErrorMessage.findOne(
                {
                    id: data.id,
                },
            );
            return customErrMsg;
        } catch (err) {
            throw err
        }

    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const CustomErrorMessage = mongoConn.models['CustomErrorMessage']

            let table = {};
            if (data.table_id === "") {
                table = await tableVersion(mongoConn, { slug: data.table_slug }, data.version_id, true);
                data.table_id = table.id;
            }

            const custom_error_messages = await CustomErrorMessage.find(
                {
                    table_id: data.table_id,
                },
                null,
                {
                    sort: { created_at: -1 }
                }
            );
            return { custom_error_messages, count: custom_error_messages?.length };

        } catch (err) {
            throw err
        }

    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const CustomErrorMessage = mongoConn.models['CustomErrorMessage']

            await CustomErrorMessage.deleteOne(
                {
                    id: data.id,
                },
            );
            return;

        } catch (err) {
            throw err
        }

    }),
    getListForObject: catchWrapDb(`${NAMESPACE}.getListForObject`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const CustomErrorMessage = mongoConn.models['CustomErrorMessage']

            let table = await tableVersion(mongoConn, { slug: data.table_slug }, data.version_id, true);
            data.table_id = table.id;


            const custom_error_messages = await CustomErrorMessage.find(
                data,
                null,
                {
                    sort: { created_at: -1 }
                }
            );
            return { custom_error_messages, count: custom_error_messages?.length };

        } catch (err) {
            throw err
        }

    }),
};

module.exports = customErrorMessageStore;
