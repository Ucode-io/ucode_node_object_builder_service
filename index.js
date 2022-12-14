require('dotenv').config({ path: '/app/.env' });


(async function () {

    const projectStorage = require('./storage/mongo/project')
    const config = require('./config/index')

    console.log(`CONFIGURATION---- ${config}\n`)

    await projectStorage.register({ project_id: config.ucodeDefaultProjectID })

    const mongooseConnection = require("./config/mongooseConnection");
    const collectionDeleteInterval = require("./helper/collectionDeleteInterval");
    const grpcConnection = require("./config/grpcConnection");
    const kafka = require("./config/kafka");

})();
