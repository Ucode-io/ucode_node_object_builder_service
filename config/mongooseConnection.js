const cfg = require('./index')
const mongoose = require('mongoose')
const logger = require('./logger')
const ObjectBuilder = require("../models/object_builder");
// ObjectBuilder(false).then(res => {
//     console.log("object builder has successfully runned");
// })

let mongoDBUrl =
    //`mongodb://medion_node_object_builder_service:Weipheingo7aeCho@46.101.114.171:27017/medion_node_object_builder_service`
    "mongodb://" +
    cfg.mongoUser +
    ":" +
    cfg.mongoPassword +
    "@" +
    cfg.mongoHost +
    ":" +
    cfg.mongoPort +
    "/" +
    cfg.mongoDatabase;

mongoose.connect(
    mongoDBUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
    },
    (err) => {
        if (err) {
            logger.error("[Error::ignorable] while connecting to database (" +
                mongoDBUrl + ") " + err.message);
        }

        logger.info("Connected to mongoDB")
    }

)


