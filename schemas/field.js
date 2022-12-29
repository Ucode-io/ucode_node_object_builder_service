const mongoose = require("mongoose");
const { v4 } = require("uuid");

const FieldSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_id: {
            type: String,
            required: [true, "Field must have table_id"],
            sparse: true
        },
        required: {
            type: Boolean, 
            default: false,
        },
        slug: {
            type: String,
            required: [true, "Field must have slug"],
            index: true
        },
        label: {
            type: String,
            required: [true, "Field must have label"],
            sparse: true
        },
        default: {
            type: String,
        },
        type: {
            type: String,
        },
        index: {
            type: String,
        },
        attributes: {
            type: mongoose.Schema.Types.Mixed,
        },
        is_visible: {
            type: Boolean,
            default: true,
        },
        autofill_field: {
            type: String,
        },
        autofill_table: {
            type: String,
        },
        relation_id: {
            type: String,
        },
        unique: {
            type: Boolean,
        },
        automatic: {
            type: Boolean,
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

module.exports = FieldSchema
