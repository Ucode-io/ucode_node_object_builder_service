const menuStore = require("../storage/mongo/menu");
const catchWrapService = require("../helper/catchWrapService");

const menuService = {
    Create: catchWrapService(`service.menu.create`, menuStore.create),
    Update: catchWrapService(`service.menu.update`, menuStore.update),
    GetByID: catchWrapService(`service.menu.getByID`, menuStore.getByID),
    GetByLabel: catchWrapService(`service.menu.getByLabel`, menuStore.getByLabel),
    GetAll: catchWrapService(`service.menu.getAll`, menuStore.getAll),
    Delete: catchWrapService(`service.menu.delete`, menuStore.delete),
    UpdateMenuOrder: catchWrapService(`service.menu.updateMenuOrder`, menuStore.updateMenuOrder),
    GetWikiFolder: catchWrapService(`service.menu.getWikiFolder`, menuStore.getWikiFolder),

    CreateMenuSettings: catchWrapService(`service.menu.createMenuSettings`, menuStore.createMenuSettings),
    GetAllMenuSettings: catchWrapService(`service.menu.getAllMenuSettings`, menuStore.getAllMenuSettings),
    GetByIDMenuSettings: catchWrapService(`service.menu.getByIDMenuSettings`, menuStore.getByIDMenuSettings),
    UpdateMenuSettings: catchWrapService(`service.menu.updateMenuSettings`, menuStore.updateMenuSettings),
    DeleteMenuSettings: catchWrapService(`service.menu.deleteMenuSettings`, menuStore.deleteMenuSettings),

    CreateMenuTemplate: catchWrapService(`service.menu.createMenuTemplate`, menuStore.createMenuTemplate),
    GetAllMenuTemplate: catchWrapService(`service.menu.getAllMenuTemplate`, menuStore.getAllMenuTemplate),
    GetByIDMenuTemplate: catchWrapService(`service.menu.getByIDMenuTemplate`, menuStore.getByIDMenuTemplate),
    UpdateMenuTemplate: catchWrapService(`service.menu.updateMenuTemplate`, menuStore.updateMenuTemplate),
    DeleteMenuTemplate: catchWrapService(`service.menu.deleteMenuTemplate`, menuStore.deleteMenuTemplate),
};

module.exports = menuService;
