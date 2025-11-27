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
        "label": "Content",
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
        "label": "Settings",
        "icon": "folder.svg",
        "id": "c57eedc3-a954-4262-a0af-376c65b5a280",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a284",
        "table_id": "",
        "layout_id": "",
        "type": "FOLDER"
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
        "label": "Wiki",
        "id": "744d63e6-0ab7-4f16-a588-d9129cf959d1",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "parent_id": "c57eedc3-a954-4262-a0af-376c65b5a284",
        "table_id": "",
        "layout_id": "",
        "icon": "folder.svg",
        "type": "FOLDER"
    },
    {
        "label": "Wiki docs",
        "parent_id": "744d63e6-0ab7-4f16-a588-d9129cf959d1",
        "layout_id": "",
        "table_id": "",
        "type": "WIKI_FOLDER",
        "icon": "folder.svg",
        "is_visible": true,
        "id": "cd5f1ab0-432c-459d-824a-e64c139038ea",
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
    },
    ]

    return menu
}

module.exports = createMenu;