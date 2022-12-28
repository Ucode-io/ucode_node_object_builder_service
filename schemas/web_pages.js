const mongoose = require("mongoose");
const { v4 } = require("uuid");

const WebPageSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        title: {
            type: String
        },
        components: {
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

module.exports = WebPageSchema
