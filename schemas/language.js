const mongoose = require("mongoose");
const { v4 } = require("uuid");

const LanguageSchema = mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            default: v4,
        },
        key: {
            type: String,
            required: [true, "Language must have a key"],
        },
        translations: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, "Language must have translations"],
        },
        category: {
            type: String,
            enum: [
                'Menu',
                'Profile Setting',
                'Setting',
                'Table',
                'Permission',
                'Resource',
                'API keys',
                'Custom endpoint',
                'UserInvite',
                'Functions',
                'Activity Logs',
                'Layout',
                'Fields',
                'Field settings',
                'Field type',
                'Relation',
                'Action',
                'Custom error',
                'Calendar view',
                'Microfrontend',
                'LoginPage'
            ],
            required: [true, "Language must have a category"],
        },
        platform: {
            type: String,
            default: "Admin",
            required: true,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

LanguageSchema.index({ key: 1, category: 1, platform: 1 }, { unique: true });

module.exports = LanguageSchema;