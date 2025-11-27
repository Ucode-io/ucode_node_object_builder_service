const cfg = require('./index')
const mongoose = require('mongoose')
const logger = require('./logger')
const ObjectBuilder = require("../models/object_builder");
// ObjectBuilder(false).then(res => {
// })

let mongoDBUrl =
    ``
    // "mongodb://" +
    // cfg.mongoUser +
    // ":" +
    // cfg.mongoPassword +
    // "@" +
    // cfg.mongoHost +
    // ":" +
    // cfg.mongoPort +
    // "/" +
    // cfg.mongoDatabase;

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


