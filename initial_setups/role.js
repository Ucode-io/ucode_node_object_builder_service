async function createRole(roleID, clientPlatformID, clientTypeID, projectID) {
    let role = [{
        "name": "DEFAULT ADMIN",
        "guid": roleID,
        "project_id": projectID,
        "client_platform_id": clientPlatformID,
        "client_type_id": clientTypeID,
        "createdAt": {
          "$date": "2022-08-25T08:58:44.749Z"
        },
        "updatedAt": {
          "$date": "2022-09-17T10:26:39.945Z"
        }
      }]

    return role
}

module.exports = createRole;
