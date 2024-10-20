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
            project_id: "14332685-ac10-4edc-8a60-add331378ed6",
            credentials: {
                host: "142.93.164.37",
                port: 27017,
                database: "osnova_4b281d3b2f4d408281552f4c6676a028_s_obj_build_svcs",
                username: "osnova_4b281d3b2f4d408281552f4c6676a028_s_obj_build_svcs",
                password: "ozr2tYASRS"
            }
        })

        //mongodb://osnova_4b281d3b2f4d408281552f4c6676a028_p_obj_build_svcs:0uMNfbKQlD@142.93.164.37:27017/osnova_4b281d3b2f4d408281552f4c6676a028_p_obj_build_svcs
        //mongodb://starex_342fba37fc7d4b6fb02f57b21beb0218_p_obj_build_svcs:oyGGjfQFI8@142.93.164.37:27017/starex_342fba37fc7d4b6fb02f57b21beb0218_p_obj_build_svcs
        //mongodb://wallyy_0f111e783a934bec945a2a77e0e0a82d_p_obj_build_svcs:xLezOfqNj0@142.93.164.37:27017/wallyy_0f111e783a934bec945a2a77e0e0a82d_p_obj_build_svcs
        //mongodb://swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs:J65e1tOKfd@95.217.155.57:30027/swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs
        //mongodb://sync_user_848ec3dcbfc0449682240b30041b22a1_p_obj_build_svcs:LTorSVui1P@95.217.155.57:30027/sync_user_848ec3dcbfc0449682240b30041b22a1_p_obj_build_svcs
        //mongodb://datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs:6WgABcjpbe@142.93.164.37:27017/datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs
        //mongodb://rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs:oDgRRrJR7U@142.93.164.37:27017/rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs

        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();