const mongoose = require("mongoose");
const { v4 } = require("uuid")

const MenuTemplateSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        background: {
            type: String
        },
        active_background: {
            type: String
        },
        text: {
            type: String
        },
        active_text: {
            type: String
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = MenuTemplateSchema
