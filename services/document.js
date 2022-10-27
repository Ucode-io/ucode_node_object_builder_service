const documentStore = require("../storage/mongo/document");
const catchWrapService = require("../helper/catchWrapService");

const documentService = {
    Create: catchWrapService(`service.document.create`, documentStore.create),
    Update: catchWrapService(`service.document.update`, documentStore.update),
    GetSingle: catchWrapService(`service.document.getSingle`, documentStore.getSingle),
    GetList: catchWrapService(`service.document.getList`, documentStore.getList),
    Delete: catchWrapService(`service.document.delete`, documentStore.delete),
};

module.exports = documentService;
