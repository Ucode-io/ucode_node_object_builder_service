const mongoose = require("mongoose");
const { v4 } = require("uuid");

const CurrencySchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4(),
            unique: true
        },
        symbol: {
            type: String,
            required: [true, "Currency must have symbol"],
        },
        name: {
            type: String,
            unique: true,
            required: [true, "Currency must have name"],
        },
        symbol_native: {
            type: String,
            required: [true, "Currency must have symbol_native"],
        },
        decimal_digits: {
            type: Number,
            default: 0
        },
        rounding: {
            type: Number,
            default: 0
        },
        code: {
            type: String,
            unique: true,
            required: [true, "Currency must have code"],
        },
        name_plural: {
            type: String,
            required: [true, "Currency must have name_plural"],
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

CurrencySchema.index({symbol: 'text', name: 'text', code: 'text'});

module.exports = CurrencySchema
