const ObjectBuilder = require("../models/object_builder");
const mongoPool = require('../pkg/pool');

let getSingleWithRelations = {
    getSingleWithRelations: async (req) => {
        const mongoConn = await mongoPool.get(req.project_id)
        const Relation = mongoConn.models['Relation']
        let params = req?.data
        delete params["client_type_id_from_token"]
        const allTables = (await ObjectBuilder(true, req.project_id))
        const tableInfo = allTables[req.table_slug]
        if (!tableInfo) {
            throw new Error("table not found")
        }


        const relations = await Relation.find({
            $or: [{
                table_from: req.table_slug,
            },
            {
                table_to: req.table_slug,
            },
            {
                "dynamic_tables.table_slug": req.table_slug
            }
            ]
        })


        let populateArr = []


        if (relations.length == 0) {
            result = await tableInfo.models.findOne({
                $and: [params]
            },
                {
                    createdAt: 0,
                    updatedAt: 0,
                    created_at: 0,
                    updated_at: 0,
                    _id: 0,
                    __v: 0
                }
            ).lean();
            count = await tableInfo.models.countDocuments(params);
        } else {
            tableParams = []
            for (const key of Object.keys(params)) {
                if (key.includes('.')) {
                    if (typeof params[key] === "object") {
                        let objectKeys = Object.keys(params[key])
                        let interval = {}
                        for (const objectKey of objectKeys) {
                            interval[objectKey] = params[key][objectKey]
                        }
                        if (tableParams[key.split('.')[0]]) {
                            tableParams[key.split('.')[0]][key.split('.')[1]] = interval
                        } else {
                            tableParams[key.split('.')[0]] = {
                                [key.split('.')[1]]: interval,
                                select: '-_id'
                            }
                        }
                    } else if (typeof (params[key]) !== "number" && key !== "search" && typeof (params[key]) !== "boolean") {
                        if (tableParams[key.split('.')[0]]) {
                            tableParams[key.split('.')[0]][key.split('.')[1]] = { $regex: params[key] }
                        } else {
                            tableParams[key.split('.')[0]] = {
                                [key.split('.')[1]]: { $regex: params[key] },
                                select: '-_id'
                            }
                        }
                    }
                }
            }
            for (const relation of relations) {
                if (relation.type === "One2Many") {
                    relation.table_to = relation.table_from
                } else if (relation.type === "Many2Many") {
                    continue
                }
                let table_to_slug = ""
                let deepRelations = []
                const field = tableInfo.fields.find(val => (val.relation_id === relation?.id))
                if (field) {
                    table_to_slug = field.slug + "_data"
                }
                if (table_to_slug === "") {
                    continue
                }
                // console.log("TEST::::::9")
                if (tableParams[table_to_slug]) {
                    papulateTable = {
                        path: table_to_slug,
                        match: tableParams[table_to_slug],
                        populate: deepRelations,
                    }
                } else {
                    if (relation.type === "Many2Dynamic") {
                        for (dynamic_table of relation.dynamic_tables) {
                            papulateTable = {
                                path: relation.relation_field_slug + "." + dynamic_table.table_slug + "_id_data",
                                populate: deepRelations
                            }
                            populateArr.push(papulateTable)
                        }
                        continue
                    }
                    papulateTable = {
                        path: table_to_slug,
                        populate: deepRelations
                    }
                }
                populateArr.push(papulateTable)
            }
            result = await tableInfo.models.findOne({
                ...params
            },
                {
                    createdAt: 0,
                    updatedAt: 0,
                    created_at: 0,
                    updated_at: 0,
                    _id: 0,
                    __v: 0
                }
            )
                .populate(populateArr)
                .lean()


        }
        return { table_slug: req.table_slug, data: result }
    }
}

module.exports = getSingleWithRelations