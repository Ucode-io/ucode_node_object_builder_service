const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")
const bucket = require("./addMinioBucket")

module.exports = async function (data) {
    try {
        console.log(": Default menu checking...")
        const mongoConn = await mongoPool.get(data.project_id)
        const Menu = mongoConn.models['object_builder_service.menu']
        const MenuSettings = mongoConn.models['object_builder_service.menu.settings']
        const Field = mongoConn.models['Field']
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
        let adminMenu = await Menu.findOne({
            id: "c57eedc3-a954-4262-a0af-376c65b5a280",
        })
        if (!adminMenu) {
            await Menu.create({
                "label": "Admin",
                "icon": "folder.svg",
                "id": "c57eedc3-a954-4262-a0af-376c65b5a280",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0,
                "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a284",
                "table_id": "",
                "layout_id": "",
                "type": "FOLDER"
            })
        }
        let analyticsMenu = await Menu.findOne({
            id: "c57eedc3-a954-4262-a0af-376c65b5a278"
        })
        if (!analyticsMenu) {
            await Menu.create({
                "label": "Analytics",
                "icon": "folder.svg",
                "id": "c57eedc3-a954-4262-a0af-376c65b5a278",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0,
                "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a284",
                "table_id": "",
                "layout_id": "",
                "type": "FOLDER"
            })
        }
        let pivotMenu = await Menu.findOne({
            id: "c57eedc3-a954-4262-a0af-376c65b5a276"
        })
        if (!pivotMenu) {
            await Menu.create({
                "label": "Pivot",
                "icon": "folder.svg",
                "id": "c57eedc3-a954-4262-a0af-376c65b5a276",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0,
                "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a278",
                "table_id": "",
                "layout_id": "",
                "type": "FOLDER"
            })
        }
        let reportSettingsMenu = await Menu.findOne({
            id: "c57eedc3-a954-4262-a0af-376c65b5a274"
        })
        if (!reportSettingsMenu) {
            await Menu.create({
                "label": "Report Settings",
                "icon": "folder.svg",
                "id": "c57eedc3-a954-4262-a0af-376c65b5a274",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0,
                "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a278",
                "table_id": "",
                "layout_id": "",
                "type": "FOLDER"
            })
        }
        let savedPivotMenu = await Menu.findOne({
            id: "7c26b15e-2360-4f17-8539-449c8829003f"
        })
        if (!savedPivotMenu) {
            await Menu.create({
                "label": "Saved",
                "icon": "folder.svg",
                "id": "7c26b15e-2360-4f17-8539-449c8829003f",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0,
                "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a276",
                "table_id": "",
                "layout_id": "",
                "type": "FOLDER"
            })
        }
        let historyPivotMenu = await Menu.findOne({
            id: "e96b654a-1692-43ed-89a8-de4d2357d891"
        })
        if (!historyPivotMenu) {
            await Menu.create({
                "label": "History",
                "icon": "folder.svg",
                "id": "e96b654a-1692-43ed-89a8-de4d2357d891",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0,
                "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a276",
                "table_id": "",
                "layout_id": "",
                "type": "FOLDER"
            })
        }
        let files = await Menu.find({
            parent_id: "8a6f913a-e3d4-4b73-9fc0-c942f343d0b9"
        })
        if (files) {
            await bucket.createMinioBucket(data.project_id)
        }
        if (!files) {
            await bucket.createMinioBucket(data.project_id)
            await Menu.create({
                "label": "Files",
                "icon": "file-pdf.svg",
                "id": "8a6f913a-e3d4-4b73-9fc0-c942f343d0b9",
                "created_at": new Date(),
                "updated_at": new Date(),
                "__v": 0,
                "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a284",
                "table_id": "",
                "layout_id": "",
                "type": "FOLDER",
                "bucket_path": data.project_id
            })

            
        }
        let default_menu = await Menu.find({
           parent_id: "8a6f913a-e3d4-4b73-9fc0-c942f343d0b9"
        })
        if (!default_menu.length) {
            await Menu.create({
                "id":"f4089a64-4f6f-4604-a57a-b1c99f4d16a8",
                "icon":"",
                "attributes":{
                   "label_aa":"Media",
                   "label_ak":"Media",
                   "path": "Media"
                },
                "parent_id":"8a6f913a-e3d4-4b73-9fc0-c942f343d0b9",
                "type":"MINIO_FOLDER",
                "label":"Media"
             })

            const file_types = ["PHOTO", "FILE", "VIDEO", "CUSTOM_IMAGE"]

            await Field.updateMany({type: {$in: file_types}}, 
                {
                $set: 
                {
                    minio_folder: "Media"
                }
            })
        }


        let staticMenus = [{
            "label": "User and Permission",
            "icon": "users.svg",
            "id": "a8de4296-c8c3-48d6-bef0-ee17057733d6",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
            "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a280",
            "table_id": "",
            "layout_id": "",
            "type": "FOLDER"
        }, {
            "label": "Database",
            "icon": "database.svg",
            "id": "d1b3b349-4200-4ba9-8d06-70299795d5e6",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
            "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a280",
            "table_id": "",
            "layout_id": "",
            "type": "FOLDER"
        }, {
            "label": "Code",
            "icon": "code.svg",
            "id": "f7d1fa7d-b857-4a24-a18c-402345f65df8",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
            "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a280",
            "table_id": "",
            "layout_id": "",
            "type": "FOLDER"
        }, {
            "label": "Resource",
            "icon": "code.svg",
            "id": "f313614f-f018-4ddc-a0ce-10a1f5716401",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
            "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a280",
            "table_id": "",
            "layout_id": "",
            "type": "FOLDER"
        }, {
            "label": "API",
            "icon": "code.svg",
            "id": "db4ffda3-7696-4f56-9f1f-be128d82ae68",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
            "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a280",
            "table_id": "",
            "layout_id": "",
            "type": "FOLDER"
        }, {
            "label": "Profil settings",
            "icon": "user.svg",
            "id": "3b74ee68-26e3-48c8-bc95-257ca7d6aa5c",
            "created_at": new Date(),
            "updated_at": new Date(),
            "__v": 0,
            "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a284",
            "table_id": "",
            "layout_id": "",
            "type": "LINK",
            "attributes": {
                "fields": {
                    "link": {
                        "stringValue": "/main/fadc103a-b411-4a1a-b47c-e794c33f85f6/object/{login_table_slug}/{user_id}",
                        "kind": "stringValue"
                    },
                }
            },
        }]
        let bulkWriteMenus = []
        for (const menu of staticMenus) {
            bulkWriteMenus.push({
                updateOne: {
                    filter: { id: menu.id },
                    update: menu,
                    upsert: true
                },
            })
        }
        await Menu.bulkWrite(bulkWriteMenus)

        console.log("done creating default menu")

    } catch (error) {
        console.log("error creating default menu:", error)
    }
}