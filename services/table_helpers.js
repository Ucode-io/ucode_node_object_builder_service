const tableHelpersStore = require("../storage/mongo/table_helpers");
const catchWrapService = require("../helper/catchWrapService");

const tableHelpersService = {
    ExportToJSON: catchWrapService(`service.tableHelpersStore.exportToJSON`, tableHelpersStore.exportToJSON),
    ImportFromJSON: catchWrapService(`service.tableHelpersStore.importFromJSON`, tableHelpersStore.importFromJSON)
};

module.exports = tableHelpersService;