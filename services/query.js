const queryStore = require("../storage/mongo/query");
const catchWrapService = require("../helper/catchWrapService");

const queryService = {
    Create: catchWrapService(`service.query.create`, queryStore.create),
    Update: catchWrapService(`service.query.update`, queryStore.update),
    GetById: catchWrapService(`service.query.getById`, queryStore.getById),
    GetAll: catchWrapService(`service.query.getAll`, queryStore.getAll),
    Delete: catchWrapService(`service.query.delete`, queryStore.delete),
};

module.exports = queryService;
