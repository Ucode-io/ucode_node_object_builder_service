const mongoose = require("mongoose");
const { v4 } = require("uuid");

const ViewRelationSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_slug: {
            type: String,
            required: [true, "Section must have table_slug"],
            sparse: true
        },
        relations: {
            type: mongoose.Schema.Types.Mixed
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

module.exports = ViewRelationSchema
