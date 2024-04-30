const logger = require("../config/logger");
const grpc = require("@grpc/grpc-js");
const mongoPool = require("../pkg/pool");
const grpcClient = require("../services/grpc/client");
const config = require("../config/index");
const projectStore = require("../storage/mongo/project");

module.exports = (namespace, fn) => {
    return async (call, callback) => {
        logger.info(
            `${namespace}: requested - ${JSON.stringify(call.request, null, 2)}`
        );
        if (namespace !== "service.project.register" && namespace !== "service.project.reconnect") {//
            let projectId = call.request.resource_environment_id || call.request.project_id
            console.log(projectId)
            try {
                await mongoPool.get(projectId)
            } catch (error) {
                if (error.message === "db conn with given projectId does not exist") {
                    const resource = await grpcClient.reConn(config.k8s_namespace, projectId, config.nodeType)
                    await projectStore.reconnect({
                        credentials: {
                            host: resource.res.credentials.host,
                            port: resource.res.credentials.port,
                            database: resource.res.credentials.database,
                            username: resource.res.credentials.username,
                            password: resource.res.credentials.password,
                        },
                        project_id: projectId
                    })
                }
            }
        }


        try {
            const resp = await fn(call.request);

            logger.info(`${namespace}: succeeded`);
            callback(null, resp);
        } catch (error) {
            logger.error(`${namespace}: failed with error: ${error.message}`);

            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    };
};
