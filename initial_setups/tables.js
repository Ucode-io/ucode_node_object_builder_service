async function createTable() {
    let tables = [{
        "label": "Разрешение для связь",
        "slug": "view_relation_permission",
        "description": "Разрешение для связь которые в страница сведений",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "door-closed.svg",
        "subtitle_field_slug": "",
        "id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
        "created_at": {
            "$date": "2022-11-07T08:33:53.928Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.895Z"
        },
        "__v": 0
    }, {
        "label": "Связь",
        "slug": "connections",
        "description": "connections",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "brand_connectdevelop.svg",
        "subtitle_field_slug": "",
        "with_increment_id": false,
        "digit_number": 0,
        "id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
        "created_at": {
            "$date": "2022-08-25T08:21:39.885Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.359Z"
        },
        "__v": 0
    }, {
        "label": "Роли",
        "slug": "role",
        "description": "role",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "brand_critical-role.svg",
        "subtitle_field_slug": "",
        "with_increment_id": false,
        "digit_number": 0,
        "id": "1ab7fadc-1f2b-4934-879d-4e99772526ad",
        "created_at": {
            "$date": "2022-08-25T07:22:16.110Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.348Z"
        },
        "__v": 0
    }, {
        "label": "Пользователи",
        "slug": "user",
        "description": "user",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "address-card.svg",
        "subtitle_field_slug": "",
        "with_increment_id": false,
        "digit_number": 0,
        "id": "2546e042-af2f-4cef-be7c-834e6bde951c",
        "created_at": {
            "$date": "2022-08-25T08:15:41.247Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.354Z"
        },
        "__v": 0
    }, {
        "label": "Разрешение",
        "slug": "record_permission",
        "description": "record permission",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "record-vinyl.svg",
        "subtitle_field_slug": "",
        "with_increment_id": false,
        "digit_number": 0,
        "id": "25698624-5491-4c39-99ec-aed2eaf07b97",
        "created_at": {
            "$date": "2022-08-25T08:26:08.128Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.364Z"
        },
        "__v": 0
    }, {
        "label": "Проект",
        "slug": "project",
        "description": "project",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "diagram-project.svg",
        "subtitle_field_slug": "",
        "with_increment_id": false,
        "digit_number": 0,
        "id": "373e9aae-315b-456f-8ec3-0851cad46fbf",
        "created_at": {
            "$date": "2022-08-25T07:10:34.022Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.303Z"
        },
        "__v": 0
    }, {
        "label": "Автоматический фильтр",
        "slug": "automatic_filter",
        "description": "Автоматический фильтр для матрица",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "filter.svg",
        "subtitle_field_slug": "",
        "with_increment_id": false,
        "digit_number": 0,
        "id": "4c1f5c95-1528-4462-8d8c-cd377c23f7f7",
        "created_at": {
            "$date": "2022-09-05T05:31:53.725Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.608Z"
        },
        "__v": 0
    }, {
        "label": "Клиент платформа",
        "slug": "client_platform",
        "description": "client platform",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "brand_bimobject.svg",
        "subtitle_field_slug": "",
        "with_increment_id": false,
        "digit_number": 0,
        "id": "53edfff0-2a31-4c73-b230-06a134afa50b",
        "created_at": {
            "$date": "2022-08-25T07:14:33.235Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.311Z"
        },
        "__v": 0
    }, {
        "label": "Разрешение на действие",
        "slug": "action_permission",
        "description": "Разрешение на действие",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "eye-dropper.svg",
        "subtitle_field_slug": "",
        "id": "5af2bfb2-6880-42ad-80c8-690e24a2523e",
        "created_at": {
            "$date": "2022-10-29T21:22:35.578Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.742Z"
        },
        "__v": 0
    }, {
        "label": "Логин таблица",
        "slug": "test_login",
        "description": "Test Login",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "blog.svg",
        "subtitle_field_slug": "",
        "with_increment_id": false,
        "digit_number": 0,
        "id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
        "created_at": {
            "$date": "2022-08-25T08:40:48.499Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.370Z"
        },
        "__v": 0
    }, {
        "label": "Разрешение поля",
        "slug": "field_permission",
        "description": "Разрешение поля",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "clapperboard.svg",
        "subtitle_field_slug": "",
        "id": "961a3201-65a4-452a-a8e1-7c7ba137789c",
        "created_at": {
            "$date": "2022-09-27T14:05:23.312Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.669Z"
        },
        "__v": 0
    }, {
        "label": "Тип клиентов",
        "slug": "client_type",
        "description": "client type",
        "deleted_at": {
            "$date": "1970-01-01T18:00:00Z"
        },
        "show_in_menu": true,
        "is_changed": false,
        "icon": "angles-right.svg",
        "subtitle_field_slug": "",
        "with_increment_id": false,
        "digit_number": 0,
        "id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
        "created_at": {
            "$date": "2022-08-25T07:19:13.006Z"
        },
        "updated_at": {
            "$date": "2022-12-23T06:57:02.337Z"
        },
        "__v": 0
    }]

    return tables;
}

module.exports = createTable