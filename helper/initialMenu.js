const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")

module.exports = async function (data) {
    try {
        console.log(": Default menu checking...")
        const mongoConn = await mongoPool.get(data.project_id)
        const Menu = mongoConn.models['object_builder_service.menu']
        const MenuSettings = mongoConn.models['object_builder_service.menu.settings']
        let rootMenu = await Menu.findOne({
            id: "c57eedc3-a954-4262-a0af-376c65b5a284",
        })

        if (!rootMenu) {
            rootMenu = await Menu.create({
                id: "c57eedc3-a954-4262-a0af-376c65b5a284",
                title: "Default folder",
                parent_id: "",
                label: "ROOT",
                icon: "user-shield.svg",
                table_id: "",
                layout_id: "",
                type: "FOLDER",
                menu_settings_id: "adea69cd-9968-4ad0-8e43-327f6600abfd",
                created_at: new Date(),
                updated_at: new Date(),
            })
        }

        if (!rootMenu.menu_settings_id) {
            let menu_settings = await MenuSettings.findOne({ id: "adea69cd-9968-4ad0-8e43-327f6600abfd" })
            if (!menu_settings) {
                menu_settings = await MenuSettings.create({
                    id: "adea69cd-9968-4ad0-8e43-327f6600abfd",
                    icon_style: "SIMPLE",
                    icon_size: "MEDIUM",
                })
            }

            await Menu.findOneAndUpdate({ id: "c57eedc3-a954-4262-a0af-376c65b5a284" }, { $set: { menu_settings_id: menu_settings.id } }, { new: true })
        }

        let favourite = await Menu.findOne({
            id: "c57eedc3-a954-4262-a0af-376c65b5a282",
        })
        if (!favourite) {
            await Menu.create({
                "label": "Избранное",
                "icon": "folder.svg",
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

    } catch (error) {
        console.log("error creating default menu:", error)
    }
}