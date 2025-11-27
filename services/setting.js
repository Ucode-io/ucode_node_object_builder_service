const settingStore = require("../storage/mongo/setting");
const catchWrapService = require("../helper/catchWrapService");

const settingService = {
    GetDefaultSettings: catchWrapService(`service.setting.update`, settingStore.getDefaultSettings),
    GetAll: catchWrapService(`service.setting.getAll`, settingStore.getAll),
    SetDefaultSettings: catchWrapService(`service.setting.getAllViewRelations`, settingStore.setDefaultSettings),
};

module.exports = settingService;
