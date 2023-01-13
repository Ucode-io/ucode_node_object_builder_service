require('dotenv').config({ path: '/app/.env' });
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
// const mongooseConnection = require("./config/mongooseConnection");
// @TODO:: add collection Delete Interval function for resources
// const collectionDeleteInterval = require("./helper/collectionDeleteInterval"); 
const grpcConnection = require("./config/grpcConnection");
const kafka = require("./config/kafka");
const logger = require("./config/logger");
const builder = require('./storage/mongo/object_builder');
const { struct } = require('pb-util/build');

(async function () {
    await projectStorage.reconnect({
        project_id: "abc123",
        credentials: {
            host: '161.35.26.178',
            port: 27017,
            username: 'transasia_transasia_object_builder_service',
            database: 'transasia_transasia_object_builder_service',
            password: '123JFWxq'
        }
    })

    struct.decode({
        project_id: 'abc123',
        table_slug: 'client_types',
        data: {
            id: ''
        }
    })
    builder.getSingle()

})();
