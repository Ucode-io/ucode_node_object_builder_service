const vhistoryStorage = require("../storage/mongo/version_history.js");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const versionHistoryService = {
    GatAll: catchWrapServiceObjectBuilder(`service.version_history.getAll`, vhistoryStorage.getAll),
    UsedForEnv: catchWrapServiceObjectBuilder(`service.version_history.usedForEnv`, vhistoryStorage.usedForEnv),
    Migrate: catchWrapServiceObjectBuilder(`service.version_history.migrate`, vhistoryStorage.migrate),
    Down: catchWrapServiceObjectBuilder(`service.version_history.down`, vhistoryStorage.down),
};

module.exports = versionHistoryService;