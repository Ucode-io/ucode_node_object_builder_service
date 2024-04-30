
async function createUser(userID, roleID, clientTypeID, clientPlatformID, projectID) {
    let userData = [{
        "guid": userID,
        "role_id": roleID,
        "client_type_id": clientTypeID,
        "project_id": projectID,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0,
        "is_system": true,
      }]

      return userData
}

module.exports = createUser