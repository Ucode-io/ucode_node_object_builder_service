const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const mongoPool = require('../../pkg/pool')
const tableVersion = require('../../helper/table_version');
const constants = require("../../helper/constants");
let NAMESPACE = "storage.menu";


let menuStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {

            if (!constants.MENU_TYPES.includes(data.type)) {
                throw new Error("Unsupported menu type");
            }
            const mongoConn = await mongoPool.get(data.project_id)

            const Menu = mongoConn.models['object_builder_service.menu']

            const menu = new Menu(data);

            const response = await menu.save();

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
                label: RegExp(data.search, "i"),
                parent_id: data.parent_id
            }
            const pipelines = [
                {
                    '$match': query
                }
            ]
            if (!data.parent_id) {
                pipelines.push({
                    '$lookup': {
                        'from': 'object_builder_service.menus',
                        'localField': 'id',
                        'foreignField': 'parent_id',
                        'as': 'child_menus'
                    }
                },
                    {
                        '$skip': 0
                    },
                    {
                        '$limit': 1
                    }
                )
            } else {
                pipelines.push({
                    '$skip': data.offset
                }, {
                    '$limit': data.limit
                })
            }
            const menus = await Menu.aggregate(pipelines)

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

            return menu;
        } catch (err) {
            throw err
        }
    }),
};

module.exports = menuStore;
