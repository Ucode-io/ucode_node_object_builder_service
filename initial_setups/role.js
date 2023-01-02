async function createRole(roleID, clientPlatformID, clientTypeID, projectID) {
    let role = [{
        "name": "DEFAULT ADMIN",
        "guid": roleID,
        "project_id": projectID,
        "client_platform_id": clientPlatformID,
        "client_type_id": clientTypeID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
      }]

    return role
}

module.exports = createRole;
