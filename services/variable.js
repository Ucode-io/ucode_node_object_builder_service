const variableStore = require("../storage/mongo/variable");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const variableService = {
    Create: catchWrapServiceObjectBuilder(`service.variableStore.create`, variableStore.create),
    Update: catchWrapServiceObjectBuilder(`service.variableStore.update`, variableStore.update),
    GetSingle: catchWrapServiceObjectBuilder(`service.variableStore.getSingle`, variableStore.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.variableStore.getList`, variableStore.getList),
    Delete: catchWrapServiceObjectBuilder(`service.variableStore.delete`, variableStore.delete),
};

module.exports = variableService;