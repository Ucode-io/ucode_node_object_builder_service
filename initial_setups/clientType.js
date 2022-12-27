async function createClientType(clientPlatformID, clientTypeID, projectID) {
    let clientTypes = [{
        "name": "ADMIN",
        "confirm_by": "PHONE",
        "self_register": false,
        "guid": clientTypeID,
        "self_recover": false,
        "project_id": projectID,
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "client_platform_ids": [
          clientPlatformID
        ]
      }]

    return clientTypes
}

module.exports = createClientType;
