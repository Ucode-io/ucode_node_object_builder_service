const languageStore = require("../storage/mongo/language");
const catchWrapService = require("../helper/catchWrapService");

const languageService = {
    Create: catchWrapService(`service.language.create`, languageStore.create),
    GetById: catchWrapService(`service.language.getById`, languageStore.getById),
    GetList: catchWrapService(`service.language.getList`, languageStore.getList),
    Update: catchWrapService(`service.language.update`, languageStore.update),
    Delete: catchWrapService(`service.language.delete`, languageStore.delete),
}

module.exports = languageService;