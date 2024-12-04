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
            project_id: "e20d0b06-5bcb-467b-8cdf-74abca30e3ff",
            credentials: {
                host: "95.217.155.57",
                port: 30027,
                database: "task_151b92c9f6aa4ae096b79f335ac02363_p_obj_build_svcs",
                username: "task_151b92c9f6aa4ae096b79f335ac02363_p_obj_build_svcs",
                password: "gJ9PMaR6Hf"
            }
        })

        //e20d0b06-5bcb-467b-8cdf-74abca30e3ff:mongodb://task_151b92c9f6aa4ae096b79f335ac02363_p_obj_build_svcs:gJ9PMaR6Hf@95.217.155.57:30027/task_151b92c9f6aa4ae096b79f335ac02363_p_obj_build_svcs
        //43715880-3534-453e-b1df-a7546f69305e:mongodb://swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs:J65e1tOKfd@95.217.155.57:30027/swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs
        //311ed2b3-c8a4-4ba0-b102-701fd7ada595:mongodb://wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs:ztgZN4gM6m@95.217.155.57:30027/wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs
        //mongodb://datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs:6WgABcjpbe@142.93.164.37:27017/datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs

        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();