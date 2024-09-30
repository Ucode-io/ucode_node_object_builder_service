require('dotenv').config({ path: '/app/.env' });
require("dotenv").config({ path: "./.env" })
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
// const mongooseConnection = require("./config/mongooseConnection");
// @TODO:: add collection Delete Interval function for resources
// const collectionDeleteInterval = require("./helper/collectionDeleteInterval"); 
const grpcConnection = require("./config/grpcConnection");
const logger = require("./config/logger");
const { count } = require('./models/relation');

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
            "credentials": {
                "host": "142.93.164.37",
                "port": "27017",
                "database": "genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs",
                "username": "genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs",
                "password": "UAQljhZlWm"
            },
            "project_id": "ec28bc8b-264a-4e9d-b4fb-5eeca18de6cf"
        })

        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();