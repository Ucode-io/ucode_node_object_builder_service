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
            project_id: "311ed2b3-c8a4-4ba0-b102-701fd7ada595",
            credentials: {
                host: "95.217.155.57",
                port: 30027,
                database: "wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs",
                username: "wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs",
                password: "ztgZN4gM6m"
            } 
        })

        //mongodb://wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs:ztgZN4gM6m@95.217.155.57:30027/wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs
        //mongodb://genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs:UAQljhZlWm@142.93.164.37:27017/genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs

        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();