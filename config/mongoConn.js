const Logger = require("./logger");
const mongoose = require("mongoose");
const fs = require("fs");

async function newMongoConn(Config, shouldCompileModels = true) {
    let mongoDBUrl =
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
        // conn.model('Field', require('../schemas/field'))
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
        conn.model(
            "function_service.function",
            require("../schemas/function_service.function")
        );
    }
    return conn;
}

module.exports = newMongoConn;
