const languageStore = require("../storage/mongo/language");
const catchWrapService = require("../helper/catchWrapService");

const languageService = {
    GetList: catchWrapService(`service.language.getList`, languageStore.getList),
    Update: catchWrapService(`service.language.update`, languageStore.update),
}

module.exports = languageService;