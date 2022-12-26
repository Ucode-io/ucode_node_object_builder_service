require('dotenv').config({ path: '/app/.env' });
const service = require('./services/project');

(async function () {

    const projectStorage = require('./storage/mongo/project')
    const config = require('./config/index')
    

    await projectStorage.register({ 
        project_id: config.ucodeDefaultProjectID,
        credentials: {
            host: config.mongoHost,
            port: config.mongoPort,
            database: config.mongoDatabase,
            username: config.mongoUser,
            password: config.mongoPassword,
        },
    })
   

  //  This for checking in localhost

    // await projectStorage.registerProjects({
    //     project_id: "50008d64-d3ce-47d0-98b5-cfce24cc7be0",
    //     credentials: {
    //         host: "161.35.26.178",
    //         port: 27017,
    //         database: "transasia_transasia_object_builder_service",
    //         username: "transasia_transasia_object_builder_service",
    //         password: "123JFWxq",
    //     }
    // })
    

    const mongooseConnection = require("./config/mongooseConnection");
    const collectionDeleteInterval = require("./helper/collectionDeleteInterval");
    const grpcConnection = require("./config/grpcConnection");
    const kafka = require("./config/kafka");

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
