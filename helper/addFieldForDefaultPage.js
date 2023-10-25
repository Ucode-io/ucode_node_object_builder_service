const mongoPool = require('../pkg/pool');



module.exports = async function (data) {
    try {
        console.log(": Default page checking...")
        const mongoConn = await mongoPool.get(data.project_id)
        const Field = mongoConn.models['Field']

        let field = await Field.findOne({id: "17f735bf-a308-4785-954b-924e755a51b8", table_id: "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea"})
        
        if (!field) {
            await Field.create({
                "id": "17f735bf-a308-4785-954b-924e755a51b8",
                "required": false,
                "slug": "default_page",
                "label": "Default page",
                "default": "",
                "type": "SINGLE_LINE",
                "index": "string",
                "is_visible": false,
                "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0
            })
        }

    } catch (error) {
        console.log("error creating default menu:", error)
    }
}