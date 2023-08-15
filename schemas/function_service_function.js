const mongoose = require('mongoose');
const { v4 } = require("uuid");

const FunctionServiceCustomEventSchema = mongoose.Schema({
        id: {
            type: String,
            default: v4,
            unique: true
        },
        name: {
            type: String,
        },
        path: {
            type: String,
            unique: true
        },
        type: {
            type: String,
            enum: ["FUNCTION", "MICRO_FRONTEND"]
        },
        description: {
            type: String,
        },
        project_id: {
            type: String,
        },
        environment_id: {
            type: String,
        },
        function_folder_id: {
            type: String,
        },
        request_time: {
            type: String,
        },
        url: {
            type: String,
        },
        password: {
            type: String,
        },
        ssh_url: {
            type: String,
        },
        gitlab_id: {
            type: String,
        },
        gitlab_group_id: {
            type: String
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);
// const FucntionServiceCustomEvent = mongoose.model('function_service.function', FunctionServiceCustomEventSchema, 'function_service.functions');

module.exports = FunctionServiceCustomEventSchema;