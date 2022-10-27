const excelStore = require("../storage/mongo/excel");
const catchWrapService = require("../helper/catchWrapService");

const excelService = {
    ExcelRead: catchWrapService(`service.excel.read`, excelStore.ExcelRead),
    ExcelToDb: catchWrapService(`service.excel.create`, excelStore.ExcelToDb),
}
module.exports = excelService;