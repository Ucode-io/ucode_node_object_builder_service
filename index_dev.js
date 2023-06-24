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
                host: "65.109.239.69",
                port: 30027,
                database: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
                username: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
                password: "bLjkGFjiva"
            }
        })
    } catch (err) {
        logger.info(`auto connecting to resources failed: ${err}`);
    }
})();