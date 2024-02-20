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
    console.log("~~~~~> config ", config)
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
    console.log("mongo credentials:1111 ", config.mongoHost, config.mongoPort, config.mongoUser, config.mongoDatabase, config.mongoPassword)
    try {
        logger.info(`autoconnecting to resources`);
        
        // mongodb://autoservice_autoservice_object_builder_service:q6viL9SDOv@142.93.164.37:27017/autoservice_autoservice_object_builder_service
        console.log("\n\n\n\n\n\n RESTART OBJECT BUILDER...", config.nodeType)
        await projectStorage.autoConnect(
            {
                request: {
                    k8s_namespace: config.k8s_namespace,
                    node_type: config.nodeType
                }
            },
            (code, result) => {
                logger.info(`connected to resources ${code} - ${result}`);
            }
        )

        logger.info(`connected successfully done!!`);

    } catch (err) {
        logger.info(`auto connecting to resources failed: ${err}`);
    }


})();

////