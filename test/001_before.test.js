const a = require('dotenv').config({ path: '/app/.env' });
const b = require("dotenv").config({ path: "./.env" })
const projectStorage = require('../storage/mongo/project'); 
// require("dotenv").config({ path: "../.env" })
const config = require('../config/index')
const constants = require("../helper/constants")
before( function (done) {
    this.timeout('9000s')
    projectStorage.reconnect(constants.UnitTestData[config?.environment]?.dbCred).then(() => {done()}).catch(err => {})
})