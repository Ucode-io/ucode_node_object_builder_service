const fieldStore = require("../storage/mongo/field");
const catchWrapService = require("../helper/catchWrapService");

const fieldService = {
    Create: catchWrapService(`service.field.create`, fieldStore.create),
    Update: catchWrapService(`service.field.update`, fieldStore.update),
    GetByID: catchWrapService(`service.field.getByID`, fieldStore.getByID),
    GetAll: catchWrapService(`service.field.getAll`, fieldStore.getAll),
    Delete: catchWrapService(`service.field.delete`, fieldStore.delete),
};

module.exports = fieldService;
