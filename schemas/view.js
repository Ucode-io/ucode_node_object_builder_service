const mongoose = require("mongoose");
const { v4 } = require("uuid");

const ViewSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_slug: {
            type: String,
        },
        type: {
            type: String,
        },
        group_fields: {
            type: mongoose.Schema.Types.Mixed,
        },
        view_fields: {
            type: [String]
        },
        main_field: {
            type: String,
        },
        disable_dates: {
            type: mongoose.Schema.Types.Mixed,
        },
        quick_filters: {
            type: mongoose.Schema.Types.Mixed,
        },
        users: {
            type: mongoose.Schema.Types.Mixed,
        },
        name: {
            type: String,
        },
        columns: {
            type: mongoose.Schema.Types.Mixed,
        },
        calendar_from_slug: {
            type: String
        },
        calendar_to_slug: {
            type: String
        },
        time_interval: {
            type: Number,
        },
        multiple_insert: {
            type: Boolean,
        },
        status_field_slug: {
            type: String,
        },
        is_editable: {
            type: Boolean,
        },
        relation_table_slug: {
            type: String,
        },
        relation_id: {
            type: String,
        },
        summaries: {
            type: mongoose.Schema.Types.Mixed,
        },
        multiple_insert_field: {
            type: String
        },
        updated_fields: {
            type: mongoose.Schema.Types.Mixed,
        },
        default_values: {
            type: mongoose.Schema.Types.Mixed,
        },
        app_id: {
            type: String,
        },
        table_label: {
            type: String,
        },
        action_relations: {
            type: mongoose.Schema.Types.Mixed
        },
        default_limit: {
            type: String,
        },
        attributes: {
            type: mongoose.Schema.Types.Mixed
        },
        navigate: {
            type: mongoose.Schema.Types.Mixed
        },
        default_editable: {
            type: Boolean,
        },
        creatable: {
            type: Boolean,
        },
        function_path: {
            type: String
        },
        // commit_id: {
        //     type: Number,
        //     required: [true, "commit_id is required"],
        // },
        // commit_guid: {
        //     type: String,
        //     required: [true, "commit_guid is required"],
        // }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = ViewSchema
