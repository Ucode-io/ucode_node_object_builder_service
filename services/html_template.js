const htmlTemplateStore = require("../storage/mongo/html_template");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const htmlTemplateService = {
    Create: catchWrapServiceObjectBuilder(`service.htmlTemplate.create`, htmlTemplateStore.create),
    Update: catchWrapServiceObjectBuilder(`service.htmlTemplate.update`, htmlTemplateStore.update),
    GetSingle: catchWrapServiceObjectBuilder(`service.htmlTemplate.getSingle`, htmlTemplateStore.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.htmlTemplate.getList`, htmlTemplateStore.getList),
    Delete: catchWrapServiceObjectBuilder(`service.htmlTemplate.delete`, htmlTemplateStore.delete),
};

module.exports = htmlTemplateService;