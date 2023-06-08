const menuStore = require("../storage/mongo/menu");
const catchWrapService = require("../helper/catchWrapService");

const menuService = {
    Create: catchWrapService(`service.menu.create`, menuStore.create),
    Update: catchWrapService(`service.menu.update`, menuStore.update),
    GetByID: catchWrapService(`service.menu.getByID`, menuStore.getByID),
    GetAll: catchWrapService(`service.menu.getAll`, menuStore.getAll),
    Delete: catchWrapService(`service.menu.delete`, menuStore.delete),
    UpdateMenuOrder: catchWrapService(`service.menu.updateMenuOrder`, menuStore.updateMenuOrder),
};

module.exports = menuService;
