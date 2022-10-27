const mongoose = require("mongoose");
const { v4 } = require("uuid");

const VariabledSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        slug: {
            type: String,
            required: [true, "Variable must have a slug"],
            sparse: true
        },
        type: {
            type: String,
            enum: ["QUERY", "CUSTOM"],
            required: [true, "Variable must have a type"]
        },
        label: {
            type: String,
            required: [true, "Variable must have an label"],
        },
        dashboard_id: {
            type: String,
            required: [true, "Variable must have an dashboard_id"],
        },
        field_slug: {
            type: String,
        },
        options: {
            type: [String],
            required: [true, "Variable must have an options"],
        },
        view_field_slug: {
            type: String,
            required: [true, "Variable must have an view_field_slug"],
        },
        query: {
            type: String,
            required: [true, "Variable must have an query"],
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = mongoose.model("Variable", VariabledSchema);