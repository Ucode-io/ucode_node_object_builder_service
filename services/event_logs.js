const eventLogsStore = require("../storage/mongo/event_logs");
const catchWrapService = require("../helper/catchWrapService");

const eventLogsService = {
    GetSingle: catchWrapService(`service.event_logs.getSingle`, eventLogsStore.getSingle),
    GetList: catchWrapService(`service.event_logs.getList`, eventLogsStore.getList),
};

module.exports = eventLogsService;