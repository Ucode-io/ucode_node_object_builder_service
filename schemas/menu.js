const mongoose = require("mongoose");
const { v4 } = require("uuid")

const MenuSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        label: {
            type: String,
        },
        parent_id: {
            type: String,
        },
        layout_id: {
            type: String,
        },
        table_id: {
            type: String,
        },
        type: {
            type: String,
        },
        icon: {
            type: String,
        },
        microfrontend_id: {
            type: String,
        },
        order: {
            type: Number,
        },
        webpage_id: {
            type: String,
        },
        menu_settings_id: {
            type: String,
        },
        attributes: {
            type: mongoose.Schema.Types.Mixed
        },
        report_setting_id: {
            type: String,
        },
        pivot_template_id: {
            type: String,
        },
        bucket_path: {
            type: String,
        },
        is_visible: {
            type: Boolean,
            default: false,
        },
        wiki_id: {
            type: String,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);
// MenuSchema.virtual("child_menus", {
//     ref: "object_builder_service.menu",
//     localField: "id",
//     foreignField: "parent_id",
//     justOne: false,
// })

// MenuSchema.virtual("tables", {
//     ref: "tables",
//     localField: "table_id",
//     foreignField: "id",
//     justOne: true,
// })

// MenuSchema.virtual("microfrontend", {
//     ref: "function_service.functions",
//     localField: "microfrontend_id",
//     foreignField: "id",
//     justOne: true,
// })

module.exports = MenuSchema
