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
   

    //This for checking in localhost

    // await projectStorage.registerProjects({
    //     project_id: "test121231",
    //     credentials: {
    //         host: "localhost",
    //         port: 27017,
    //         database: "test_new_migration",
    //         username: "sirojiddin",
    //         password: "1234",
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
