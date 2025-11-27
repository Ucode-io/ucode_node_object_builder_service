function createClientPlatform(clientPlatformID, clientTypeID, projectID) {
    let clientPlatforms = [{
        "name": "Ucode",
        "subdomain": "ucode",
        "guid": clientPlatformID,
        "project_id": projectID,
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0,
        "client_type_ids": [
            clientTypeID
        ],
        "is_system": true,
    }]

    return clientPlatforms
}

module.exports = createClientPlatform;
