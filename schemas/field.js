const mongoose = require("mongoose");
const { v4 } = require("uuid");

const FieldSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
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
        },
        commit_id: {
            type: String,
            required: false,
        },
        relation_field: {
            type: String
        },
        is_system: {
            type: Boolean,
            default: false
        },
        show_label: {
            type: Boolean,
            default: true
        },
        enable_multilanguage: {
            type: Boolean,
            default: false
        },
        hide_multilanguage: {
            type: Boolean,
            default: false
        },
        label_uz: {
            type: String,
        },
        label_en: {
            type: String,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);
FieldSchema.virtual("field_permissions", {
    ref: "field_permission",
    localField: "id",
    foreignField: "field_id",
    justOne: true,
})

FieldSchema.index({id: 1, commit_id: -1}, {unique: true})
FieldSchema.index({ slug: 1, table_id: 1, }, { unique: true });
module.exports = FieldSchema
