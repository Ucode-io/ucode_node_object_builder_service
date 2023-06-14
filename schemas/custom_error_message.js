const mongoose = require("mongoose");
const { v4 } = require("uuid");

const CustomErrorMessageSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_id: {
            type: String,
        },
        code: {
            type: Number,
        },
        message: {
            type: String,
        },
        error_id: {
            type: String,
        },
        variables: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = CustomErrorMessageSchema
