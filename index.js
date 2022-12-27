require('dotenv').config({ path: '/app/.env' });
const service = require('./services/project');
const ObjectBuilder = require("./models/object_builder");

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

    await ObjectBuilder(false, config.ucodeDefaultProjectID)
    console.log("object builder has successfully runned for", config.ucodeDefaultProjectID);


    // const permissionStore = require('./storage/mongo/permission')

    // const permission = await permissionStore.getListWithRoleAppTablePermissions({
    //     project_id: config.ucodeDefaultProjectID,
    //     role_id: 'd3b48c94-c46b-4e08-9415-ede7a71adfa6'
    // })

    // console.log('permission', JSON.stringify(permission, null, 2))

})();
