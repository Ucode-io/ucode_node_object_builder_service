function createClientPlatform(clientPlatformID, clientTypeID, projectID) {
    let clientPlatforms = [{
        "name": "Ucode",
        "subdomain": "ucode",
        "guid": clientPlatformID,
        "project_id": projectID,
        "createdAt": {
            "$date": "2022-10-17T09:36:37.383Z"
        },
        "updatedAt": {
            "$date": "2022-12-20T11:56:41.646Z"
        },
        "__v": 0,
        "client_type_ids": [
            clientTypeID
        ]
    }]

    return clientPlatforms
}

module.exports = createClientPlatform;
