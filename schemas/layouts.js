const mongoose = require("mongoose");
const { v4 } = require("uuid");

const LayoutSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_id: {
            type: String,
            required: [true, "Layout must have table_id"],
            sparse: true
        },
        order: {
            type: Number,
            required: [true, "Layout must have order"],
        },
        label: {
            type: String,
            sparse: true
        },
        icon: {
            type: String
        },
        type: {
            type: String,
            enum: ['SimpleLayout', 'PopupLayout']
        },
        summary_fields: {
            type: mongoose.Schema.Types.Mixed
        },
        is_default: {
            type: Boolean,
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

LayoutSchema.virtual("tabs", {
    ref: "Tab",
    localField: "id",
    foreignField: 'layout_id',
    justOne: false
})

module.exports = LayoutSchema;
