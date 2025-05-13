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
            project_id: "bbf978e8-af81-44bf-b622-6636ba7e2327",
            credentials: {
                host: "95.217.155.57",
                port: 30027,
                database: "newconnect_f0b9f1116cb94c53a764428eb5e40c55_p_obj_build_svcs",
                username: "newconnect_f0b9f1116cb94c53a764428eb5e40c55_p_obj_build_svcs",
                password: "n85pSD7p7j"
            }
        })


        //bbf978e8-af81-44bf-b622-6636ba7e2327:mongodb://newconnect_f0b9f1116cb94c53a764428eb5e40c55_p_obj_build_svcs:n85pSD7p7j@95.217.155.57:30027/newconnect_f0b9f1116cb94c53a764428eb5e40c55_p_obj_build_svcs
        //a22c5b96-f9a4-4f8b-8248-981119148d45:mongodb://katana1!_68ece413821349d9807fc0112f1c2959_p_obj_build_svcs:neA8VncNC9@95.217.155.57:30027/katana1!_68ece413821349d9807fc0112f1c2959_p_obj_build_svcs
        //10148570-29d7-4082-8482-773bd5012c1c:mongodb://utech_3bab7de9fde646ad8b9dc63ab01d210b_p_obj_build_svcs:Wt4YN57ZqE@95.217.155.57:30027/utech_3bab7de9fde646ad8b9dc63ab01d210b_p_obj_build_svcs
        //e20d0b06-5bcb-467b-8cdf-74abca30e3ff:mongodb://task_151b92c9f6aa4ae096b79f335ac02363_p_obj_build_svcs:gJ9PMaR6Hf@95.217.155.57:30027/task_151b92c9f6aa4ae096b79f335ac02363_p_obj_build_svcs
        //43715880-3534-453e-b1df-a7546f69305e:mongodb://swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs:J65e1tOKfd@95.217.155.57:30027/swagger_d45da286d4714f6ea49088d9dd65a7bb_p_obj_build_svcs
        //311ed2b3-c8a4-4ba0-b102-701fd7ada595:mongodb://wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs:ztgZN4gM6m@95.217.155.57:30027/wellplayed_462baeca37b04355addcb8ae5d26995d_p_obj_build_svcs

        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();