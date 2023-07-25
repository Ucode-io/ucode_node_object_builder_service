
async function createUser(userID, roleID, clientTypeID, clientPlatformID, projectID) {
    let userData = [{
        "active": 1,
        "expires_at": "2026-08-21T09:03:03.905Z",
        "guid": userID,
        "role_id": roleID,
        "client_type_id": clientTypeID,
        "client_platform_id": clientPlatformID,
        "project_id": projectID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0,
        "is_system": true,
      }]

      return userData
}

module.exports = createUser