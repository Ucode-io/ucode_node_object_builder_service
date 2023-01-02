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
        "created_at": new Date(),
        "updated_at": new Date(),
        "__v": 0
    }]

    return connections
}

module.exports = createConnection