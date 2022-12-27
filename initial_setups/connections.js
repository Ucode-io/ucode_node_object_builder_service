async function createConnection(connectionID, clientTypeID) {
    let connections = [{
        "table_slug": "branches",
        "icon": "address-card.svg",
        "view_slug": "name",
        "view_label": "",
        "type": "",
        "name": "Филиал",
        "guid": connectionID,
        "client_type_id": clientTypeID,
        "createdAt": {
            "$date": "2022-11-16T13:29:49.446Z"
        },
        "updatedAt": {
            "$date": "2022-11-16T13:29:49.446Z"
        },
        "__v": 0
    }]

    return connections
}

module.exports = createConnection