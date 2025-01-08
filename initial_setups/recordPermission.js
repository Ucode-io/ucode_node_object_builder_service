async function createRecordPermision(roleID) {
    let recordPermission = [
    {
            "update": "Yes",
            "table_slug": "setting.languages",
            "write": "Yes",
            "guid": "3d78d446-4e3a-4e9a-a100-cd4ad099e3d1",
            "read": "Yes",
            "delete": "Yes",
            "role_id": roleID || "",
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "__v": 0
    }, {
            "update": "Yes",
            "table_slug": "setting.timezones",
            "write": "Yes",
            "guid": "e5806ca9-f7b5-44e8-a88a-876bfb7ec8f9",
            "read": "Yes",
            "delete": "Yes",
            "role_id": roleID || "",
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "app",
        "write": "Yes",
        "guid": "b0c3bc25-8439-4e5a-84db-cd36a456aaef",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0,
        "is_have_condition": false
    }, {
        "update": "Yes",
        "table_slug": "record_permission",
        "write": "Yes",
        "guid": "75e835f6-06ab-46d1-88ca-76ed10bf2f06",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "connections",
        "write": "Yes",
        "guid": "55243b6e-63fb-4e28-ba07-8625b3e43738",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "role",
        "write": "Yes",
        "guid": "380e14ab-71bc-4558-a3b4-537dbd4d57f4",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "client_type",
        "write": "Yes",
        "guid": "42fb56bf-bfbc-4f8f-96fb-1c2567d91b79",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "client_platform",
        "write": "Yes",
        "guid": "3b850c28-deff-4e2d-8a3c-f6e47e5c4d26",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "project",
        "write": "Yes",
        "guid": "1c04479e-f549-48f8-b5cb-5fa7e929e296",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "test_login",
        "write": "Yes",
        "guid": "2953079b-0bcd-4b32-8322-751720d4db78",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "user",
        "write": "Yes",
        "guid": "9389ed9e-6cf4-442d-9268-d46820b721b2",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "automatic_filter",
        "write": "Yes",
        "guid": "e40b13da-f913-45c9-a3d2-83e1212192c7",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "person",
        "write": "Yes",
        "guid": "bba7b585-001b-4dc3-a3c2-72fec295149a",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "is_have_condition": false,
        "is_public": false,
        "pdf_action": "Yes",
        "add_filter": "Yes",
        "fix_column": "Yes",
        "tab_group": "Yes",
        "columns": "Yes",
        "group": "Yes",
        "excel_menu": "Yes",
        "search_button": "Yes",
        "field_filter": "Yes",
        "add_field": "Yes",
        "language_btn": "Yes",
        "view_create": "Yes",
        "automation": "Yes",
        "settings": "Yes",
        "share_modal": "Yes",
        "delete_all": "Yes",
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }]

    return recordPermission
}

module.exports = createRecordPermision