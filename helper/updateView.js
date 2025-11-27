const mongoPool = require('../pkg/pool');

async function updateView(data) {
    try {
        if (!data || !data.project_id) {
            throw new Error("Invalid data or project_id.");
        }

        const mongoConn = await mongoPool.get(data.project_id);

        if (!mongoConn || !mongoConn.models) {
            throw new Error(`Mongo connection or models are unavailable for project_id: ${data.project_id}`);
        }

        const View = mongoConn.models["View"];
        const Table = mongoConn.models["Table"];
        const Menu = mongoConn.models['object_builder_service.menu']

        const tables = await Table.find({}, {id: 1, slug: 1});

        for (const table of tables) {
            const menu = await Menu.findOne(
                { table_id: table.id },
                { id: 1 }
            );

            if (menu) {
                await View.updateMany(
                    { table_slug: table.slug },
                    { $set: { menu_id: menu.id } }
                );
            }
        }

        await View.updateMany(
            {
                $or: [
                    { relation_id: null },
                    { relation_id: "" },
                    { relation_id: { $exists: false } }
                ]
            },
            { $set: { is_relation_view: false } }
        );

        await View.updateMany(
            { 
                relation_id: { $ne: null, $ne: "", $exists: true }
            },
            { $set: { is_relation_view: true } }
        );

    } catch (error) {
        console.error(`Error when update view: ${error}`)
    }
}

module.exports = updateView