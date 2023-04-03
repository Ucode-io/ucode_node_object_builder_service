const mongoose = require("mongoose");
const { v4 } = require("uuid");

const LanguageSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4(),
            unique: true
        },
        name: {
            type: String,
            required: [true, "Language must have name"],
        },
        short_name: {
            type: String,
            unique: true,
            required: [true, "Language must have short_name"],
        },
        native_name: {
            type: String,
            required: [true, "Language must have native_name"],
        },
        default: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

LanguageSchema.index({short_name: 'text', name: 'text', native_name: 'text'});

module.exports = LanguageSchema