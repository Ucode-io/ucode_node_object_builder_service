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
        //     project_id: "6f7a8419-4b0e-40cd-887d-54dd50907707", // alldental
        //     credentials: {
        //         host: "65.109.239.69",
        //         port: 30027,
        //         database: "uacademy_fc128bcc5ddc488dbb625296202eb347_p_obj_build_svcs",
        //         username: "uacademy_fc128bcc5ddc488dbb625296202eb347_p_obj_build_svcs",
        //         password: "2B055zuUyy"
        //     }
        // })

        
        // mongodb://autoservice_autoservice_object_builder_service:q6viL9SDOv@142.93.164.37:27017/autoservice_autoservice_object_builder_service
        console.log(">>>> test for change view 1")
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