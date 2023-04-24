const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")

module.exports = async function (data) {
    console.log(": Table schema check indexing...")
    const mongoConn = await mongoPool.get(data.project_id)
    const Table = mongoConn.models['Table']

    const indexes =  await Table.collection.getIndexes()
    
    if(indexes["slug_1_deleted_at_1"]) {
        await Table.collection.dropIndex("slug_1_deleted_at_1")
        await Table.collection.dropIndex("id_1")
        console.log(">>> SLUG_1_DELETED_AT_1 INDEX DELETE FROM TABLE COLLECTION")
    }

    if(indexes["id_1"]) {
        await Table.collection.dropIndex("id_1")
        console.log(">>> ID_1 INDEX DELETE FROM TABLE COLLECTION")
    }

    const tables = await Table.find({})
    for(let t of tables) {
        if(!t.version_ids) {
            const a = await Table.findOneAndUpdate(
                {
                    _id: t._id
                },
                {
                    $set: {
                        version_ids: []
                    }
                }
            )
        }
    }
}