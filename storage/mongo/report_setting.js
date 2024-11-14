const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const mongoPool = require("../../pkg/pool");
const menuStore = require("../mongo/menu");

let NAMESPACE = "storage.report_setting";

let reportSettingStore = {
    getByIdReportSetting: catchWrapDb(`${NAMESPACE}.getByIdReportSetting`, async (data) => {
        const mongoConn = await mongoPool.get(data.resource_environment_id)
        const ReportSetting = mongoConn.models['ReportSetting']

        if (!data.id) { throw new Error("required id") }

        let response = await ReportSetting.findOne({ id: data.id })
        return response;
    }),
    getListReportSetting: catchWrapDb(`${NAMESPACE}.getListReportSetting`, async (data) => {

        const mongoConn = await mongoPool.get(data.resource_environment_id)
        const ReportSetting = mongoConn.models['ReportSetting']

        let count = await ReportSetting.countDocuments()
        let response = await ReportSetting.find()

        return { count: count, report_settings: response };
    }),
    upsertReportSetting: catchWrapDb(`${NAMESPACE}.upsertReportSetting`, async (data) => {
        const mongoConn = await mongoPool.get(data.resource_environment_id)
        const ReportSetting = mongoConn.models['ReportSetting']
        const Menu = mongoConn.models['object_builder_service.menu']

        if (!data) { throw new Error("empty object") }
        if (!data.id) { data.id = v4() }
        let menu = await Menu.findOneAndUpdate({ report_setting_id: data.id }, { label: data.main_table_label }, { new: true })
        if (!menu) {
            menuStore.create({
                project_id: data.resource_environment_id,
                report_setting_id: data.id,
                type: "REPORT_SETTING",
                label: data.main_table_label,
                icon: "gear.svg",
                parent_id: "c57eedc3-a954-4262-a0af-376c65b5a274"
            })
        }
        await ReportSetting.updateOne(
            { id: data.id },
            {
                $set: {
                    main_table_label: data.main_table_label,
                    main_table_slug: data.main_table_slug,
                    rows: data.rows,
                    rows_relation: data.rows_relation,
                    columns: data.columns,
                    values: data.values,
                    filters: data.filters,
                    defaults: data.defaults
                }
            },
            { upsert: true }
        )

        let response = await ReportSetting.findOne({ id: data.id })
        return response;
    }),
    deleteReportSetting: catchWrapDb(`${NAMESPACE}.deleteReportSetting`, async (data) => {

        const mongoConn = await mongoPool.get(data.resource_environment_id)
        const ReportSetting = mongoConn.models['ReportSetting']
        const Menu = mongoConn.models['object_builder_service.menu']
        const MenuPermission = mongoConn.models['menu_permission']

        if (!data) { throw new Error("empty object") }

        if (!data.id) { throw new Error("empty object id") }

        await ReportSetting.deleteOne({ id: data.id })
        let menuItem = await Menu.findOneAndDelete({ report_setting_id: data.id })
        if (menuItem && menuItem.id) {
            MenuPermission.deleteMany({ menu_id: menuItem.id })
        }

        return {}
    }),
    savePivotTemplate: catchWrapDb(`${NAMESPACE}.savePivotTemplate`, async (data) => {
        const mongoConn = await mongoPool.get(data.resource_environment_id)
        const PivotTemplateSetting = mongoConn.models['PivotTemplate']
        const Menu = mongoConn.models['object_builder_service.menu']

        if (!data) { throw new Error("empty object") }

        if (!data.pivot_table_slug) { throw new Error("empty object pivot_table_slug") }

        if (!data.clone_id) { throw new Error("empty object clone_id") }

        let pivotTemplate = await PivotTemplateSetting.findOne({ id: data.clone_id })

        await PivotTemplateSetting.updateOne(
            { pivot_table_slug: data.pivot_table_slug, },
            {
                $set: {
                    main_table_label: pivotTemplate.main_table_label,
                    main_table_slug: pivotTemplate.main_table_slug,
                    from_date: data.from_date,
                    to_date: data.to_date,
                    status: data.status,
                    rows: pivotTemplate.rows,
                    rows_relation: pivotTemplate.rows_relation,
                    columns: pivotTemplate.columns,
                    values: pivotTemplate.values,
                    filters: pivotTemplate.filters,
                    defaults: pivotTemplate.defaults,
                    report_setting_id: data.report_setting_id
                }
            },
            { upsert: true }
        )

        let response = await PivotTemplateSetting.findOne({ pivot_table_slug: data.pivot_table_slug })

        let menu = await Menu.findOneAndUpdate({ pivot_template_id: response.id }, { label: data.pivot_table_slug }, { new: true })
            if (!menu) {
                menuStore.create({
                    project_id: data.resource_environment_id,
                    type: "PIVOT",
                    label: data.pivot_table_slug,
                    parent_id: "7c26b15e-2360-4f17-8539-449c8829003f", //saved pivot folder id
                    pivot_template_id: response.id,
                    icon: "chart-simple.svg"
                })
            }

        return response;
    }),
    getByIdPivotTemplate: catchWrapDb(`${NAMESPACE}.getByIdPivotTemplate`, async (data) => {

        const mongoConn = await mongoPool.get(data.resource_environment_id)
        const PivotTemplateSetting = mongoConn.models['PivotTemplate']

        if (!data.id) { throw new Error("empty object id") }

        if (data.id == "default") {
            let defaultCount = await PivotTemplateSetting.countDocuments({ pivot_table_slug: "DEFAULT" })

            let response
            if (defaultCount <= 0) {
                response = await PivotTemplateSetting({ id: v4(), pivot_table_slug: "DEFAULT", status: "SAVED" }).save()
            } else {
                await PivotTemplateSetting.updateOne(
                    { pivot_table_slug: "DEFAULT" },
                    { $set: { from_date: data.from_date, to_date: data.to_date } }
                )

                response = await PivotTemplateSetting.findOne({ pivot_table_slug: "DEFAULT" })
            }

            return response
        }

        await PivotTemplateSetting.updateOne(
            { id: data.id },
            { $set: { from_date: data.from_date, to_date: data.to_date } }
        )

        let response = await PivotTemplateSetting.findOne({ id: data.id })

        return response
    }),
    getListPivotTemplate: catchWrapDb(`${NAMESPACE}.getListPivotTemplate`, async (data) => {

        const mongoConn = await mongoPool.get(data.resource_environment_id)
        const PivotTemplateSetting = mongoConn.models['PivotTemplate']
        if (data.status == "HISTORY") {
            let response = await PivotTemplateSetting.find({ status: data.status }).sort({ pivot_table_slug: 1 })
            return { count: response.length, pivot_templates: response }
        }

        let defaultCount = await PivotTemplateSetting.countDocuments({ pivot_table_slug: "DEFAULT" })

        let defaultData;
        if (defaultCount > 0) { defaultData = await PivotTemplateSetting.findOne({ pivot_table_slug: "DEFAULT", status: "SAVED" }) }
        else { defaultData = await PivotTemplateSetting({ id: v4(), pivot_table_slug: "DEFAULT", status: "SAVED" }).save() }

        let response = await PivotTemplateSetting.find({ pivot_table_slug: { $ne: "DEFAULT" }, status: data.status }).sort({ pivot_table_slug: 1 })
        let resp = [defaultData, ...response]

        return { count: resp.length, pivot_templates: resp }
    }),
    upsertPivotTemplate: catchWrapDb(`${NAMESPACE}.upsertPivotTemplate`, async (data) => {

        const mongoConn = await mongoPool.get(data.resource_environment_id)
        const PivotTemplateSetting = mongoConn.models['PivotTemplate']
        const Menu = mongoConn.models['object_builder_service.menu']

        if (!data) { throw new Error("empty object") }

        if (!data.pivot_table_slug) { data.pivot_table_slug = "DEFAULT" }

        if (!data.id) { data.id = v4() }

        await PivotTemplateSetting.updateOne(
            { id: data.id },
            {
                $set: {
                    pivot_table_slug: data.pivot_table_slug,
                    main_table_label: data.main_table_label,
                    main_table_slug: data.main_table_slug,
                    from_date: data.from_date,
                    to_date: data.to_date,
                    status: data.status,
                    rows: data.rows,
                    rows_relation: data.rows_relation,
                    columns: data.columns,
                    values: data.values,
                    filters: data.filters,
                    defaults: data.defaults,
                    instance_id: data.instance_id,
                    report_setting_id: data.report_setting_id
                }
            },
            { upsert: true }
        )
        if (data.status === 'HISTORY') {
            let menu = await Menu.findOneAndUpdate({ pivot_template_id: data.id }, { label:  data.pivot_table_slug }, { new: true })
            if (!menu) {
                menuStore.create({
                    project_id: data.resource_environment_id,
                    type: "PIVOT",
                    label: data.pivot_table_slug,
                    parent_id: "e96b654a-1692-43ed-89a8-de4d2357d891", //history pivot folder id
                    pivot_template_id: data.id,
                    icon: "chart-simple.svg"
                })
            }
        } else if (data.status === "SAVED") {
            let menu = await Menu.findOneAndUpdate({ pivot_template_id: data.id }, { label: data.pivot_table_slug }, { new: true })
            if (!menu) {
                menuStore.create({
                    project_id: data.resource_environment_id,
                    type: "PIVOT",
                    label: data.pivot_table_slug,
                    parent_id: "7c26b15e-2360-4f17-8539-449c8829003f", //saved pivot folder id
                    pivot_template_id: data.id,
                    icon: "chart-simple.svg"
                })
            }
        }
        if (data.instance_id && data.pivot_table_slug != "DEFAULT") {
            await PivotTemplateSetting.updateOne(
                { id: data.instance_id },
                {
                    $set: {
                        pivot_table_slug: data.pivot_table_slug,
                        main_table_label: data.main_table_label,
                        main_table_slug: data.main_table_slug,
                        from_date: data.from_date,
                        to_date: data.to_date,
                        rows: data.rows,
                        rows_relation: data.rows_relation,
                        columns: data.columns,
                        values: data.values,
                        filters: data.filters,
                        defaults: data.defaults,
                        report_setting_id: data.report_setting_id
                    }
                },
                { upsert: true }
            )
        }

        let response = await PivotTemplateSetting.findOne({ id: data.id })

        return response
    }),
    removePivotTemplate: catchWrapDb(`${NAMESPACE}.removePivotTemplate`, async (data) => {

        const mongoConn = await mongoPool.get(data.resource_environment_id)
        const PivotTemplateSetting = mongoConn.models['PivotTemplate']
        const Menu = mongoConn.models['object_builder_service.menu']
        const MenuPermission = mongoConn.models['menu_permission']

        if (!data) { throw new Error("empty object") }

        if (!data.id) { throw new Error("empty object id") }

        await PivotTemplateSetting.deleteOne({ id: data.id })
        let menuItem = await Menu.findOneAndDelete({ pivot_template_id: data.id })
        if (menuItem && menuItem.id) {
            MenuPermission.deleteMany({ menu_id: menuItem.id })
        }

        return {}
    })
};

module.exports = reportSettingStore;
