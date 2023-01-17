require('dotenv').config({ path: '/app/.env' });
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
// const mongooseConnection = require("./config/mongooseConnection");
// @TODO:: add collection Delete Interval function for resources
// const collectionDeleteInterval = require("./helper/collectionDeleteInterval"); 
const grpcConnection = require("./config/grpcConnection");
const kafka = require("./config/kafka");
const logger = require("./config/logger");
const objectBuilderStorage = require("./storage/mongo/object_builder");
const { struct } = require('pb-util');

(async function () {
   
    //mongodb://medion_node_object_builder_service:Weipheingo7aeCho@46.101.114.171:27017/medion_node_object_builder_service


    await projectStorage.reconnect({
        project_id: "medion_builder",
        credentials: {
            host: "46.101.114.171",
            port: "27017",
            database: "medion_node_object_builder_service",
            username: "medion_node_object_builder_service",
            password: "Weipheingo7aeCho",
        }
    })
    let resp = await objectBuilderStorage.update({
        project_id: "medion_builder",
        table_slug: "test_import",
        data: struct.encode({
            "name": "Muhammadjon Valiyev",
            "guid": "b1935ebd-461b-4b67-9bd6-ed900d2021ff"
        })
    })
    console.log("resp:::", resp);
    

})();
