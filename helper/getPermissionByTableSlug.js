const ObjectBuilder = require("../models/object_builder");
const mongoPool = require('../pkg/pool');


module.exports = async (req) => {

    const mongoConn = await mongoPool.get(req.project_id)
    const Role = (await ObjectBuilder(true, req.project_id))['role'].models
    const Field = mongoConn.models['Field']
    const Tab = mongoConn.models['Tab']
    const CustomEvent = mongoConn.models['CustomEvent']
    const Table = mongoConn.models['Table']

    const role = await Role.findOne(
        { guid: req.role_id },
        null,
        { sort: { createdAt: -1 } }
    ).lean()

    if (!role) {
        console.log('WARNING role not found')
        throw new Error('Error role not found')
    }

    const tablePipeline = [
        {
            $match: {
                deleted_at: { $eq: new Date('1970-01-01T18:00:00.000+00:00') },
                slug: req.table_slug
            }
        },
        {
            $project: {
                __v: 0,
                _id: 0,
                created_at: 0,
                updated_at: 0
            }
        },
        {
            $lookup: {
                from: 'record_permissions',
                let: { tableSlug: req.table_slug },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$table_slug', '$$tableSlug'] },
                                    { $eq: ['$role_id', role.guid] }
                                ]
                            }
                        }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: 'record_permissions'
            }
        },
        {
            $project: {
                id: "$id",
                slug: '$slug',
                label: "$label",
                record_permissions: { $arrayElemAt: ['$record_permissions', 0] }
            }
        }
    ]

    const tables = await Table.aggregate(tablePipeline)
    if (!tables || !tables.length) {
        throw new Error("table not found in get table permissions")
    }

    const table = tables[0]
    // console.log(">>>>>>>> test #2 ", new Date())

    if (!table) {
        console.log('WARNING apps not found')
        return role
    }

    const fieldPipeline = [
        {
            $match: {
                table_id:
                    table.id,
            },
        },
        {
            $project: {
                __v: 0,
                _id: 0,
                created_at: 0,
                updated_at: 0,
            },
        },
        {
            $lookup: {
                from: "field_permissions",
                let: {
                    fieldID: "$id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$field_id", "$$fieldID"],
                                    },
                                    {
                                        $eq: [
                                            "$role_id",
                                            req.role_id,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $limit: 1,
                    },
                ],
                as: "field_permissions",
            },
        },
        {
            $unwind:
            {
                path: "$field_permissions",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                label: "$label",
                table_id: "$table_id",
                field_id: "$id",
                table_slug: "$field_permissions.table_slug",
                role_id: "$field_permissions.role_id",
                view_permission:
                    "$field_permissions.view_permission",
                edit_permission:
                    "$field_permissions.edit_permission",
            },
        },
    ]
    const getListActionPermissions = [
        {
            $match: {
                table_slug: req.table_slug,
            },
        },
        {
            $lookup: {
                from: "action_permissions",
                let: {
                    customEventID: "$id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            "$custom_event_id",
                                            "$$customEventID",
                                        ],
                                    },
                                    {
                                        $eq: [
                                            "$role_id",
                                            req.role_id,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $limit: 1,
                    },
                ],
                as: "action_permissions",
            },
        },
        {
            $unwind: {
                path: "$action_permissions",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project:
            {
                label: "$label",
                table_slug: "$table_slug",
                custom_event_id: "$id",
                table_slug: "$table_slug",
                role_id: "$action_permissions.role_id",
                permission:
                    "$action_permissions.permission",
                guid: "$action_permissions.guid",
            },
        },
    ]
    const tabPipeline = [
        {
            $project: {
                __v: 0,
                _id: 0,
                created_at: 0,
                updated_at: 0
            }
        },
        {
            $match: {
                type: 'relation',
                table_slug: table.slug
            }
        },
        {
            $lookup: {
                from: 'view_relation_permissions',
                let: { relationID: '$relation_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$relation_id', '$$relationID'] },
                                    { $eq: ['$role_id', role.guid] }
                                ]
                            }
                        }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: 'view_permissions'
            }
        },
        {
            $unwind: {
                path: "$view_permissions",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                label: "$label",
                guid: "$view_permissions.guid",
                table_slug: "$table_slug",
                relation_id: "$relation_id",
                view_permission: "$view_permissions.view_permission",
                edit_permission: "$view_permissions.edit_permission",
                create_permission: "$view_permissions.create_permission",
                delete_permission: "$view_permissions.delete_permission",
            }
        }
    ]

    let fields = await Field.aggregate(fieldPipeline)

    // console.log(">>>>>>>> test #3 ", new Date())
    let viewPermissions = await Tab.aggregate(tabPipeline)

    // console.log(">>>>>>>> test #4 ", new Date())
    let actionPermissions = await CustomEvent.aggregate(getListActionPermissions)

    // console.log(">>>>>>>> test #5 ", new Date())
    table.field_permissions = fields
    table.view_permissions = viewPermissions
    table.action_permissions = actionPermissions
    role.table = table
    role.project_id = req.project_id
    console.log("keys", Object.keys(role))
    for (const key of Object.keys(role)) {
        console.log("aaa::::Bbbb", role[key])
        console.log("aaa::::key", key)
    }
    // console.log("\n\n time ", start, "\n", end, "\n", end - start)
    return role
}