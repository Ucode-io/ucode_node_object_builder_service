const folderFolderStore = require("../storage/mongo/table_folder");
const catchWrapService = require("../helper/catchWrapService");

const tableFolderService = {
    Create: catchWrapService(`service.table_folder.create`, folderFolderStore.create),
    Update: catchWrapService(`service.table_folder.update`, folderFolderStore.update),
    GetByID: catchWrapService(`service.table_folder.getById`, folderFolderStore.getById),
    GetAll: catchWrapService(`service.table_folder.getAll`, folderFolderStore.getAll),
    Delete: catchWrapService(`service.table_folder.delete`, folderFolderStore.delete),
};

module.exports = tableFolderService;