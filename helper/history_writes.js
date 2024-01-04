const constants = require('./constants')

module.exports = async function (mongoConn, data) {
    try {
        const history = data.mongoDBConn.models['object_builder_service.version_history']
       
    } catch(error) {
        console.log("Error in is_static.js", error)
    }
}