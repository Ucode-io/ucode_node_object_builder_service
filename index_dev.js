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
        logger.info(`autoconnectinag to resources`);
        await projectStorage.reconnect({
            project_id: "43715880-3534-453e-b1df-a7546f69305e",
            credentials: {
                host: "95.217.155.57",
                port: 30027,
                database: "swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs",
                username: "swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs",
                password: "J65e1tOKfd"
            } 
        })

        //43715880-3534-453e-b1df-a7546f69305e:mongodb://swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs:J65e1tOKfd@95.217.155.57:30027/swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs
        //311ed2b3-c8a4-4ba0-b102-701fd7ada595:mongodb://wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs:ztgZN4gM6m@95.217.155.57:30027/wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs

        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();