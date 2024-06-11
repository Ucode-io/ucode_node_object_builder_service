const mongoPool = require('../pkg/pool');



module.exports = async function (data) {
    try {
        const mongoConn = await mongoPool.get(data.project_id)
        const Field = mongoConn.models['Field']
        const Table = mongoConn.models['Table']

        let field = await Field.findOne({id: "17f735bf-a308-4785-954b-924e755a51b8", table_id: "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea"})

        if (field) {
            let field_default = await Field.findOne({id: "17f735bf-a308-4785-954b-924e755a51b8", table_id: "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea"})
            if (!field_default.attributes) {
                // console.log("ATTRIBUTES >>>")
                await Field.findOneAndUpdate({id: "17f735bf-a308-4785-954b-924e755a51b8"}, {$set: {attributes: {}}})
            }
            let table = await Table.findOne({id: "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea"})
            // console.log("THIS IS TABLE DEFAULT PAGE >>>> ", table)
            if (!table.is_changed) {
                // console.log("INSIDE IF >>>>>", !table.is_changed, table.is_changed)
                const a = await Table.findOneAndUpdate({id: "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea"}, {$set: {is_changed: true}}, {new: true,})
                // console.log("---> ", a)
            }
        }
        
        if (!field) {
            await Field.create({
                "id": "17f735bf-a308-4785-954b-924e755a51b8",
                "required": false,
                "slug": "default_page",
                "label": "Default page",
                "default": "",
                "type": "SINGLE_LINE",
                "attributes": {},
                "index": "string",
                "is_visible": false,
                "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0
            })

            await Table.findOneAndUpdate({id: "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea"}, {$set: {is_changed: true}})
        }

    } catch (error) {
        Logger.info("error creating default menu:", error)
    }
}