const customEventStore = require("../storage/mongo/custom_event");
const catchWrapService = require("../helper/catchWrapService");

const customEventService = {
    Create: catchWrapService(`service.custom_event.create`, customEventStore.create),
    Update: catchWrapService(`service.custom_event.update`, customEventStore.update),
    GetSingle: catchWrapService(`service.custom_event.getSingle`, customEventStore.getSingle),
    GetList: catchWrapService(`service.custom_event.getList`, customEventStore.getList),
    Delete: catchWrapService(`service.custom_event.delete`, customEventStore.delete),
    UpdateByFunctionId: catchWrapService( `service.custom_event.updateCustomEventByFunctionId`, customEventStore.updateCustomEventByFunctionId),
};

module.exports = customEventService;