const grpc = require("@grpc/grpc-js");
const logger = require("../config/logger");
const tableStore = require("../storage/mongo/table");
const fieldStore = require("../storage/mongo/field");
const viewStore = require("../storage/mongo/view");
const catchWrapService = require("../helper/catchWrapService");
const { v4 } = require("uuid");

const NAMESPACE = `services.table`;

const tableService = {
    Create: async (call, callback) => {
        logger.info(`[${NAMESPACE}].create request`);
        try {
            const response = await tableStore.create(call.request);

            call.request.id = response.id
            await fieldStore.createAll(call.request);

            let viewData = {}
            viewData.table_slug = call.request.slug
            viewData.type = "TABLE"
            viewData.app_id = call.request.app_id
            viewData.project_id = call.request.project_id
            viewData.env_id = call.env_id
            viewData.id = call.request.view_id
            call.view = viewData
            await viewStore.create(call.view);

            let sectionViewData = {
                table_slug: call.request.slug,
                type: "SECTION",
                app_id: call.request.app_id,
                project_id: call.request.project_id,
                env_id: call.env_id,
                id: v4()
            };
            await viewStore.create(sectionViewData);

            callback(null, {
                id: response.id,
                record_permission: response.record_permission,
                slug: response.slug
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
    GetTablesByLabel: catchWrapService(`service.table.GetTablesByLabel`, tableStore.getTablesByLabel),
    GetFieldsByTable: catchWrapService(`service.table.getFieldsByTable`, tableStore.getFieldsByTable),
    GetChart: catchWrapService(`service.table.getChart`, tableStore.getChart)
};

module.exports = tableService;
