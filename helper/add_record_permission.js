const mongoPool = require('../pkg/pool');

module.exports = async function (data) {
    try {
        const mongoConn = await mongoPool.get(data.project_id)
        const Field = mongoConn.models['Field']

        let field = await Field.findOne({id: "98412b66-0f8f-42a3-be9b-2adcc0169d8d"})
        
        if (!field) {
            await Field.create({
                "id": "98412b66-0f8f-42a3-be9b-2adcc0169d8d",
                "required": false,
                "slug": "delete_all",
                "label": "Delete all",
                "default": "",
                "type": "SINGLE_LINE",
                "index": "string",
                "attributes": {
                    "fields": {
                        "maxLength": {
                            "stringValue": "",
                            "kind": "stringValue"
                        },
                        "placeholder": {
                            "stringValue": "",
                            "kind": "stringValue"
                        },
                        "showTooltip": {
                            "boolValue": false,
                            "kind": "boolValue"
                        }
                    }
                },
                "is_visible": false,
                "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0
            })
        }

    } catch (error) { }
}

