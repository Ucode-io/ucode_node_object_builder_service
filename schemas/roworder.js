const mongoose = require("mongoose");
const { v4 } = require("uuid");

const rowOrderSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true,
        },
        table_slug: {
            type: String,
        },
        value: {
            type: Number,
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
)


module.exports = rowOrderSchema