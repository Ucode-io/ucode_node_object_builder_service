const mongoose = require("mongoose");
const { v4 } = require("uuid");

const EventLogSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_slug: {
            type: String,
        },
        guid: {
            type: String,
            default: v4()
        },
        date: {
            type: String,
        },
        effected_table: {
            type: String,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        strict: true,
        strictQuery: false
    }
);

module.exports = EventLogSchema
