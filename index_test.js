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
            project_id: "c46972cb-5377-4e2a-923b-edbb5c7d6670",
            credentials: {
                host: "142.93.164.37",
                port: 27017,
                database: "datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs",
                username: "datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs",
                password: "6WgABcjpbe"
            }
        })

        //mongodb://osnova_4b281d3b2f4d408281552f4c6676a028_p_obj_build_svcs:0uMNfbKQlD@142.93.164.37:27017/osnova_4b281d3b2f4d408281552f4c6676a028_p_obj_build_svcs
        //mongodb://genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs:UAQljhZlWm@142.93.164.37:27017/genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs
        //mongodb://swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs:J65e1tOKfd@95.217.155.57:30027/swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs
        //mongodb://sync_user_848ec3dcbfc0449682240b30041b22a1_p_obj_build_svcs:LTorSVui1P@95.217.155.57:30027/sync_user_848ec3dcbfc0449682240b30041b22a1_p_obj_build_svcs
        //mongodb://datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs:6WgABcjpbe@142.93.164.37:27017/datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs
        //mongodb://rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs:oDgRRrJR7U@142.93.164.37:27017/rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs

        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();