const mongoose = require("mongoose");
const { v4 } = require("uuid");

const TabSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        order: {
            type: Number,
            required: [true, "Tab must have order"],
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
            enum: ['relation', 'section']
        },
        layout_id: {
            type: String,
            required: [true, "Table must have layout_id"],
        },
        relation_id: {
            type: String,
        },
        table_slug: {
            type: String,
        },
        attributes: {
            type: mongoose.Schema.Types.Mixed
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

TabSchema.virtual("sections", {
    ref: "Section",
    localField: "id",
    foreignField: 'tab_id',
    justOne: false
})

module.exports = TabSchema;
