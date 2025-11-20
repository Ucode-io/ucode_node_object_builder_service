const cfg = require('./index')
const mongoose = require('mongoose')
const logger = require('./logger')
const ObjectBuilder = require("../models/object_builder");

let mongoDBUrl =
    ``

mongoose.connect(
    mongoDBUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => {
        if (err) {
            logger.error("[Error::ignorable] while connecting to database (" +
                mongoDBUrl + ") " + err.message);
        }

        logger.info("Connected to mongoDB")
    }

)


