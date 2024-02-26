require('dotenv').config({ path: '/app/.env' });
require("dotenv").config({ path: "./.env" })
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
// const mongooseConnection = require("./config/mongooseConnection");
// @TODO:: add collection Delete Interval function for resources
// const collectionDeleteInterval = require("./helper/collectionDeleteInterval"); 
const grpcConnection = require("./config/grpcConnection");
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
        logger.info(`autoconnectinag to resources`);
        await projectStorage.reconnect({
            // project_id: "b53d9192-d46a-484e-8ecd-d9344df18e4a",
            project_id: "1",
            credentials: {
                host: "142.93.164.37",
                port: 27017,
                database: "genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs",
                username: "genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs",
                password: "UAQljhZlWm"
            }
        })

        // mongodb://genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs:UAQljhZlWm@142.93.164.37:27017/genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs
        //mongodb://ett_8fffdb8cbff54645a40dbae0a272f6e7_p_obj_build_svcs:ugdvopAnMJ@65.109.239.69:30027/ett_8fffdb8cbff54645a40dbae0a272f6e7_p_obj_build_svcs
        //mongodb://ett_8fffdb8cbff54645a40dbae0a272f6e7_s_obj_build_svcs:AvZtXGmSFi@65.109.239.69:30027/ett_8fffdb8cbff54645a40dbae0a272f6e7_s_obj_build_svcs
        //mongodb://uzcard_1cc4c7e54cc64415b074f331c6a13cc1_p_obj_build_svcs:vBPqHBE2gm@142.93.164.37:27017/uzcard_1cc4c7e54cc64415b074f331c6a13cc1_p_obj_build_svcs

        //mongodb://swift_7214baf774da4fd2a1166477a9528c83_p_obj_build_svcs:vwdG8B7gzO@142.93.164.37:27017/swift_7214baf774da4fd2a1166477a9528c83_p_obj_build_svcs
        //mongodb://dev_b7a9b7317ba04a97a1ecebc6da74f0af_p_obj_build_svcs:QoRidVg9iL@65.109.239.69:30027/dev_b7a9b7317ba04a97a1ecebc6da74f0af_p_obj_build_svcs
        //mongodb://rizo-company_rizo-company_object_builder_service:uEzqO8YsIt@142.93.164.37:27017/rizo-company_rizo-company_object_builder_service
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