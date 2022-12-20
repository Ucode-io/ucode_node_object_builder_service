const mongoose = require("mongoose");
const { v4 } = require("uuid");

const WebPageSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        title: {
            type: String
        },
        components: {
            type: mongoose.Schema.Types.Mixed,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

<<<<<<< HEAD
module.exports = WebPageSchema
=======
module.exports = WebPageSchema
>>>>>>> 2fbf8fabc2aec9207eea37ff75cd26705f4dcf74
