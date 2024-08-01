const fieldStore = require("../storage/mongo/field");
const catchWrapService = require("../helper/catchWrapService");

const fieldService = {
    Create: catchWrapService(`service.field.create`, fieldStore.create),
    Update: catchWrapService(`service.field.update`, fieldStore.update),
    UpdateSearch: catchWrapService(`service.field.updateSearch`, fieldStore.updateSearch),
    GetByID: catchWrapService(`service.field.getByID`, fieldStore.getByID),
    GetAll: catchWrapService(`service.field.getAll`, fieldStore.getAll),
    Delete: catchWrapService(`service.field.delete`, fieldStore.delete),
    GetAllForItems: catchWrapService(`service.field.getAllForItems`, fieldStore.getAllForItems),
    GetAllByLabel: catchWrapService(`service.field.getAllByLabel`, fieldStore.getAllByLabel),
    GetIdsByLabel: catchWrapService(`service.field.getIdsByLabel`, fieldStore.getIdsByLabel),
};

module.exports = fieldService;
