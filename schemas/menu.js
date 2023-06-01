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
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = MenuSchema
