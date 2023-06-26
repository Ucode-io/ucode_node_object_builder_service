const logger = require("../config/logger");
const grpc = require("@grpc/grpc-js");
const { struct } = require("pb-util");
const mongoPool = require('../pkg/pool');
const ObjectBuilder = require("../models/object_builder");

module.exports = (namespace, fn) => {
    return async (call, callback) => {
        // logger.info(
        //     `${namespace}: requested - ${JSON.stringify(call.request, null, 2)}`
        // );

        try {
            const resp = await fn(call.request);

            logger.info(`${namespace}: succeeded`);
            // logger.info(`${namespace}: response - ${JSON.stringify(resp, null, 2)}`);
            callback(null, resp);
        } catch (error) {
            logger.error(`${namespace}: failed with error: ${error.message}`);
            let code = grpc.status.INTERNAL
            let message = error.message
            console.log("message", message);

            // this is for custom error message that user can write custom error for yourself
            const mongoConn = await mongoPool.get(call.request.project_id)
            const errorsTable = (await ObjectBuilder(true, call.request.project_id))["object_builder.custom_error"]
            if (error?.errors?.name?.kind) {
                err_name = error?.errors?.name?.kind
            } else if (error.message?.includes('duplicate key error')) {
                err_name = "duplicate"
            } else {
                err_name = error.message
            }
            const customError = await errorsTable?.models?.findOne({
                name: err_name
            })
            const table = await mongoConn?.models["Table"]?.findOne({
                slug: call.request.table_slug,
            })
            if (customError && table) {
                const customErrMsg = await mongoConn?.models['CustomErrorMessage']?.findOne(
                    {
                        error_id: customError.guid,
                        table_slug: table?.id
                    }
                )
                if (customErrMsg) {

                    switch (customErrMsg.code) {
                        case 400:
                            code = grpc.status.INVALID_ARGUMENT
                            break;
                        case 404:
                            code = grpc.status.NOT_FOUND
                            break;
                        default:
                            code = grpc.status.INTERNAL;
                    }
                    message = customErrMsg.message
                }
            }
            callback({
                code: code,
                message: message
            });
        }
    };
};
