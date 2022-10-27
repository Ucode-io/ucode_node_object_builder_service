const mongoose = require("mongoose");
const { v4 } = require("uuid");

const DocumentSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        file_link: {
            type: String,
        },
        object_id: {
            type: String,
            required: [true, "document must have object_id"]
        },
        size: {
            type: Number
        },
        type: {
            type: String
        },
        table_slug: {
            type: String
        },
        name: {
            type: String
        },
        tags: {
            type: [String]
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = mongoose.model("document", DocumentSchema);
