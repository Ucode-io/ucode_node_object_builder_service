async function createMenu() {
    let menu = [{
        "label": "ROOT",
        "icon": "user-shield.svg",
        "id": "c57eedc3-a954-4262-a0af-376c65b5a284",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "parent_id": "",
        "table_id": "",
        "layout_id": "",
        "type": "FOLDER"
    }, {
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
    }, {
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
    },{
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
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }]

    return menu
}

module.exports = createMenu;