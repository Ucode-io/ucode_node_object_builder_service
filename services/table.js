const grpc = require("@grpc/grpc-js");
const logger = require("../config/logger");
const tableStore = require("../storage/mongo/table");
const fieldStore = require("../storage/mongo/field");
const sectionStore = require("../storage/mongo/section");
const viewStore = require("../storage/mongo/view");
const catchWrapService = require("../helper/catchWrapService");
const con = require("../config/kafkaTopics");
const sendMessageToTopic = require("../config/kafka");
const converter = require("../helper/converter");
const cfg = require('../config/index');
const layoutStore = require("../storage/mongo/layout");
const customErrorMessageStore = require("../storage/mongo/custom_error_message");

const NAMESPACE = `services.table`;

const tableService = {
    Create: async (call, callback) => {
        logger.info(`[${NAMESPACE}].create request`);
        try {
            const response = await tableStore.create(call.request);

            call.request.id = response.id
            const resp = await fieldStore.createAll(call.request);

            let viewData = {}
            viewData.table_slug = call.request.slug
            viewData.type = "TABLE"
            viewData.app_id = call.request.app_id
            viewData.project_id = call.request.project_id
            viewData.env_id = call.env_id
            call.view = viewData
            const viewResp = await viewStore.create(call.view);

            callback(null, {
                id: response.id
            });
        } catch (error) {
            logger.error(`[${NAMESPACE}].create request finished with FAILURE`);
            logger.error(`[${NAMESPACE}].create - error: ${error.message}`);

            callback({ code: grpc.status.INTERNAL, message: error.message });
        }
    },
    Update: catchWrapService(`service.table.update`, tableStore.update),
    GetByID: catchWrapService(`service.table.getByID`, tableStore.getByID),
    GetAll: catchWrapService(`service.table.getAll`, tableStore.getAll),
    Delete: catchWrapService(`service.table.delete`, tableStore.delete),
    GetListTableHistory: catchWrapService(`service.table.GetListTableHistory`, tableStore.GetListTableHistory),
    GetTableHistoryById: catchWrapService(`service.table.GetTableHistoryById`, tableStore.GetTableHistoryById),
    RevertTableHistory: catchWrapService(`service.table.RevertTableHistory`, tableStore.RevertTableHistory),
    InsertVersionsToCommit: catchWrapService(`service.table.InsertVersionsToCommit`, tableStore.InsertVersionsToCommit),
};

module.exports = tableService;
