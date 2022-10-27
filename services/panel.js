const panelStore = require("../storage/mongo/panel");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const panelService = {
    Create: catchWrapServiceObjectBuilder(`service.panelStore.create`, panelStore.create),
    Update: catchWrapServiceObjectBuilder(`service.panelStore.update`, panelStore.update),
    UpdateCoordinates: catchWrapServiceObjectBuilder(`service.panelStore.update`, panelStore.updateCoordinates),
    GetSingle: catchWrapServiceObjectBuilder(`service.panelStore.getSingle`, panelStore.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.panelStore.getList`, panelStore.getList),
    Delete: catchWrapServiceObjectBuilder(`service.panelStore.delete`, panelStore.delete),
}

module.exports = panelService;