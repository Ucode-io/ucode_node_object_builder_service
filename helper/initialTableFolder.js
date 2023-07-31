const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")

module.exports = async function (data) {
    console.log(": Initial table folder checking...")
    const mongoConn = await mongoPool.get(data.project_id)
    const Table = mongoConn.models['Table']
    const TableFolder = mongoConn.models['Table.folder']

    let tableFolder = await TableFolder.findOne({
        id: "96ed7568-e086-48db-92b5-658450cbd4a8",
    })

    if(!tableFolder) {
        tableFolder = await TableFolder.create({
            id: "96ed7568-e086-48db-92b5-658450cbd4a8",
            title: "Default folder",
            parent_id: null
        })
    }

    const tables = await Table.find()
    
    for(let table of tables) {
        if(!table.folder_id) {
            
            table.folder_id = tableFolder.id
            
            const a = await Table.findOneAndUpdate(
                {
                    id: table.id
                },
                {
                    $set: {
                        folder_id: tableFolder.id
                    }
                },
                {
                    new: true,
                    upsert: true
                }
            )
        }
    }
    console.log(": Initial table folder checking done!!!")
}