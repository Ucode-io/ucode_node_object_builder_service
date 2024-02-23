const mongoose = require("mongoose");
const { v4 } = require("uuid");

const Version = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        name: {
            type: String,
            unique: true
        },
        is_current: {
            type: Boolean
        },
        description: {
            type: String
        },
        version_number: {
            type: Number
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = Version;
