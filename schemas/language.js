const mongoose = require("mongoose");
const { v4 } = require("uuid");

const LanguageSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        key: {
            type: String,
            required: [true, "Language must have a key"],
        },
        translations: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, "Language must have translations"],
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = LanguageSchema;
