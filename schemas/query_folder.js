const mongoose = require("mongoose");
const { v4 } = require("uuid")

const QueryFolderSchema = mongoose.Schema(
    {
        id: {
            type: String,
            default: v4,
            unique: true
        },

        title: {
            type: String,
            required: [true, "Query Folder must have a title"],
        },
        parent_id: {
            type: String,
        }
    },
    {
        timestamps: {createdAt: "created_at", updatedAt: "updated_at"},
        toObject: {virtuals: true},
        toJSON: {virtuals: true},
    }
);

<<<<<<< HEAD
module.exports =  QueryFolderSchema
=======
module.exports =  QueryFolderSchema
>>>>>>> 2fbf8fabc2aec9207eea37ff75cd26705f4dcf74
