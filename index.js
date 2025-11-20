require('dotenv').config({ path: '/app/.env' });
require("dotenv").config({ path: "./.env" })
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
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
        
        await projectStorage.autoConnect(
            {
                request: {
                    k8s_namespace: config.k8s_namespace,
                    node_type: config.nodeType
                }
            },
            (code, result) => {
                logger.info(`connected to resources ${code} - ${result}`);
            }
        )

        logger.info(`connected successfully done!!`);

    } catch (err) {
        logger.info(`auto connecting to resources failed: ${err}`);
    }


})();