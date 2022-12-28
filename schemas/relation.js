const mongoose = require("mongoose");
const { v4 } = require("uuid");

const RelationSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_from: {
            type: String,
            required: [true, "Relation must have table_from"],
            sparse: true
        },
        field_from: {
            type: String,
            required: [true, "Relation must have field_from"],
            sparse: true
        },
        table_to: {
            type: String,
            sparse: true
        },
        field_to: {
            type: String,
            required: [true, "Relation must have field_to"],
            sparse: true
        },
        type: {
            type: String,
            required: [true, "Relation must have type"],
            enum: ["One2One", "One2Many", "Many2One", "Many2Many", "Recursive", "Many2Dynamic"]
        },
        view_fields: {
            type: [String],
            required: [true, "Relation must have view_fields"]
        },
        relation_field_slug: {
            type: String,
        },
        dynamic_tables: {
            type: mongoose.Schema.Types.Mixed
        },
        editable: {
            type: Boolean
        },
        auto_filters: {
            type: mongoose.Schema.Types.Mixed
        },
        is_user_id_default: {
            type: Boolean
        },
        cascadings: {
            type: mongoose.Schema.Types.Mixed
        },
        object_id_from_jwt: {
            type: Boolean
        },
        cascading_tree_table_slug: {
            type: String
        },
        cascading_tree_field_slug: {
            type: String
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        strict: true,
        strictQuery: false
    }
);

RelationSchema.virtual("fields", {
    ref: "Field",
    localField: "view_fields",
    foreignField: 'id',
    justOne: false
})

module.exports = RelationSchema
