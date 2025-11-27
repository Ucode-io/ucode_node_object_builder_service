const viewStore = require("../storage/mongo/view");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const viewService = {
    Create: catchWrapServiceObjectBuilder(`service.view.create`, viewStore.create),
    Update: catchWrapServiceObjectBuilder(`service.view.update`, viewStore.update),
    GetSingle: catchWrapServiceObjectBuilder(`service.view.getSingle`, viewStore.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.view.getList`, viewStore.getList),
    Delete: catchWrapServiceObjectBuilder(`service.view.delete`, viewStore.delete),
    ConvertHtmlToPdf: catchWrapServiceObjectBuilder(`service.view.convertHtmlToPdf`, viewStore.convertHtmlToPdf),
    ConvertTemplateToHtml: catchWrapServiceObjectBuilder(`service.view.convertTemplateToHtml`, viewStore.convertTemplateToHtml),
    UpdateViewOrder: catchWrapServiceObjectBuilder(`service.view.updateViewOrder`, viewStore.updateViewOrder),
};

module.exports = viewService;