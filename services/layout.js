const layoutStore = require("../storage/mongo/layout");
const catchWrapService = require("../helper/catchWrapService");

const layoutService = {
    Update: catchWrapService(`service.layout.update`, layoutStore.update),
    GetAll: catchWrapService(`service.layout.getAll`, layoutStore.getAll),
    GetSingleLayout: catchWrapService(`service.layout.GetSingleLayout`, layoutStore.GetSingleLayout),
    
};

module.exports = layoutService;