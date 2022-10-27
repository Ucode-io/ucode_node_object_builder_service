const relationStore = require("../storage/mongo/relation");
const catchWrapService = require("../helper/catchWrapService");

const relationService = {
    Create: catchWrapService(`service.relation.create`, relationStore.create),
    Update: catchWrapService(`service.relation.update`, relationStore.update),
    GetAll: catchWrapService(`service.relation.getAll`, relationStore.getAll),
    Delete: catchWrapService(`service.relation.delete`, relationStore.delete),
};

module.exports = relationService;
