require('dotenv').config({ path: '/app/.env' });
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
// const mongooseConnection = require("./config/mongooseConnection");
// const collectionDeleteInterval = require("./helper/collectionDeleteInterval");
const grpcConnection = require("./config/grpcConnection");
const kafka = require("./config/kafka");

(async function () {

    await projectStorage.reconnect({
        project_id: '39f1b0cc-8dc3-42df-b2bf-813310c007a4',
        credentials: {
            host: '161.35.26.178',
            port: 27017,
            database: 'transasia_transasia_object_builder_service',
            username: 'transasia_transasia_object_builder_service',
            password: '123JFWxq'
        },
    })



    // await projectStorage.autoConnect(
    //     {
    //         request: {
    //             k8s_namespace : config.k8s_namespace
    //         }
    //     },
    //     (code, result) => {
    //         console.log(code, result)
    //     }
    // )

})();
