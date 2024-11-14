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
            project_id: "7172da91-9127-44b6-a298-3f91b6d559e5",
            credentials: {
                host: "142.93.164.37",
                port: 27017,
                database: "mbf_ebf657726f964d5fb08c65c915f85e2c_p_obj_build_svcs",
                username: "mbf_ebf657726f964d5fb08c65c915f85e2c_p_obj_build_svcs",
                password: "kMiMD5V4VU"
            }
        })

        //mongodb://mbf_ebf657726f964d5fb08c65c915f85e2c_p_obj_build_svcs:kMiMD5V4VU@142.93.164.37:27017/mbf_ebf657726f964d5fb08c65c915f85e2c_p_obj_build_svcs
        //mongodb://osnova_4b281d3b2f4d408281552f4c6676a028_p_obj_build_svcs:0uMNfbKQlD@142.93.164.37:27017/osnova_4b281d3b2f4d408281552f4c6676a028_p_obj_build_svcs
        //mongodb://swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs:J65e1tOKfd@95.217.155.57:30027/swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs
        //mongodb://datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs:6WgABcjpbe@142.93.164.37:27017/datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs
        //mongodb://rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs:oDgRRrJR7U@142.93.164.37:27017/rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs

        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();