const mongoose = require("mongoose");
const { v4 } = require("uuid");

const EventSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_slug: {
            type: String,
        },
        when: {
            type: mongoose.Schema.Types.Mixed,
        },
        does: {
            type: mongoose.Schema.Types.Mixed,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = mongoose.model("Event", EventSchema);
