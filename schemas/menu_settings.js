const mongoose = require("mongoose");
const { v4 } = require("uuid")

const MenuSettingsSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        icon_style: {
            type: String,
            enum: ["SIMPLE", "MODERN"]
        },
        icon_size: {
            type: String,
            enum: ["SMALL", "MEDIUM", "BIG"]
        },
        menu_template_id: {
            type: String
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = MenuSettingsSchema
