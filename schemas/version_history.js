const mongoose = require("mongoose");
const { ACTION_TYPES } = require('../helper/constants')
const { v4 } = require("uuid");

const VersionHistory = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        action_source: {
            type: String,
        },
        action_type: {
            type: String,
            enum: ACTION_TYPES
        },
        previus: {
            type: String,
        },
        current: {
            type: String
        },
        date: {
            type: String
        },
        user_info: {
            type: String
        },
        request: {
            type: String
        },
        response: {
            type: String
        },
        api_key: {
            type: String
        },
        type: {
            type: String,
            enum: ["GLOBAL", "API_KEY", "DOWN", "UP"],
            default: "GLOBAL",
        },
        table_slug: {
            type: String,
        },
        version_id: {
            type: String,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

VersionHistory.virtual('version', {
    ref: 'object_builder_service.version', 
    localField: 'version_id',
    foreignField: 'id', 
    justOne: true 
});


module.exports = VersionHistory
