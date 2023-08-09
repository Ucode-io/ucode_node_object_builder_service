const reportSettingStore = require("../storage/mongo/report_setting");
const catchWrapService = require("../helper/catchWrapService");

const reportSettingService = {
    GetByIdReportSetting: catchWrapService(`service.field.getByIdReportSetting`, reportSettingStore.getByIdReportSetting),
    GetListReportSetting: catchWrapService(`service.field.getListReportSetting`, reportSettingStore.getListReportSetting),
    UpsertReportSetting: catchWrapService(`service.field.upsertReportSetting`, reportSettingStore.upsertReportSetting),
    DeleteReportSetting: catchWrapService(`service.field.deleteReportSetting`, reportSettingStore.deleteReportSetting),

    SavePivotTemplate: catchWrapService(`service.field.savePivotTemplate`, reportSettingStore.savePivotTemplate),
    GetByIdPivotTemplate: catchWrapService(`service.field.getByIdPivotTemplate`, reportSettingStore.getByIdPivotTemplate),
    GetListPivotTemplate: catchWrapService(`service.field.getListPivotTemplate`, reportSettingStore.getListPivotTemplate),
    UpsertPivotTemplate: catchWrapService(`service.field.UpsertPivotTemplate`, reportSettingStore.upsertPivotTemplate),
    RemovePivotTemplate: catchWrapService(`service.field.removePivotTemplate`, reportSettingStore.removePivotTemplate)
};

module.exports = reportSettingService;
