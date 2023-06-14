const customErrorMessageStore = require("../storage/mongo/custom_error_message");
const catchWrapService = require("../helper/catchWrapService");

const customErrorMessageService = {
    Update: catchWrapService(`service.custom_error_message.update`, customErrorMessageStore.update),
    GetList: catchWrapService(`service.custom_error_message.getList`, customErrorMessageStore.getList),
    GetById: catchWrapService(`service.custom_error_message.getById`, customErrorMessageStore.getById),
    Create: catchWrapService(`service.custom_error_message.create`, customErrorMessageStore.create),
    Delete: catchWrapService(`service.custom_error_message.delete`, customErrorMessageStore.delete)
};

module.exports = customErrorMessageService;
