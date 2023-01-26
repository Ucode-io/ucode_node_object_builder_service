const mongoose = require("mongoose");
const { v4 } = require("uuid");

const SectionSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_id: {
            type: String,
            required: [true, "Section must have table_id"],
            sparse: true
        },
        order: {
            type: Number, 
            required: [true, "Section must have order"],
        },
        column: {
            type: String,
            // required: [true, "Field must have column"],
            index: true
        },
        label: {
            type: String,
            sparse: true
        },
        icon: {
            type: String
        },
        fields: {
            type: mongoose.Schema.Types.Mixed,
        },
        is_summary_section: {
            type: Boolean,
            default: false
        },
        commit_id: {
            type: String,
            required: [true, "commit_id is required"],
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = SectionSchema
