const mongoose = require("mongoose");
const { v4 } = require("uuid");

const TableSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        label: {
            type: String,
            required: [true, "Table must have label"],
        },
        slug: {
            type: String,
            required: [true, "Table must have slug"],
        },
        description: {
            type: String,
        },
        deleted_at: {
            type: Date,
            default: "1970-01-01T18:00:00.000+00:00",
        },
        show_in_menu: {
            type: Boolean,
            default: true,
        },
        is_changed: {
            type: Boolean,
            default: true,
        },
        icon: {
            type: String,
        },
        subtitle_field_slug: {
            type: String,
        },
        folder_id: {
            type: String
        },
        commit_guid: {
            type: String
        },
        is_cached: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

TableSchema.index({'slug': 1, 'deleted_at': 1,}, {unique: true});
module.exports = mongoose.model("Table", TableSchema);
