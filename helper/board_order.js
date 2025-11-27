const { VIEW_TYPES } = require('../helper/constants')


module.exports = {
    OrderUpdate: async (mongoConn, tableInfo, table_slug, data) => {
        try {
            const Table = mongoConn.models['Table']
            const View = mongoConn.models['View']

            const foundTable = await Table.findOne({slug: table_slug})
            if (!foundTable) return 

            const foundView = await View.findOne({table_slug: foundTable.slug, type: VIEW_TYPES.BOARD}).lean()
            if (!foundView) return
            
            let { tabs } = foundView.attributes
            tabs  = tabs ? tabs : []

            let field_slug = ""
            const tab_object_ids = tabs.map(el => {
                field_slug = el.slug
                return el.value
            })

            const oldObject = await tableInfo.models.findOne({guid: data.id})

            if (oldObject) {
            
                if ((oldObject.board_order === null || oldObject.board_order === undefined) && data.board_order) {
                    await tableInfo.models.updateMany(
                        {
                            board_order: {
                                $gte: data.board_order,
                            },
                            [field_slug]: data[field_slug]
                        },
                        { $inc: { board_order: 1 } }
                    )

                    await tableInfo.models.findOneAndUpdate(
                        { guid: data.id },
                        { board_order: data.board_order }
                    )
                } else if (oldObject.board_order < data.board_order) {
                    await tableInfo.models.updateMany(
                        {
                            board_order: {
                                $gte: oldObject.board_order,
                                $lte: data.board_order
                            },
                            [field_slug]: data[field_slug]
                        },
                        { $inc: { board_order: -1 } }
                    )
    
                    await tableInfo.models.findOneAndUpdate(
                        { guid: data.id },
                        { board_order: data.board_order }
                    )
                } else if (oldObject.board_order > data.board_order) {
                    await tableInfo.models.updateMany(
                        {
                            board_order: {
                                $gte: data.board_order,
                                $lte: oldObject.board_order
                            },
                            [field_slug]: data[field_slug]
                        },
                        {
                            $inc: { board_order: 1 }
                        }
                    )
    
                    await tableInfo.models.findOneAndUpdate(
                        { guid: data.id },
                        { board_order: data.board_order }
                    )
                }
            }


            return 
        } catch (err) {
            throw err
        }
    },
    BoardOrderChecker: async (mongoConn, table_slug) => {
        try {
            const Field = mongoConn.models['Field']
            const Table = mongoConn.models['Table']

            const foundTable = await Table.findOne({slug: table_slug})
    
            const board_order = await Field.findOne({ table_slug: table_slug, slug: "board_order" })
    
            if(!board_order) {
                await Field.create({
                    "id": "93999892-78b0-4674-9e42-6a2a41524ebe",
                    "table_id": foundTable.id,
                    "required": false,
                    "slug": "board_order",
                    "label": "BOARD ORDER",
                    "default": "",
                    "type": "NUMBER",
                    "index": "string",
                    "attributes": {
                        "fields": {
                            "icon": { "stringValue": "", "kind": "stringValue" },
                            "placeholder": { "stringValue": "", "kind": "stringValue" },
                            "showTooltip": { "boolValue": false, "kind": "boolValue" }
                        }
                    },
                    "is_visible": false,
                    "autofill_field": "",
                    "autofill_table": "",
                    "created_at": new Date(),
                    "updated_at": new Date(),
                    "__v": 0
                })
            }
    
        } catch (err) {
            throw err
        }
    }
}