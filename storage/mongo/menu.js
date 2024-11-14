const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const mongoPool = require('../../pkg/pool')
const tableVersion = require('../../helper/table_version');
const constants = require("../../helper/constants");
const { struct } = require("pb-util/build");
const folderMinio = require("../../helper/addMinioBucket");
const logger = require("../../config/logger");
let NAMESPACE = "storage.menu";
const fuzz = require('fuzzball');

let menuStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            if (!constants.MENU_TYPES.includes(data.type)) {
                throw new Error("Unsupported menu type");
            }
            const mongoConn = await mongoPool.get(data.project_id)

            const Menu = mongoConn.models['object_builder_service.menu']
            const menuPermissionTable = mongoConn.models['menu_permission']

            if(!data.id) {
                data.id = v4()
            }

            if (data.type === "TABLE") {
                let table = await tableVersion(mongoConn, { id: data.table_id, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, data.version_id, true)
                if (!data.icon) data.icon = table?.icon
                if (!data.label) data.label = table?.label
            }

            if (data.type == "MINIO_FOLDER") {
                let folder_name = ""
                let menu
                if (data.parent_id != "" && data.parent_id != "8a6f913a-e3d4-4b73-9fc0-c942f343d0b9") {
                    menu = await Menu.findOne({id: data.parent_id})
                    if (menu && menu.attributes) {
                        let attributes = struct.decode(menu.attributes)
                        if (attributes && attributes.path) {
                            data.attributes.fields["path"] = {
                                stringValue: attributes.path + "/"+ data.label,
                                kind: "stringValue"
                            }
                            folder_name = attributes.path + "/"+ data.label
                        }
                    }
                } else {
                    data.attributes.fields["path"] = {
                        stringValue: data.label,
                        kind: "stringValue"
                    }
                    folder_name = data.label
                }


                await folderMinio.createFolderToBucket(data.project_id, folder_name)
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
                try {
                    await menuPermissionTable.insertMany(permissions)
                } catch (err) {
                    logger.error(err)
                }
            }

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("create menu-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by create menu: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by create menu: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return response;
        } catch (err) {
            throw err
        }

    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            if (!constants.MENU_TYPES.includes(data.type)) {
                throw new Error("Unsupported menu type");
            }
            const mongoConn = await mongoPool.get(data.project_id)
            const Menu = mongoConn.models['object_builder_service.menu']
            const History = mongoConn.models['object_builder_service.version_history']

            if (data.type === "TABLE") {
                let table = await tableVersion(mongoConn, { id: data.table_id, deleted_at: new Date("1970-01-01T18:00:00.000+00:00") }, data.version_id, true)
                if (!data.icon) data.icon = table?.icon
                if (!data.label) data.label = table?.label
            }

            const beforeUpdate = await Menu.findOne({id: data.id})
            if(!beforeUpdate) {
                throw new Error("Menu not found with given id")
            }

            const menu = await Menu.findOneAndUpdate(
                {
                    id: data.id,
                },
                {
                    $set: data
                },
                {
                    new: true
                }
            )

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("update menu-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by update menu: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by update menu: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }
            
            return menu;
        } catch (err) {
            throw err
        }

    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {

            const mongoConn = await mongoPool.get(data.project_id) // project_id: is resource_id

            const Menu = mongoConn.models['object_builder_service.menu']
            let query = {
                parent_id: data.parent_id,
                label: RegExp(data.search, "i")
            }
            if (data.for_template) {
                query.id = {
                    $nin: constants.STATIC_MENU_IDS
                }
            }
            if(data.table_id) {
                query = {
                    table_id: data.table_id
                }
                // const menus = await Menu.find(query)
                // const menu_ids = menus.map(el => el.parent_id)
                // query = {
                //     id: {
                //         $in: menu_ids
                //     }
                // }
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
                        'from': 'pivottemplates',
                        'localField': 'pivot_template_id',
                        'foreignField': 'id',
                        'as': 'pivot'
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
                        'path': '$pivot',
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
                            'permission': '$permission',
                            'pivot': '$pivot',
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

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getAll menu-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by getAll menu: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getAll menu: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return { menus, count };
        } catch (err) {
            throw err
        }
    }),
    getByID: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Menu = mongoConn.models['object_builder_service.menu']

            const query = {id: data.id}

            const pipeline = [
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
                        'from': 'pivottemplates',
                        'localField': 'pivot_template_id',
                        'foreignField': 'id',
                        'as': 'pivot'
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
                        'path': '$pivot',
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
                                                '$eq': ['$role_id', '$$roleId']
                                            },
                                            {
                                                '$eq': ['$menu_id', '$$menuId']
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
                            'permission': '$permission',
                            'pivot': '$pivot',
                        }
                    }
                }
            ];

            let menu = await Menu.aggregate(pipeline)
            menu = JSON.parse(JSON.stringify(menu))

            if (menu.length !== 0) {
                menu[0].data = struct.encode(menu[0].data);
                return menu[0];
            } 

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getById menu-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by getById menu: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getById menu: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return null
        } catch (err) {
            throw err
        }
    }),
    getByLabel: catchWrapDb(`${NAMESPACE}.getByLabel`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        const mongoConn = await mongoPool.get(data.project_id);
        const Menu = mongoConn.models['object_builder_service.menu'];
    
        // Fetch all menus (or a larger subset if the dataset is too big)
        let allMenus = await Menu.find({});
    
        // Use fuzzy matching to find similar labels
        let matches = allMenus.map(menu => {
            return {
                menu: menu,
                score: fuzz.ratio(data.label, menu.label)
            };
        });
    
        // Filter and sort matches based on score
        matches = matches.filter(match => match.score > 70).sort((a, b) => b.score - a.score);
    
        // Extract the matched menus
        let menus = matches.map(match => match.menu);

        const endMemoryUsage = process.memoryUsage();

        const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
        if (memoryUsed > 300) {
            logger.info("getByLabel menu-->Project->" + data.project_id)
            logger.info("Request->" + JSON.stringify(data))

            logger.info(`--> P-M Memory used by getByLabel menu: ${memoryUsed.toFixed(2)} MB`);
            logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
            logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
            
            logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
            logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
        } else {
            logger.info(`--> P-M Memory used by getByLabel menu: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
        }
    
        return {menus};
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        const startMemoryUsage = process.memoryUsage();

        try {
            const mongoConn = await mongoPool.get(data.project_id)
            if (constants.STATIC_MENU_IDS.includes(data.id)) {
                throw new Error("Cannot delete default menu")
            }
            const Menu = mongoConn.models['object_builder_service.menu']
            const History = mongoConn.models['object_builder_service.version_history']

            let res = await Menu.findOne({ id: data.id });
            if (res && res.type == "MINIO_FOLDER") {
                let attributes = struct.decode(res.attributes)
                await folderMinio.deleteMinioFolder(data.project_id, attributes.path)
            }
            const menu = await Menu.findOneAndDelete({ id: data.id }, { new: true });
            const menuPermissionTable = mongoConn.models['menu_permission']
            await menuPermissionTable.deleteMany({ menu_id: data.id })

                         const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("delete menu-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by delete menu: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by delete menu: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return menu;
        } catch (err) {
            throw err
        }
    }),
    updateMenuOrder: catchWrapDb(`${NAMESPACE}.updateMenuOrder`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
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

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("update menu order-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by update menu order: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by update menu order: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return;
        } catch (err) {
            throw err
        }
    }),
    createMenuSettings: catchWrapDb(`${NAMESPACE}.createMenuSettings`, async (data) => {
        const startMemoryUsage = process.memoryUsage();

        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']

            let resp = await MenuSettings.create(data)


            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("createMenuSettings-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by createMenuSettings: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by createMenuSettings: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    getAllMenuSettings: catchWrapDb(`${NAMESPACE}.getAllMenuSettings`, async (data) => {
        const startMemoryUsage = process.memoryUsage();

        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']

            let resp = await MenuSettings.find({}).skip(data.offset || 0).limit(data.limit || 1000);
            let count = await MenuSettings.count()


            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getAllMenuSettings-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by getAllMenuSettings: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getAllMenuSettings: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return { menu_settings: resp, count: count };
        } catch (err) {
            throw err
        }

    }),
    getByIDMenuSettings: catchWrapDb(`${NAMESPACE}.getByIDMenuSettings`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuSettings.findOne({ id: data.id }).lean()
            if (!resp) {
                throw Error("Menu Templete not found with given id!")
            }
            if (data.template_id) {
                const template = await MenuTemplate.findOne({ id: data.template_id }).lean()
                if (template) {
                    resp.menu_template = template
                }
            }

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getByIDMenuSettings-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by getByIDMenuSettings: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getByIDMenuSettings: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    updateMenuSettings: catchWrapDb(`${NAMESPACE}.updateMenuSettings`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']

            let resp = await MenuSettings.findOneAndUpdate({ id: data.id }, { $set: data }, { new: true })
            if (!resp) {
                throw Error("Menu Templete not found with given id!")
            }

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("updateMenuSettings-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by updateMenuSettings: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by updateMenuSettings: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    deleteMenuSettings: catchWrapDb(`${NAMESPACE}.deleteMenuSettings`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuSettings = mongoConn.models['object_builder_service.menu.settings']

            let resp = await MenuSettings.findOneAndDelete({ id: data.id })
            if (!resp) {
                throw Error("Menu Templete not found with given id!")
            }

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("deleteMenuSettings-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by deleteMenuSettings: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by deleteMenuSettings: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    createMenuTemplate: catchWrapDb(`${NAMESPACE}.createMenuTemplate`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.create(data)

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("createMenuTemplate-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by createMenuTemplate: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by createMenuTemplate: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    getAllMenuTemplate: catchWrapDb(`${NAMESPACE}.getAllMenuTemplate`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.find({}).skip(data.offset || 0).limit(data.limit || 1000);
            const count = await MenuTemplate.count({})

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getAllMenuTemplate-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by getAllMenuTemplate: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getAllMenuTemplate: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return { menu_templates: resp, count };
        } catch (err) {
            throw err
        }

    }),
    getByIDMenuTemplate: catchWrapDb(`${NAMESPACE}.getByIDMenuTemplate`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.findOne({ id: data.id })
            // if(!resp) {
            //     throw Error("Menu Templete not found with given id!")
            // }

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getByIDMenuTemplate-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by getByIDMenuTemplate: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getByIDMenuTemplate: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    updateMenuTemplate: catchWrapDb(`${NAMESPACE}.updateMenuTemplate`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.findOneAndUpdate({ id: data.id }, { $set: data }, { new: true })
            if (!resp) {
                throw Error("Menu Templete not found with given id!")
            }

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("updateMenuTemplate-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by updateMenuTemplate: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by updateMenuTemplate: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    deleteMenuTemplate: catchWrapDb(`${NAMESPACE}.deleteMenuTemplate`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuTemplate = mongoConn.models['object_builder_service.menu.templates']

            let resp = await MenuTemplate.findOneAndDelete({ id: data.id })
            if (!resp) {
                throw Error("Menu Templete not found with given id!")
            }

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("deleteMenuTemplate-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by deleteMenuTemplate: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by deleteMenuTemplate: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return resp;
        } catch (err) {
            throw err
        }

    }),
    CopyMenus: catchWrapDb(`${NAMESPACE}.CopyMenus`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const MenuModel = mongoConn.models['object_builder_service.menu']
            const MenuPermissionModel = mongoConn.models["menu_permission"]
            const RoleModel = mongoConn.models["role"]

            const roles = await RoleModel?.find().lean()

            let menu_permissions = [];
            for (const menu of data.menus) {
                for (const role of roles) {
                    menu_permissions.push({
                        guid: v4(),
                        menu_id: menu?.id,
                        role_id: role.guid,
                        delete: true,
                        write: true,
                        update: true,
                        read: true,
                    })
                }
            }

            await MenuModel.deleteMany({ id: { $in: data.menu_ids } })
            await MenuPermissionModel.deleteMany({ menu_id: { $in: data.menu_ids } })

            await MenuModel.insertMany(data.menus)
            await MenuPermissionModel.insertMany(menu_permissions)

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("CopyMenus-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by CopyMenus: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by CopyMenus: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return data.tables;
        } catch (err) {
            throw err
        }
    }),
    getWikiFolder: catchWrapDb(`${NAMESPACE}.getWikiFolder`, async (data) => {
        const startMemoryUsage = process.memoryUsage();
        try {

            const mongoConn = await mongoPool.get(data.project_id) // project_id: is resource_id

            const Menu = mongoConn.models['object_builder_service.menu']

            let query = {}

            if (!data.parent_id) {
                throw new Error("Parent id is reuired");
            }
            
            query.parent_id = data.parent_id
            query.type = { $in : ["WIKI", "WIKI_FOLDER"] }
            query.is_visible = true
        
            if (data.parent_id == "c57eedc3-a954-4262-a0af-376c65b5a284") {
                query.parent_id = "c57eedc3-a954-4262-a0af-376c65b5a284"
                query.id = "744d63e6-0ab7-4f16-a588-d9129cf959d1" 
            }

            if (data.parent_id == "744d63e6-0ab7-4f16-a588-d9129cf959d1") {
                query.parent_id = "744d63e6-0ab7-4f16-a588-d9129cf959d1"
                query.type = { $in : ["WIKI", "WIKI_FOLDER"] }
            }

            // if (data.for_template) {
            //     query.id = {
            //         $nin: constants.STATIC_MENU_IDS
            //     }
            // }
            // const pipelines = [
            //     {
            //         '$match': query
            //     },
            //     {
            //         '$lookup': {
            //             'from': 'tables',
            //             'localField': 'table_id',
            //             'foreignField': 'id',
            //             'as': 'table'
            //         }
            //     },
            //     {
            //         '$lookup': {
            //             'from': 'function_service.functions',
            //             'localField': 'microfrontend_id',
            //             'foreignField': 'id',
            //             'as': 'microfrontend'
            //         }
            //     },
            //     {
            //         '$lookup': {
            //             'from': 'pivottemplates',
            //             'localField': 'pivot_template_id',
            //             'foreignField': 'id',
            //             'as': 'pivot'
            //         }
            //     },
            //     {
            //         '$lookup': {
            //             from: "web_pages.web_page",
            //             let: {
            //                 webpage_id: "$webpage_id",
            //             },
            //             pipeline: [
            //                 {
            //                     $match: {
            //                         $expr: {
            //                             $and: [
            //                                 {
            //                                     $eq: ["$id", "$$webpage_id"],
            //                                 },
            //                             ],
            //                         },
            //                     },
            //                 },
            //                 {
            //                     $sort: {
            //                         created_at: -1,
            //                     },
            //                 },
            //                 {
            //                     $group: {
            //                         _id: "$webpage_id",
            //                         webpage: {
            //                             $first: "$$ROOT",
            //                         },
            //                     },
            //                 },
            //             ],
            //             as: "webpage"
            //         }
            //     },
            //     {
            //         '$unwind': {
            //             'path': '$table',
            //             'preserveNullAndEmptyArrays': true
            //         }
            //     },
            //     {
            //         '$unwind': {
            //             'path': '$microfrontend',
            //             'preserveNullAndEmptyArrays': true
            //         }
            //     },
            //     {
            //         '$unwind': {
            //             'path': '$pivot',
            //             'preserveNullAndEmptyArrays': true
            //         }
            //     },
            //     {
            //         '$unwind': {
            //             'path': '$webpage',
            //             'preserveNullAndEmptyArrays': true
            //         }
            //     },
            //     {
            //         '$lookup': {
            //             'from': 'menu_permissions',
            //             'let': {
            //                 'menuId': '$id',
            //                 'roleId': data.role_id
            //             },
            //             'pipeline': [
            //                 {
            //                     '$match': {
            //                         '$expr': {
            //                             '$and': [
            //                                 {
            //                                     '$eq': [
            //                                         '$role_id', '$$roleId'
            //                                     ]
            //                                 },
            //                                 {
            //                                     '$eq': [
            //                                         '$menu_id', '$$menuId'
            //                                     ]
            //                                 }
            //                             ]
            //                         }
            //                     }
            //                 }
            //             ],
            //             'as': 'permission'
            //         },
            //     },
            //     {
            //         '$unwind': {
            //             'path': '$permission',
            //             'preserveNullAndEmptyArrays': true
            //         }
            //     },
            //     {
            //         '$project': {
            //             'permission._id': 0,
            //             'permission.__v': 0,
            //             'permission.createdAt': 0,
            //             'permission.updatedAt': 0,
            //         }
            //     },
            //     {
            //         '$addFields': {
            //             'data': {
            //                 'table': '$table',
            //                 'microfrontend': '$microfrontend',
            //                 'webpage': '$webpage.webpage',
            //                 'permission': '$permission',
            //                 'pivot': '$pivot',
            //             }
            //         }
            //     },
            //     {
            //         '$skip': data.offset
            //     },
            //     {
            //         '$limit': data.limit
            //     },
            //     {
            //         $sort:
            //         {
            //             order: 1,
            //         },
            //     }]

            let menus = await Menu.find(query)
            // menus = JSON.parse(JSON.stringify(menus))
            // menus.forEach(el => {
            //     el.data = struct.encode(el.data)
            // })
            const count = await Menu.countDocuments(query);

            const endMemoryUsage = process.memoryUsage();

            const memoryUsed = (endMemoryUsage.heapUsed - startMemoryUsage.heapUsed) / (1024 * 1024);
            if (memoryUsed > 300) {
                logger.info("getWikiFolder-->Project->" + data.project_id)
                logger.info("Request->" + JSON.stringify(data))

                logger.info(`--> P-M Memory used by getWikiFolder: ${memoryUsed.toFixed(2)} MB`);
                logger.info(`--> P-M Heap size limit: ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used start heap size: ${(startMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Used end heap size: ${(endMemoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total heap size:  ${(endMemoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`);
                logger.info(`--> P-M Total physical size: ${(endMemoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`);
                
                logger.debug('Start Memory Usage: ' + JSON.stringify(startMemoryUsage));
                logger.debug('End Memory Usage:' + JSON.stringify(endMemoryUsage));
            } else {
                logger.info(`--> P-M Memory used by getWikiFolder: ${memoryUsed.toFixed(2)} MB Project-> ${data.project_id}`);
            }

            return { menus, count };
        } catch (err) {
            throw err
        }

    }),
};

module.exports = menuStore;
