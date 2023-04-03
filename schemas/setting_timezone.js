const mongoose = require("mongoose");
const { v4 } = require("uuid");

const TimezoneSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4(),
            unique: true
        },
        name: {
            type: String,
            unique: true,
            required: [true, "TimezoneL must have name"],
        },
        text: {
            type: String,
            required: [true, "Timezone must have short_name"],
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

TimezoneSchema.index({name: 'text'});

module.exports = TimezoneSchema