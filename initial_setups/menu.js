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
        "type": "FOLDER",
        "is_system": true,
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
        "type": "FOLDER",
        "is_system": true,
    }]

    return menu
}

module.exports = createMenu;