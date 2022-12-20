const mongoose = require("mongoose");
const { v4 } = require("uuid");

const QuerySchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },
        title: {
            type: String
        },
        query_folder_id: {
            type: String,
            required: [true, "Query must have query_folder_id"],
            sparse: true
        },
        attributes: {
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
module.exports = QuerySchema
=======
module.exports = QuerySchema
>>>>>>> 2fbf8fabc2aec9207eea37ff75cd26705f4dcf74
