const appStore = require("../storage/mongo/app");
const catchWrapService = require("../helper/catchWrapService");

const appService = {
    Create: catchWrapService(`service.app.create`, appStore.create),
    Update: catchWrapService(`service.app.update`, appStore.update),
    GetByID: catchWrapService(`service.app.getByID`, appStore.getByID),
    GetAll: catchWrapService(`service.app.getAll`, appStore.getAll),
    Delete: catchWrapService(`service.app.delete`, appStore.delete),
};

module.exports = appService;
 