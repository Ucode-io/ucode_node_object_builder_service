require('dotenv').config({ path: '/app/.env' });
require("dotenv").config({ path: "./.env" })
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
// const mongooseConnection = require("./config/mongooseConnection");
// @TODO:: add collection Delete Interval function for resources
// const collectionDeleteInterval = require("./helper/collectionDeleteInterval"); 
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
            // project_id: "b53d9192-d46a-484e-8ecd-d9344df18e4a",
            project_id: "e6c95e62-f1fb-4556-aa12-e512a14ecd52",
            credentials: {
                host: "142.93.164.37",
                port: 27017,
                database: "mongo_02eed38482ff4496b5aa30f77a16fb85_p_obj_build_svcs",
                username: "mongo_02eed38482ff4496b5aa30f77a16fb85_p_obj_build_svcs",
                password: "nrGN7dGRYB"
            }
        })

        //mongodb://montella_f930fbfd10fa482ca97b7caa9f14611b_p_obj_build_svcs:NCHVE6jdEh@65.109.239.69:30027/montella_f930fbfd10fa482ca97b7caa9f14611b_p_obj_build_svcs
        //mongodb://swift_2fce779a85e64bdeac6b1c92219a73e4_p_obj_build_svcs:MktIH85m1l@142.93.164.37:27017/swift_2fce779a85e64bdeac6b1c92219a73e4_p_obj_build_svcs
        // mongodb://genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs:UAQljhZlWm@142.93.164.37:27017/genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs
        //mongodb://ett_8fffdb8cbff54645a40dbae0a272f6e7_p_obj_build_svcs:ugdvopAnMJ@65.109.239.69:30027/ett_8fffdb8cbff54645a40dbae0a272f6e7_p_obj_build_svcs
        //mongodb://ett_8fffdb8cbff54645a40dbae0a272f6e7_s_obj_build_svcs:AvZtXGmSFi@65.109.239.69:30027/ett_8fffdb8cbff54645a40dbae0a272f6e7_s_obj_build_svcs
        //mongodb://uzcard_1cc4c7e54cc64415b074f331c6a13cc1_p_obj_build_svcs:vBPqHBE2gm@142.93.164.37:27017/uzcard_1cc4c7e54cc64415b074f331c6a13cc1_p_obj_build_svcs
        //mongodb://balenciaga_d94b7c0e3f6446e7a362345c9fe6800d_p_obj_build_svcs:Dov4ocrqq0@65.109.239.69:30027/balenciaga_d94b7c0e3f6446e7a362345c9fe6800d_p_obj_build_svcs
        //mongodb://swift_7214baf774da4fd2a1166477a9528c83_p_obj_build_svcs:vwdG8B7gzO@142.93.164.37:27017/swift_7214baf774da4fd2a1166477a9528c83_p_obj_build_svcs
        //mongodb://dev_b7a9b7317ba04a97a1ecebc6da74f0af_p_obj_build_svcs:QoRidVg9iL@65.109.239.69:30027/dev_b7a9b7317ba04a97a1ecebc6da74f0af_p_obj_build_svcs
        //mongodb://rizo-company_rizo-company_object_builder_service:uEzqO8YsIt@142.93.164.37:27017/rizo-company_rizo-company_object_builder_service
        // mongodb://genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs:UAQljhZlWm@142.93.164.37:27017/genus_5f988f2b9eb64b0985172ca17d8038e3_p_obj_build_svcs
        // mongodb://autoservice_autoservice_object_builder_service:q6viL9SDOv@142.93.164.37:27017/autoservice_autoservice_object_builder_service
        // mongodb://transforme_88a09f9111d6422eaaa37fd9973b7315_p_obj_build_svcs:a8AmenxuSm@65.109.239.69:30027/transforme_88a09f9111d6422eaaa37fd9973b7315_p_obj_build_svcs

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