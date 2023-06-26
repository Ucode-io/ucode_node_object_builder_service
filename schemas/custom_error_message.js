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
        language_id: {
            type: String,
        },
        action_type: {
            type: String,
            enum: [
                "DELETE", "GET_LIST",
                "GET_SINGLE", "UPDATE",
                "APPEND_MANY2MANY", "DELETE_MANY2MANY",
                "GET_LIST_SLIM", "GET_SINGLE_SLIM",
                "CREATE", "MULTIPLE_UPDATE", "GET_LIST_IN_EXCEL", "GET_FINANCIAL_ANALYTICS"
            ]
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = CustomErrorMessageSchema
