const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")

module.exports = async function (data) {
    console.log(": Default menu checking...")
    const mongoConn = await mongoPool.get(data.project_id)
    console.log("models:", mongoConn.models);
    const Menu = mongoConn.models['object_builder_service.menu']
    console.log("test menu::", Menu);
    let rootMenu = await Menu.findOne({
        id: "c57eedc3-a954-4262-a0af-376c65b5a284",
    })

    if (!rootMenu) {
        await Menu.create({
            id: "c57eedc3-a954-4262-a0af-376c65b5a284",
            title: "Default folder",
            parent_id: "",
            label: "ROOT",
            icon: "user-shield.svg",
            table_id: "",
            layout_id: "",
            type: "FOLDER",
            created_at: new Date(),
            updated_at: new Date(),
        })
    }
    let favourite = await Menu.findOne({
        id: "c57eedc3-a954-4262-a0af-376c65b5a282",
    })
    if (!favourite) {
        await Menu.create({
            "label": "Избранное",
            "icon": "user-shield.svg",
            "id": "c57eedc3-a954-4262-a0af-376c65b5a282",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
            "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a284",
            "table_id": "",
            "layout_id": "",
            "type": "FOLDER"
        })
    }

    console.log("done creating default menu")
}