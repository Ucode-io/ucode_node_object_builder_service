const mongoose = require("mongoose");
const { v4 } = require("uuid");

const FunctionSchema = mongoose.Schema(
    {
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
        },
        description: {
            type: String,
        },
        body: {
            type: mongoose.Schema.Types.Mixed,
        },
        request_type: {
            type: String,
            enum: ["ASYNC", "SYNC"],
            default: "ASYNC"
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = FunctionSchema
