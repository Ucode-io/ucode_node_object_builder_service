require('dotenv').config({ path: '/app/.env' });


(async function () {
    const ProjectStorage = require('./storage/mongo/project')
    const config = require('./config/index')

    await ProjectStorage.register({ project_id: config.ucodeDefaultProjectID })

    const mongooseConnection = require("./config/mongooseConnection");
    const collectionDeleteInterval = require("./helper/collectionDeleteInterval");
    const grpcConnection = require("./config/grpcConnection");
    const kafka = require("./config/kafka");

})();
