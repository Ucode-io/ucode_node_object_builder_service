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
            enum: ["FUNCTION", "MICRO_FRONTEND", "KNATIVE"]
        },
        framework_type: {
            type: String,
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
        },
        source_url: {
            type: String
        },
        branch: {
            type: String
        },
        pipeline_status: {
            type: String
        },
        repo_id: {
            type: String
        },
        error_message: {
            type: String
        },
        job_name: {
            type: String
        },
        resource: {
            type: String
        },
        provided_name: {
            type: String
        },
        request_type: {
            type: String,
            enum: ["ASYNC", "SYNC"],
            default: "ASYNC"
        },
        is_public: {
            type: Boolean,
            default: false,
        },
        max_scale: {
            type: Number,
            default: 3,
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