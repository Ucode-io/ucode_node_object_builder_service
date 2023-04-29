require('dotenv').config({ path: '/app/.env' });
require("dotenv").config({ path: "./.env" })
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
// const mongooseConnection = require("./config/mongooseConnection");
// @TODO:: add collection Delete Interval function for resources
// const collectionDeleteInterval = require("./helper/collectionDeleteInterval"); 
const grpcConnection = require("./config/grpcConnection");
const kafka = require("./config/kafka");
const logger = require("./config/logger");

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
        logger.info(`autoconnecting to resources`);

        await projectStorage.reconnect({
            project_id: "5df4baeb-293e-4728-a857-e961220554f5", // ufin test 
            credentials: {
                host: "161.35.26.178",
                port: 27017,
                database: "ufin_test_ufin_test_object_builder_service",
                username: "ufin_test_ufin_test_object_builder_service",
                password: "vZhq2e2w9u"
            }
        })

        // await projectStorage.autoConnect(
        //     {
        //         request: {
        //             k8s_namespace: config.k8s_namespace
        //         }
        //     },
        //     (code, result) => {
        //         logger.info(`autoconnected to resources ${code} - ${result}`);
        //     }
        // )

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();