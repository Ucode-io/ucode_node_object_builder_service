require('dotenv').config({ path: '/app/.env' })

const mongooseConnection = require("./config/mongooseConnection");
const collectionDeleteInterval = require("./helper/collectionDeleteInterval");
const grpcConnection = require("./config/grpcConnection");
const kafka = require("./config/kafka");