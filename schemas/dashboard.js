const mongoose = require("mongoose");
const { v4 } = require("uuid");

const DashboardSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        name: {
            type: String,
            required: [true, "Dashboard must have a name"],
            sparse: true
        },
        icon: {
            type: String,
            required: [true, "Dashboard must have an icon"],
        }
        // commit_id: {
        //            type: String,
        //            required: [true, "commit_id is required"],
        //        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

DashboardSchema.virtual("panels", {
    ref: "Panel",
    localField: "id",
    foreignField: "dashboard_id",
    justOne: false,
})
DashboardSchema.virtual("variables", {
    ref: "Variable",
    localField: "id",
    foreignField: "dashboard_id",
    justOne: false,
})

module.exports = DashboardSchema
