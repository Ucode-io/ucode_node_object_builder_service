const eventStore = require("../storage/mongo/event");
const catchWrapService = require("../helper/catchWrapService");

const eventService = {
    Create: catchWrapService(`service.event.create`, eventStore.create),
    Update: catchWrapService(`service.event.update`, eventStore.update),
    GetSingle: catchWrapService(`service.event.getSingle`, eventStore.getSingle),
    GetList: catchWrapService(`service.event.getList`, eventStore.getList),
    Delete: catchWrapService(`service.event.delete`, eventStore.delete),
};

module.exports = eventService;
