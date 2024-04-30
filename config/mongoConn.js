const Logger = require("./logger");
const mongoose = require("mongoose");
const fs = require("fs");

async function newMongoConn(Config, shouldCompileModels = true) {

    let mongoDBUrl = ""
    if (Config.mongoHost.startsWith('db-mongodb')) {
        mongoDBUrl = 
        "mongodb+srv://" +
        Config.mongoUser +
        ":" +
        Config.mongoPassword +
        "@" +
        Config.mongoHost +
        "/" +
        Config.mongoDatabase +
        "?tls=true&authSource=admin&replicaSet=db-mongodb-ett-fra1-93798"
    } else {
        mongoDBUrl =
        //`mongodb://medion_node_object_builder_service:Weipheingo7aeCho@46.101.114.171:27017/medion_node_object_builder_service`
        "mongodb://" +
        Config.mongoUser +
        ":" +
        Config.mongoPassword +
        "@" +
        Config.mongoHost +
        ":" +
        Config.mongoPort +
        "/" +
        Config.mongoDatabase;
    }

    let options = {
        // poolSize: 10,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: false
    };

    if (Config.mongoHost == "localhost") {
        mongoDBUrl = `mongodb://${Config.mongoUser}:${Config.mongoPassword}@${Config.mongoHost}:${Config.mongoPort}/${Config.mongoDatabase}`;
        options = {
            // poolSize: 10,
            authSource: "admin",
            user: Config.mongoUser,
            pass: Config.mongoPassword,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: false
        };
    }

    // mongoDBUrl = `mongodb://localhost:27017/sandbox`;

    Logger.debug("connecting to mongodb: " + mongoDBUrl);

    const conn = await mongoose.createConnection(mongoDBUrl, options);
    conn.once("open", async function () {
        Logger.info("connected to the database: " + mongoDBUrl);
    });

    conn.on("error", async function (err) {
        console.log(`Error while connecting to ${Config.mongoHost}: ${err}`);
    });
    if (shouldCompileModels) {
        conn.model('App', require('../schemas/app'))
        conn.model('CustomEvent', require('../schemas/custom_event'))
        conn.model('Dashboard', require('../schemas/dashboard'))
        conn.model('Document', require('../schemas/document'))
        conn.model('EventLog', require('../schemas/event_log'))
        conn.model('Event', require('../schemas/event'))
        conn.model('Field', require('../schemas/field'))
        conn.model('Function', require('../schemas/function'))
        conn.model('HtmlTemplate', require('../schemas/html_template'))
        conn.model('Panel', require('../schemas/panel'))
        conn.model('QueryFolder', require('../schemas/query_folder'))
        conn.model('Query', require('../schemas/query'))
        conn.model('Relation', require('../schemas/relation'))
        conn.model('Section', require('../schemas/section'))
        conn.model('Table', require('../schemas/table'))
        conn.model('Variable', require('../schemas/variable'))
        conn.model('ViewRelation', require('../schemas/view_relation'))
        conn.model('View', require('../schemas/view'))
        conn.model('WebPage', require('../schemas/web_pages'))
        conn.model('Setting.Languages', require('../schemas/setting_language'))
        conn.model('Setting.Currencies', require('../schemas/setting_currency'))
        conn.model('Setting.Timezones', require('../schemas/setting_timezone'))
        conn.model('object_builder_service.menu.settings', require('../schemas/menu_settings'))
        conn.model('object_builder_service.menu', require('../schemas/menu'))
        conn.model('object_builder_service.menu.templates', require('../schemas/menu_template'))
        conn.model('function_service.function', require("../schemas/function_service_function.js"));
        conn.model('object_builder_service.file', require('../schemas/file'))
        conn.model('object_builder_service.version_history', require('../schemas/version_history.js'))
        conn.model('IncrementSeq', require('../schemas/increment'))
        conn.model('object_builder_service.version', require('../schemas/version.js'))
    }
    return conn;
}

module.exports = newMongoConn;
