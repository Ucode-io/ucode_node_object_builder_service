const customErrorMessageStore = require("../storage/mongo/custom_error_message");
const catchWrapService = require("../helper/catchWrapService");

const customErrorMessageService = {
    Update: catchWrapService(`service.custom_error_message.update`, customErrorMessageStore.update),
    GetList: catchWrapService(`service.custom_error_message.getList`, customErrorMessageStore.getList),
};

module.exports = customErrorMessageService;
