const mongoose = require("mongoose");
const { v4 } = require("uuid");

const ViewSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_slug: {
            type: String,
        },
        type: {
            type: String,
        },
        group_fields: {
            type: mongoose.Schema.Types.Mixed,
        },
        view_fields: {
            type: [String]
        },
        main_field: {
            type: String,
        },
        disable_dates: {
            type: mongoose.Schema.Types.Mixed,
        },
        quick_filters: {
            type: mongoose.Schema.Types.Mixed,
        },
        name: {
            type: String,
        },
        columns: {
            type: mongoose.Schema.Types.Mixed,
        },
        calendar_from_slug: {
            type: String
        },
        calendar_to_slug: {
            type: String
        },
        time_interval: {
            type: Number,
        },
        relation_table_slug: {
            type: String,
        },
        relation_id: {
            type: String,
        },
        app_id: {
            type: String,
        },
        attributes: {
            type: mongoose.Schema.Types.Mixed
        },
        navigate: {
            type: mongoose.Schema.Types.Mixed
        },
        function_path: {
            type: String
        },
        order: {
            type: Number,
            default: 0
        },
        name_uz: {
            type: String,
        },
        name_en: {
            type: String,
        },
        table_id: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

ViewSchema.virtual("view_permissions", {
    ref: "view_permission",
    localField: "id",
    foreignField: "view_id",
    justOne: true,
})

module.exports = ViewSchema
