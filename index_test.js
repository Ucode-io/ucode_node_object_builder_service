require('dotenv').config({ path: '/app/.env' });
require("dotenv").config({ path: "./.env" })
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
const grpcConnection = require("./config/grpcConnection");
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
            project_id: "088bf450-6381-45b5-a236-2cb0880dcaab", // alldental
            credentials: {
                host: "142.93.164.37",
                port: 27017,
                database: "wallyy_0f111e783a934bec945a2a77e0e0a82d_p_obj_build_svcs",
                username: "wallyy_0f111e783a934bec945a2a77e0e0a82d_p_obj_build_svcs",
                password: "xLezOfqNj0"
            }
        })

        //mongodb://wallyy_0f111e783a934bec945a2a77e0e0a82d_p_obj_build_svcs:xLezOfqNj0@142.93.164.37:27017/wallyy_0f111e783a934bec945a2a77e0e0a82d_p_obj_build_svcs
        //mongodb://swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs:J65e1tOKfd@95.217.155.57:30027/swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs
        //mongodb://sync_user_848ec3dcbfc0449682240b30041b22a1_p_obj_build_svcs:LTorSVui1P@95.217.155.57:30027/sync_user_848ec3dcbfc0449682240b30041b22a1_p_obj_build_svcs
        //mongodb://datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs:6WgABcjpbe@142.93.164.37:27017/datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs
        //mongodb://rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs:oDgRRrJR7U@142.93.164.37:27017/rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs
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