const mongoose = require("mongoose");
const { v4 } = require("uuid");

const TableHistorySchema = mongoose.Schema(
    {
        guid: {
            type: String,
            default: v4
        },
        id: {
            type: String,
            default: v4
        },
        label: {
            type: String,
            required: [true, "Table must have label"],
        },
        slug: {
            type: String,
            // required: [true, "Table must have slug"],
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
        action_time: {
            type: Date
        },
        commit_type: {
            type: String,
            // enum: ["CREATE", "UPDATE", "DELETE", "INITIAL", "REVERT"]
        },
        folder_id: {
            type: String
        },
        author_id: {
            type: String
        },
        name: {
            type: String
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

TableHistorySchema.index({ 'slug': 1, 'guid': 1, }, { unique: true });
module.exports = TableHistorySchema
