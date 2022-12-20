const mongoose = require("mongoose");
const { v4 } = require("uuid");

const panelSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true,
        },
        title: {
            type: String,
            required: [true, "Panel must have a title"],
        },
        query: {
            type: String,
            required: [true, "Panel must have a query"],
        },
        coordinates: {
            type: [Number],
            required: [true, "Panel must have a coordinates"],
        },
        attributes: {
            type: mongoose.Schema.Types.Mixed,
        },
        dashboard_id: {
            type: String,
            required: [true, "Panel must have a dashboard_id"],
            sparse: true,
        },
        has_pagination: {
            type: Boolean,
            required: [true, "Panel must have a has_pagination"],
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
)


module.exports = panelSchema
