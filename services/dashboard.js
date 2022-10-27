const dashboardStore = require("../storage/mongo/dashboard");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const dashboardService = {
    Create: catchWrapServiceObjectBuilder(`service.dashboardStore.create`, dashboardStore.create),
    Update: catchWrapServiceObjectBuilder(`service.dashboardStore.update`, dashboardStore.update),
    GetSingle: catchWrapServiceObjectBuilder(`service.dashboardStore.getSingle`, dashboardStore.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.dashboardStore.getList`, dashboardStore.getList),
    Delete: catchWrapServiceObjectBuilder(`service.dashboardStore.delete`, dashboardStore.delete),
};

module.exports = dashboardService;