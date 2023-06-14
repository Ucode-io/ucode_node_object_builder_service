const dotenv = require('dotenv')
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
const grpcConnection = require("./config/grpcConnection");
const logger = require("./config/logger");

if (dotenv.config({ path: '/app/.env' }).error !== undefined) {
    if (dotenv.config({ path: './.env' }).error !== undefined) {
        console.log("error while load .env file")
    }
}

(async function () {
    try {
        await grpcConnection()
    } catch (err) {
        throw err
    }

    process.addListener("uncaughtException", (e) => {
        console.error("Custom Unhandled Exception", e);
    });

    process.addListener("unhandledRejection", (e) => {
        console.error("Custom Unhandled Rejection", e);
    });

    try {
        logger.info(`auto connecting to resources`);

        await projectStorage.reconnect({
            project_id: "53b9d486-e202-4b0f-bb0c-921634c7f5ec", // alldental
            credentials: {
                host: "95.217.155.57",
                port: 30027,
                database: "ets3_ets3_object_builder_service",
                username: "ets3_ets3_object_builder_service",
                password: "lSXvowmdCI"
            }
        })
    } catch (err) {
        logger.info(`auto connecting to resources failed: ${err}`);
    }
})();