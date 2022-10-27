const sectionStore = require("../storage/mongo/section");
const catchWrapService = require("../helper/catchWrapService");

const sectionService = {
    Update: catchWrapService(`service.section.update`, sectionStore.update),
    GetAll: catchWrapService(`service.section.getAll`, sectionStore.getAll),
    GetAllViewRelations: catchWrapService(`service.section.getAllViewRelations`, sectionStore.getAllViewRelations),
    UpsertViewRelations: catchWrapService(`service.section.upsertViewRelations`, sectionStore.upsertViewRelations),
    GetViewRelation: catchWrapService(`service.section.getSingleViewRelation`, sectionStore.getSingleViewRelation)
};

module.exports = sectionService;
