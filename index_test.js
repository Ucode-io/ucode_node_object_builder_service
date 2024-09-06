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
    });

    process.addListener("unhandledRejection", (e) => {
    });

    try {
        logger.info(`autoconnecting to resources`);
        await projectStorage.reconnect({
            project_id: "2800a09f-56a1-439d-881a-f314b1c38e32", // alldental
            credentials: {
                host: "95.217.155.57",
                port: 30027,
                database: "auth_test_40499c28d51a4c0ea39626193776cefb_p_obj_build_svcs",
                username: "auth_test_40499c28d51a4c0ea39626193776cefb_p_obj_build_svcs",
                password: "3o1ZomCLIj"
            }
        })
        //mongodb://auth_test_40499c28d51a4c0ea39626193776cefb_p_obj_build_svcs:3o1ZomCLIj@95.217.155.57:30027/auth_test_40499c28d51a4c0ea39626193776cefb_p_obj_build_svcs
        //mongodb://ucode_test_0423bc17c6054d80922b9b031c2bff03_p_obj_build_svcs:BtJlSI9zlL@95.217.155.57:30027/ucode_test_0423bc17c6054d80922b9b031c2bff03_p_obj_build_svcs
        // mongodb://genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs:UAQljhZlWm@142.93.164.37:27017/genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs
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