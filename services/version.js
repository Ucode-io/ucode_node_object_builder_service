const versionStorage = require("../storage/mongo/version.js");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const versionService = {
    GetList: catchWrapServiceObjectBuilder(`service.version.getList`, versionStorage.getAll),
    Update: catchWrapServiceObjectBuilder(`service.version.update`, versionStorage.update),
    Create: catchWrapServiceObjectBuilder(`service.version.create`, versionStorage.create),
    CreateMany: catchWrapServiceObjectBuilder(`service.version.createMany`, versionStorage.createAll),
    GetSingle: catchWrapServiceObjectBuilder(`service.version.getSingle`, versionStorage.getSingle),
    UpdateLive: catchWrapServiceObjectBuilder(`service.version.updateLive`, versionStorage.updateLive),
};

module.exports = versionService;