const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const mongoPool = require('../../pkg/pool')
const tableVersion = require('../../helper/table_version');
const constants = require("../../helper/constants");
const { struct } = require("pb-util/build");
let NAMESPACE = "storage.menu";


let menuStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            if (!constants.MENU_TYPES.includes(data.type)) {
                throw new Error("Unsupported menu type");
            }
            const mongoConn = await mongoPool.get(data.project_id)

            const Menu = mongoConn.models['object_builder_service.menu']
            const menuPermissionTable = mongoConn.models['menu_permission']
            if (data.type === "TABLE") {
                let table = await tableVersion(mongoConn, { id: data.table_id, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, data.version_id, true)
                if (!data.icon) data.icon = table?.icon
                if (!data.label) data.label = table?.label
            }

            const response = await Menu.create(data);

            const roleTable = mongoConn.models["role"]
            const roles = await roleTable?.find({})
            let permissions = []
            for (const role of roles) {
                let permissionRecord = {
                    guid: v4(),
                    menu_id: response?.id,
                    role_id: role.guid,
                    delete: true,
                    write: true,
                    update: true,
                    read: true,
                }
                permissions.push(permissionRecord)

            }
            if (permissions.length) {
                await menuPermissionTable.insertMany(permissions)
            }

            return response;
        } catch (err) {
            throw err
        }

    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            if (!constants.MENU_TYPES.includes(data.type)) {
                throw new Error("Unsupported menu type");
            }
            const mongoConn = await mongoPool.get(data.project_id)

            const Menu = mongoConn.models['object_builder_service.menu']

            if (data.type === "TABLE") {
                let table = await tableVersion(mongoConn, { id: data.table_id, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, data.version_id, true)
                if (!data.icon) data.icon = table?.icon
                if (!data.label) data.label = table?.label
            }

            const menu = await Menu.updateOne(
                {
                    id: data.id,
                },
                {
                    $set: data
                }
            )

            return menu;
        } catch (err) {
            throw err
        }

    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {

            const mongoConn = await mongoPool.get(data.project_id) // project_id: is resource_id

            const Menu = mongoConn.models['object_builder_service.menu']

            let query = {
                parent_id: data.parent_id,
                label: RegExp(data.search, "i")
            }
            const pipelines = [
                {
                    '$match': query
                },
                {
                    '$lookup': {
                        'from': 'tables',
                        'localField': 'table_id',
                        'foreignField': 'id',
                        'as': 'table'
                    }
                },
                {
                    '$lookup': {
                        'from': 'function_service.functions',
                        'localField': 'microfrontend_id',
                        'foreignField': 'id',
                        'as': 'microfrontend'
                    }
                },
                {
                    '$lookup': {
                        from: "web_pages.web_page",
                        let: {
                            webpage_id: "$webpage_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ["$id", "$$webpage_id"],
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                $sort: {
                                    created_at: -1,
                                },
                            },
                            {
                                $group: {
                                    _id: "$webpage_id",
                                    webpage: {
                                        $first: "$$ROOT",
                                    },
                                },
                            },
                        ],
                        as: "webpage"
                    }
                },
                {
                    '$unwind': {
                        'path': '$table',
                        'preserveNullAndEmptyArrays': true
                    }
                },
                {
                    '$unwind': {
                        'path': '$microfrontend',
                        'preserveNullAndEmptyArrays': true
                    }
                },
                {
                    '$unwind': {
                        'path': '$webpage',
                        'preserveNullAndEmptyArrays': true
                    }
                },
                {
                    '$lookup': {
                        'from': 'menu_permissions',
                        'let': {
                            'menuId': '$id',
                            'roleId': data.role_id
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$expr': {
                                        '$and': [
                                            {
                                                '$eq': [
                                                    '$role_id', '$$roleId'
                                                ]
                                            },
                                            {
                                                '$eq': [
                                                    '$menu_id', '$$menuId'
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        'as': 'permission'
                    },
                },
                {
                    '$unwind': {
                        'path': '$permission',
                        'preserveNullAndEmptyArrays': true
                    }
                },
                {
                    '$project': {
                        'permission._id': 0,
                        'permission.__v': 0,
                        'permission.createdAt': 0,
                        'permission.updatedAt': 0,
                    }
                },
                {
                    '$addFields': {
                        'data': {
                            'table': '$table',
                            'microfrontend': '$microfrontend',
                            'webpage': '$webpage.webpage',
                            'permission': '$permission'
                        }
                    }
                },
                {
                    '$skip': data.offset
                },
                {
                    '$limit': data.limit
                },
                {
                    $sort:
                    {
                        order: 1,
                    },
                }]

            let menus = await Menu.aggregate(pipelines)
            menus = JSON.parse(JSON.stringify(menus))
            menus.forEach(el => {
                el.data = struct.encode(el.data)
            })
            const count = await Menu.countDocuments(query);
            return { menus, count };
        } catch (err) {
            throw err
        }

    }),
    getByID: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)

            const Menu = mongoConn.models['object_builder_service.menu']

            const menu = await Menu.findOne({ id: data.id });

            return menu;
        } catch (err) {
            throw err
        }


    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            if (data.id === "c57eedc3-a954-4262-a0af-376c65b5a284" || data.id === "c57eedc3-a954-4262-a0af-376c65b5a282") {
                throw new Error("Cannot delete default menu")
            }
            const Menu = mongoConn.models['object_builder_service.menu']

            const menu = await Menu.deleteOne({ id: data.id });
            const menuPermissionTable = mongoConn.models['menu_permission']
            await menuPermissionTable.deleteMany({ menu_id: data.id })
            return menu;
        } catch (err) {
            throw err
        }
    }),
    updateMenuOrder: catchWrapDb(`${NAMESPACE}.updateMenuOrder`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)

            const Menu = mongoConn.models['object_builder_service.menu']

            let bulkWriteMenus = []
            let i = 1
            for (const menu of data.menus) {
                bulkWriteMenus.push({
                    updateOne: {
                        filter: { id: menu.id },
                        update: { order: i }
                    }
                })
                i += 1
            }
            await Menu.bulkWrite(bulkWriteMenus)
            return;
        } catch (err) {
            throw err
        }
    }),

    createMenuSettings: catchWrapDb(`${NAMESPACE}.createMenuSettings`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']

            let resp = await MenuSettings.create(data)

            return resp;
        } catch (err) {
            throw err
        }

    }),
    getAllMenuSettings: catchWrapDb(`${NAMESPACE}.getAllMenuSettings`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']

            let resp = await MenuSettings.find({}).skip(data.offset || 0).limit(data.limit || 1000);
            let count = await MenuSettings.count()

            return {menu_settings: resp, count: count};
        } catch (err) {
            throw err
        }

    }),
    getByIDMenuSettings: catchWrapDb(`${NAMESPACE}.getByIDMenuSettings`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuSettings.findOne({id: data.id}).lean()
            if(!resp) {
                throw Error("Menu Templete not found with given id!")
            }
            if(data.template_id) {
                const template = await MenuTemplate.findOne({id: data.template_id}).lean()
                if(template){
                    resp.menu_template = template
                }
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    updateMenuSettings: catchWrapDb(`${NAMESPACE}.updateMenuSettings`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']

            let resp = await MenuSettings.findOneAndUpdate({id: data.id}, {$set: data}, {new: true})
            if(!resp) {
                throw Error("Menu Templete not found with given id!")
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    deleteMenuSettings: catchWrapDb(`${NAMESPACE}.deleteMenuSettings`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']

            let resp = await MenuSettings.findOneAndDelete({id: data.id})
            if(!resp) {
                throw Error("Menu Templete not found with given id!")
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),

    createMenuTemplate: catchWrapDb(`${NAMESPACE}.createMenuTemplate`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.create(data)

            return resp;
        } catch (err) {
            throw err
        }

    }),
    getAllMenuTemplate: catchWrapDb(`${NAMESPACE}.getAllMenuTemplate`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.find({}).skip(data.offset || 0).limit(data.limit || 1000);
            const count = await MenuTemplate.count({})

            return {menu_templates: resp, count};
        } catch (err) {
            throw err
        }

    }),
    getByIDMenuTemplate: catchWrapDb(`${NAMESPACE}.getByIDMenuTemplate`, async (data) => {
        try {
            console.log(":::::::::::::::DATA getByIDMenuTemplate::::::::::::::::::::::::", data)
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.findOne({id: data.id})
            // if(!resp) {
            //     throw Error("Menu Templete not found with given id!")
            // }
            return resp;
        } catch (err) {
            throw err
        }

    }),
    updateMenuTemplate: catchWrapDb(`${NAMESPACE}.updateMenuTemplate`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.findOneAndUpdate({id: data.id}, {$set: data}, {new: true})
            if(!resp) {
                throw Error("Menu Templete not found with given id!")
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    deleteMenuTemplate: catchWrapDb(`${NAMESPACE}.deleteMenuTemplate`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.findOneAndDelete({id: data.id})
            if(!resp) {
                throw Error("Menu Templete not found with given id!")
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),

};

module.exports = menuStore;
