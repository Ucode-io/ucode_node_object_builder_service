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
            project_id: "205a1e44-8f96-4b41-9613-55508ee66b80",
            credentials: {
                host: "mongodb01.u-code.io",
                port: 27017,
                database: "ucode_36aeec31639f41ad890b6aba6464695d_p_obj_build_svcs",
                username: "ucode_36aeec31639f41ad890b6aba6464695d_p_obj_build_svcs",
                password: "EQqGYFmOW7r4CDyDbUXfy95pfWqW1VZr"
            } 
        })

        //9b9f3c0c-919f-43a1-97f0-7165d0b39c6f:mongodb://calculator_b1927621534e416f8d45e61f9f2d7bde_p_obj_build_svcs:5vv8mjVykg@142.93.164.37:27017/calculator_b1927621534e416f8d45e61f9f2d7bde_p_obj_build_svcs
        //baa6651d-cc6e-4302-977f-843a976ede5f:mongodb://binn_7e2c2c8c522f4a40ae43a43b85ccd32e_p_obj_build_svcs:QGmh717SEf@142.93.164.37:27017/binn_7e2c2c8c522f4a40ae43a43b85ccd32e_p_obj_build_svcs
        //205a1e44-8f96-4b41-9613-55508ee66b80:mongodb://ucode_36aeec31639f41ad890b6aba6464695d_p_obj_build_svcs:0oVJgmwqDQ@142.93.164.37:27017/ucode_36aeec31639f41ad890b6aba6464695d_p_obj_build_svcs          
        //481541ad-98c4-4d68-a225-081bdbf221e2:mongodb://integratio_f05fdd8df949499995935686ac272993_p_obj_build_svcs:m5M5Ek8zps@142.93.164.37:27017/integratio_f05fdd8df949499995935686ac272993_p_obj_build_svcs
        //088bf450-6381-45b5-a236-2cb0880dcaab:mongodb://wallyy_0f111e783a934bec945a2a77e0e0a82d_p_obj_build_svcs:xLezOfqNj0@142.93.164.37:27017/wallyy_0f111e783a934bec945a2a77e0e0a82d_p_obj_build_svcs
        //7172da91-9127-44b6-a298-3f91b6d559e5:mongodb://mbf_ebf657726f964d5fb08c65c915f85e2c_p_obj_build_svcs:kMiMD5V4VU@142.93.164.37:27017/mbf_ebf657726f964d5fb08c65c915f85e2c_p_obj_build_svcs
        //a002eba6-feaf-4085-bf7d-3361ce5e8dd2:mongodb://osnova_4b281d3b2f4d408281552f4c6676a028_p_obj_build_svcs:0uMNfbKQlD@142.93.164.37:27017/osnova_4b281d3b2f4d408281552f4c6676a028_p_obj_build_svcs
        //583184ec-1762-48dd-b4a5-a1390099c1e2:mongodb://rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs:oDgRRrJR7U@142.93.164.37:27017/rizo_42ab0799deff4f8cbf3f64bf9665d304_p_obj_build_svcs
        //f634987f-25c8-4004-b911-343591081acb:mongodb://starex_342fba37fc7d4b6fb02f57b21beb0218_d_obj_build_svcs:wa3ilnGY7M@142.93.164.37:27017/starex_342fba37fc7d4b6fb02f57b21beb0218_d_obj_build_svcs
        //c46972cb-5377-4e2a-923b-edbb5c7d6670:mongodb://datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs:6WgABcjpbe@142.93.164.37:27017/datalens1_1f0b63baa6534538bbea7660563c5ef6_p_obj_build_svcs

        logger.info(`autoconnected successfully done!!!`);

    } catch (err) {
        logger.info(`autoconnecting to resources failed: ${err}`);
    }


})();