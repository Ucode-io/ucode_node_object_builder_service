require('dotenv').config({ path: '/app/.env' });

(async function () {

    const projectStorage = require('./storage/mongo/project')
    const config = require('./config/index')

    await projectStorage.reconnect({
        project_id: config.ucodeDefaultProjectID,
        credentials: {
            host: config.mongoHost,
            port: config.mongoPort,
            database: config.mongoDatabase,
            username: config.mongoUser,
            password: config.mongoPassword,
        },
    })


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

    const projectService = require('./services/project')

    // await projectService.Register(
    //     {
    //         request: {
    //             user_id: '61d566fc-39a9-40c2-8156-8822149ce7dd',
    //             project_id: 'b9a4806a-c5d5-43fb-ae2f-a4a5054bb112',
    //             credentials: {
    //                 host: '161.35.26.178',
    //                 port: 27017,
    //                 database: 'transasia_transasia_object_builder_service',
    //                 username: 'transasia_transasia_object_builder_service',
    //                 password: '123JFWxq'
    //             }

    //         }
    //     },

    //     ((err, result) => {
    //         if (err) {
    //             throw err
    //         }

    //         console.log('success', result)
    //     })
    // )
})();
