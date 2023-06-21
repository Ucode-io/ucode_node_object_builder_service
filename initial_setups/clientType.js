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
      }, {
        "name": "Guess",
        "confirm_by": "UNDECIDED",
        "self_register": false,
        "guid": "92911a9a-0460-11ee-be56-0242ac120002",
        "self_recover": false,
        "project_id": projectID,
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "client_platform_ids": []
      }]

    return clientTypes
}

module.exports = createClientType;
