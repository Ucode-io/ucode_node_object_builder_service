const queryFolderStore = require("../storage/mongo/query_folder");
const catchWrapService = require("../helper/catchWrapService");

const queryFolderService = {
    Create: catchWrapService(`service.query_folder.create`, queryFolderStore.create),
    Update: catchWrapService(`service.query_folder.update`, queryFolderStore.update),
    GetById: catchWrapService(`service.query_folder.getById`, queryFolderStore.getById),
    GetAll: catchWrapService(`service.query_folder.getAll`, queryFolderStore.getAll),
    Delete: catchWrapService(`service.query_folder.delete`, queryFolderStore.delete),
};

module.exports = queryFolderService;
