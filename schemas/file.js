const mongoose = require("mongoose");
const { v4 } = require("uuid");

const FileSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        tags: {
            type: [String],
        },
        storage: {
            type: String,
            required: true,
        },
        file_name_disk: {
            type: String,
            required: true,
        },
        file_name_download: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: true,
        },
        file_size: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = FileSchema;
