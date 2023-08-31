const mongoose = require("mongoose");
const Table = require("../models/table");
module.exports = setInterval(async function () {

    try {
        const tables = await Table.find(
            {
                deleted_at:{ $ne: "1970-01-01T18:00:00.000+00:00" }, 
            }
        )
        let deletedTables = []
        for (const table of tables) {
            await mongoose.connection.collection(table.slug).drop();
            deletedTables.push(table.slug)
            await Table.deleteOne({
                slug: table.slug
            })
        }
    } catch (error) {
        console.log(`delete collections failed: ${error}`);
    }

    
}, 1  *  24  *   60   *   60   *    1000);
//day * hour * minute * second * millisecond
