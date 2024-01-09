const mongoose = require("mongoose");
const { v4 } = require("uuid");

const incrementSeqSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true,
        },
        table_slug: {
            type: String,
        },
        field_slug: {
            type: String,
        },
        increment_by: {
            type: Number,
        },
        min_value: {
            type: Number,
        },
        max_value: {
            type: Number,
        },
        updated_table: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
)


module.exports = incrementSeqSchema