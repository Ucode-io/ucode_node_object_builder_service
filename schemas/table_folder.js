const mongoose = require("mongoose");
const { v4 } = require("uuid")

const TableFolderSchema = mongoose.Schema(
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
        },
        icon: {
            type: String
        }
    },
    {
        timestamps: {createdAt: "created_at", updatedAt: "updated_at"},
        toObject: {virtuals: true},
        toJSON: {virtuals: true},
    }
);

module.exports =  TableFolderSchema
