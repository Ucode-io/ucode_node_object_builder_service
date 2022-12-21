const mongoose = require("mongoose");
const { v4 } = require("uuid");

const CustomEventSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        table_slug: {
            type: String,
        },
        icon: {
            type: String,
        },
        label: {
            type: String,
        },
        event_path: {
            type: String,
        },
        url: {
            type: String,
        },
        disable: {
            type: Boolean,
            default: false,
        },
        method: {
            type: String,
        },
        action_type: {
            type: String,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

CustomEventSchema.virtual("functions", {
    ref: "Function",
    localField: "event_path",
    foreignField: "id",
    justOne: false,
})


module.exports = mongoose.model("CustomEvent", CustomEventSchema);
