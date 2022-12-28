const mongoose = require("mongoose");
const { v4 } = require("uuid");

const AppSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        name: {
            type: String,
            required: [true, "App must have name"],
        },
        description: {
            type: String,
        },
        tables: {
            type: mongoose.Schema.Types.Mixed,
        },
        icon: {
            type: String,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        strict: false,
        strictQuery: false
    }
);

module.exports = AppSchema
