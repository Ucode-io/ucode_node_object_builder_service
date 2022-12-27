async function createClientType(clientPlatformID, clientTypeID, projectID) {
    let clientTypes = [{
        "name": "ADMIN",
        "confirm_by": "PHONE",
        "self_register": false,
        "guid": clientTypeID,
        "self_recover": false,
        "project_id": projectID,
        "createdAt": {
          "$date": "2022-08-25T08:56:04.692Z"
        },
        "updatedAt": {
          "$date": "2022-10-17T10:17:18.283Z"
        },
        "__v": 0,
        "client_platform_ids": [
          clientPlatformID
        ]
      }]

    return clientTypes
}

module.exports = createClientType;
