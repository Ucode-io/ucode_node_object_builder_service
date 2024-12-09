const functionStore = require("../storage/mongo/function");
const catchWrapService = require("../helper/catchWrapService");

const functionService = {
    Create: catchWrapService(`service.function.create`, functionStore.create),
    Update: catchWrapService(`service.function.update`, functionStore.update),
    GetSingle: catchWrapService(`service.function.getByID`, functionStore.getByID),
    GetList: catchWrapService(`service.function.getAll`, functionStore.getAll),
    Delete: catchWrapService(`service.function.delete`, functionStore.delete),
    GetListByRequestTime: catchWrapService(`service.function.getAllByRequestTime`, functionStore.getAllByRequestTime),
    UpdateManyByRequestTime: catchWrapService(`service.function.updateManyByRequestTime`, functionStore.updateManyByRequestTime),
};

module.exports = functionService;
