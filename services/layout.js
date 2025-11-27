const layoutStore = require("../storage/mongo/layout");
const catchWrapService = require("../helper/catchWrapService");

const layoutService = {
    Update: catchWrapService(`service.layout.update`, layoutStore.update),
    GetAll: catchWrapService(`service.layout.getAll`, layoutStore.getAll),
    GetSingleLayout: catchWrapService(`service.layout.GetSingleLayout`, layoutStore.GetSingleLayout),
    RemoveLayout: catchWrapService(`service.layout.RemoveLayout`, layoutStore.RemoveLayout),
    GetByID: catchWrapService(`service.layout.GetByID`, layoutStore.GetByID),
};

module.exports = layoutService;