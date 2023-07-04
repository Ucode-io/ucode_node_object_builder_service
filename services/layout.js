const layoutStore = require("../storage/mongo/layout");
const catchWrapService = require("../helper/catchWrapService");

const layoutService = {
    Update: catchWrapService(`service.layout.update`, layoutStore.update),
    GetAll: catchWrapService(`service.layout.getAll`, layoutStore.getAll),
    
};

module.exports = layoutService;