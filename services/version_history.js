const vhistoryStorage = require("../storage/mongo/version_history.js");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const versionHistoryService = {
    GatAll: catchWrapServiceObjectBuilder(`service.version_history.getAll`, vhistoryStorage.getAll),
    Update: catchWrapServiceObjectBuilder(`service.version_history.usedForEnv`, vhistoryStorage.usedForEnv),
    Create: catchWrapServiceObjectBuilder(`service.version_history.migrate`, vhistoryStorage.create),
};

module.exports = versionHistoryService;