const mongoose = require("mongoose");
const { v4 } = require("uuid");

const HtmlTemplateSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_slug: {
            type: String,
            required: [true, "table must have be"],
        },
        html: {
            type: String,
        },
        title: {
            type: String,
        },
        size: {
            type: mongoose.Schema.Types.Mixed,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        strict: true,
        strictQuery: true
    }
);

module.exports = HtmlTemplateSchema
