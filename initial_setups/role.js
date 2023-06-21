async function createRole(roleID, clientPlatformID, clientTypeID, projectID) {
    let role = [{
        "name": "DEFAULT ADMIN",
        "guid": roleID,
        "project_id": projectID,
        "client_platform_id": clientPlatformID,
        "client_type_id": clientTypeID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
      },
      {
        "name": "Guess",
        "guid": "027944d2-0460-11ee-be56-0242ac120002",
        "project_id": projectID,
        "client_platform_id": "",
        "client_type_id": "92911a9a-0460-11ee-be56-0242ac120002",
        "createdAt": new Date(),
        "updatedAt": new Date(),
      }
    ]

    return role
}

module.exports = createRole;
