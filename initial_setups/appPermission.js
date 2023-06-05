async function createAppPermission(roleID) {
    let appPermission = [{
        "create": true,
        "read": true,
        "update": true,
        "delete": true,
        "guid": "b0c3bc25-8439-4e5a-84db-cd36a456aaeg",
        "role_id": roleID,
        "app_id": "c57eedc3-a954-4262-a0af-376c65b5a283",
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0,
    }]

    return appPermission
}

module.exports = createAppPermission