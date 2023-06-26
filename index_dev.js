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
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81", // alldental
            credentials: {
                host: "65.109.239.69",
                port: 30027,
                database: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
                username: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
                password: "bLjkGFjiva"
            }
        })
        // mongodb://autoservice_autoservice_object_builder_service:q6viL9SDOv@142.93.164.37:27017/autoservice_autoservice_object_builder_service

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
        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();