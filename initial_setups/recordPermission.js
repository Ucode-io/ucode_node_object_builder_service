async function createRecordPermision(roleID) {
    let recordPermission = [{
        "update": "Yes",
        "table_slug": "app",
        "write": "Yes",
        "guid": "b0c3bc25-8439-4e5a-84db-cd36a456aaef",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": {
            "$date": "2022-08-25T09:04:43.049Z"
        },
        "updatedAt": {
            "$date": "2022-12-05T13:37:24.551Z"
        },
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
        "createdAt": {
            "$date": "2022-08-25T09:05:12.359Z"
        },
        "updatedAt": {
            "$date": "2022-08-25T09:05:12.359Z"
        },
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "connections",
        "write": "Yes",
        "guid": "55243b6e-63fb-4e28-ba07-8625b3e43738",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": {
            "$date": "2022-08-25T09:06:11.280Z"
        },
        "updatedAt": {
            "$date": "2022-08-25T09:06:11.280Z"
        },
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "role",
        "write": "Yes",
        "guid": "380e14ab-71bc-4558-a3b4-537dbd4d57f4",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": {
            "$date": "2022-08-25T09:06:31.979Z"
        },
        "updatedAt": {
            "$date": "2022-08-25T09:06:31.979Z"
        },
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "client_type",
        "write": "Yes",
        "guid": "42fb56bf-bfbc-4f8f-96fb-1c2567d91b79",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": {
            "$date": "2022-08-25T11:24:14.343Z"
        },
        "updatedAt": {
            "$date": "2022-08-25T11:24:14.343Z"
        },
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "client_platform",
        "write": "Yes",
        "guid": "3b850c28-deff-4e2d-8a3c-f6e47e5c4d26",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": {
            "$date": "2022-08-25T11:24:41.619Z"
        },
        "updatedAt": {
            "$date": "2022-08-25T11:24:41.619Z"
        },
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "project",
        "write": "Yes",
        "guid": "1c04479e-f549-48f8-b5cb-5fa7e929e296",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": {
            "$date": "2022-08-25T11:25:36.011Z"
        },
        "updatedAt": {
            "$date": "2022-08-25T11:25:36.011Z"
        },
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "test_login",
        "write": "Yes",
        "guid": "2953079b-0bcd-4b32-8322-751720d4db78",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": {
            "$date": "2022-08-25T11:33:38.991Z"
        },
        "updatedAt": {
            "$date": "2022-08-25T11:33:45.059Z"
        },
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "user",
        "write": "Yes",
        "guid": "9389ed9e-6cf4-442d-9268-d46820b721b2",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": {
            "$date": "2022-08-25T11:56:27.112Z"
        },
        "updatedAt": {
            "$date": "2022-08-25T11:56:27.112Z"
        },
        "__v": 0
    }, {
        "update": "Yes",
        "table_slug": "automatic_filter",
        "write": "Yes",
        "guid": "e40b13da-f913-45c9-a3d2-83e1212192c7",
        "read": "Yes",
        "delete": "Yes",
        "role_id": roleID,
        "createdAt": {
            "$date": "2022-09-05T05:32:54.675Z"
        },
        "updatedAt": {
            "$date": "2022-09-05T05:32:59.807Z"
        },
        "__v": 0
    }]

    return recordPermission
}

module.exports = createRecordPermision