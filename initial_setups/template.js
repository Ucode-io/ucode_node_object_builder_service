async function createTemplate(roleID) {
    let templates = [
        {
            "field_id": "834df8ef-edb7-4170-996c-9bd5431d9a62",
            "table_slug": "template",
            "view_permission": true,
            "edit_permission": true,
            "guid": "789fdf49-5387-4cca-926f-1e963aaee7e0",
            "role_id": roleID,
            "label": "Таблица",
            "createdAt": new Date(),
            "updatedAt": new Date()
          },
          {
            "field_id": "5dda58a1-84ac-4c50-8993-02e2cefcb29a",
            "table_slug": "template",
            "view_permission": true,
            "edit_permission": true,
            "guid": "a14724d7-772b-435a-9aec-55328126c766",
            "role_id": roleID,
            "label": "Размер",
            "createdAt": new Date(),
            "updatedAt": new Date()
          },
          {
            "field_id": "9772b679-33ec-4004-b527-317a1165575e",
            "table_slug": "template",
            "view_permission": true,
            "edit_permission": true,
            "guid": "37d485d4-7cf4-4e35-9cc5-c0c4476712fd",
            "role_id": roleID,
            "label": "Название",
            "createdAt": new Date(),
            "updatedAt": new Date()
          },
          {
            "field_id": "98279b02-10c0-409e-8303-14224fd76ec6",
            "table_slug": "template",
            "view_permission": true,
            "edit_permission": true,
            "guid": "3dbc32ed-8842-4c6e-93bd-f4b01ae9e631",
            "role_id": roleID,
            "label": "HTML",
            "createdAt": new Date(),
            "updatedAt": new Date()
          },
          {
            "field_id": "494e1ad3-fce8-4e6c-921f-850d0ec73cc4",
            "table_slug": "template",
            "view_permission": true,
            "edit_permission": true,
            "guid": "21c47566-b873-4152-ab36-5a510d1aa725",
            "role_id": roleID,
            "label": "ID",
            "createdAt": new Date(),
            "updatedAt": new Date()
          },
          {
            "field_id": "fd7f0fde-3de7-4073-b64d-bd3076c6e3fb",
            "table_slug": "template",
            "view_permission": true,
            "edit_permission": true,
            "guid": "b91908f9-6c77-4211-84d0-134f10094ae7",
            "role_id": roleID,
            "label": "FROM VersionTable2.1 TO template",
            "createdAt": new Date(),
            "updatedAt": new Date()
        }
    ]

    return templates
}

module.exports = createTemplate