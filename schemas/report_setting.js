const mongoose = require("mongoose");
const { v4 } = require("uuid");

const PivotTemplateSettingSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        instance_id: {
            type: String,
        },
        pivot_table_slug: {
            type: String,
            required: [true, "Field must have pivot table slug"]
        },
        main_table_label: {
            type: String
        },
        main_table_slug: {
            type: String
        },
        from_date: {
            type: String
        },
        to_date: {
            type: String
        },
        status: {
            type: String,
            enum: ["SAVED", "HISTORY"]
        },
        rows: {
            type: mongoose.Schema.Types.Mixed,
        },
        rows_relation: {
            type: mongoose.Schema.Types.Mixed,
        },
        columns: {
            type: mongoose.Schema.Types.Mixed,
        },
        values: {
            type: mongoose.Schema.Types.Mixed,
        },
        filters: {
            type: mongoose.Schema.Types.Mixed,
        },
        defaults: {
            type: mongoose.Schema.Types.Mixed,
        },
        report_setting_id: {
            type: String
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

const ReportSettingSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        main_table_label: {
            type: String,
        },
        main_table_slug: {
            type: String,
        },
        rows: {
            type: mongoose.Schema.Types.Mixed,
        },
        rows_relation: {
            type: mongoose.Schema.Types.Mixed,
        },
        columns: {
            type: mongoose.Schema.Types.Mixed,
        },
        values: {
            type: mongoose.Schema.Types.Mixed,
        },
        filters: {
            type: mongoose.Schema.Types.Mixed,
        },
        defaults: {
            type: mongoose.Schema.Types.Mixed,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

const PivotTemplateSetting = mongoose.model("pivot_template_setting", PivotTemplateSettingSchema);
const ReportSetting = mongoose.model("report_setting", ReportSettingSchema);

module.exports = {
    PivotTemplateSettingSchema,
    ReportSettingSchema
};
