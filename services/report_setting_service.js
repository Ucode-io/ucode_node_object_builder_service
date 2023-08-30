const reportSettingStore = require("../storage/mongo/report_setting");
const catchWrapService = require("../helper/catchWrapService");

const reportSettingService = {
    GetByIdReportSetting: catchWrapService(`service.report_setting.getByIdReportSetting`, reportSettingStore.getByIdReportSetting),
    GetListReportSetting: catchWrapService(`service.report_setting.getListReportSetting`, reportSettingStore.getListReportSetting),
    UpsertReportSetting: catchWrapService(`service.report_setting.upsertReportSetting`, reportSettingStore.upsertReportSetting),
    DeleteReportSetting: catchWrapService(`service.report_setting.deleteReportSetting`, reportSettingStore.deleteReportSetting),

    SavePivotTemplate: catchWrapService(`service.report_setting.savePivotTemplate`, reportSettingStore.savePivotTemplate),
    GetByIdPivotTemplate: catchWrapService(`service.report_setting.getByIdPivotTemplate`, reportSettingStore.getByIdPivotTemplate),
    GetListPivotTemplate: catchWrapService(`service.report_setting.getListPivotTemplate`, reportSettingStore.getListPivotTemplate),
    UpsertPivotTemplate: catchWrapService(`service.report_setting.UpsertPivotTemplate`, reportSettingStore.upsertPivotTemplate),
    RemovePivotTemplate: catchWrapService(`service.report_setting.removePivotTemplate`, reportSettingStore.removePivotTemplate)
};

module.exports = reportSettingService;
