const webPageStore = require("../storage/mongo/web_pages");
const catchWrapService = require("../helper/catchWrapService");

const webPageService = {
    Create: catchWrapService(`service.web_page.create`, webPageStore.create),
    Update: catchWrapService(`service.web_page.update`, webPageStore.update),
    GetById: catchWrapService(`service.web_page.getById`, webPageStore.getById),
    GetAll: catchWrapService(`service.web_page.getAll`, webPageStore.getAll),
    Delete: catchWrapService(`service.web_page.delete`, webPageStore.delete),
};

module.exports = webPageService;
