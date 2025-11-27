const catchWrapService = require("../helper/catchWrapService");
const cascadingStore = require("../storage/mongo/cascading");

const cascadingService = {
    GetCascadings: catchWrapService(`service.relation.getCascaderList`, cascadingStore.getCascadingList)
};

module.exports = cascadingService;
