const mongoose = require('mongoose')
const logger = require('./logger')
const ObjectBuilder = require("../models/object_builder");
ObjectBuilder(false).then(res => {
    console.log("object builder is successfully runned");
})

const mongoose = require('mongoose');

const conn = mongoose.createConnection(process.env.MONGODB_URI);
conn.model('User', require('../schemas/user'));

module.exports = conn;

function newMongoDbConn(cfg) {
    let mongoDBUrl = 
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

    let conn;
    mongoose.createConnection(
        mongoDBUrl,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true,
        },
        (err, connection) => {
            if (err) {
                console.log("error whiling connecting to mongodb", err)
                throw err
            }

            conn = connection
        }
    )

    conn.model('User', require('../schemas/user'));
}

