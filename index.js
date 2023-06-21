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
    console.log("mongo credentials: ", config.mongoHost, config.mongoPort, config.mongoUser, config.mongoDatabase, config.mongoPassword)
    try {
        logger.info(`autoconnecting to resources`);
        // await projectStorage.reconnect({
        //     project_id: "a5f5affc-db2b-4046-af47-19376ff481f9", // alldental
        //     credentials: {
        //         host: "142.93.164.37",
        //         port: 27017,
        //         database: "autoservice_autoservice_object_builder_service",
        //         username: "autoservice_autoservice_object_builder_service",
        //         password: "q6viL9SDOv"
        //     }
        // })

        
        // mongodb://autoservice_autoservice_object_builder_service:q6viL9SDOv@142.93.164.37:27017/autoservice_autoservice_object_builder_service

        await projectStorage.autoConnect(
            {
                request: {
                    k8s_namespace: config.k8s_namespace
                }
            },
            (code, result) => {
                logger.info(`connected to resources ${code} - ${result}`);
            }
        )

        logger.info(`autoconnect successfully done!!!`);

    } catch (err) {
        logger.info(`auto connecting to resources failed: ${err}`);
    }


})();