const fileStore = require("../storage/mongo/file");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const variableService = {
    Create: catchWrapServiceObjectBuilder(`service.fileStore.create`, fileStore.create),
    Update: catchWrapServiceObjectBuilder(`service.fileStore.update`, fileStore.update),
    GetSingle: catchWrapServiceObjectBuilder(`service.fileStore.getSingle`, fileStore.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.fileStore.getList`, fileStore.getList),
    Delete: catchWrapServiceObjectBuilder(`service.fileStore.delete`, fileStore.delete),
    WordTemplate: catchWrapServiceObjectBuilder(`service.fileStore.wordTemplate`, fileStore.wordTemplate),
}; 

module.exports = variableService;