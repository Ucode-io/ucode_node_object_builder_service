async function createViewRelationPermissions(roleID) {
    let viewRelationPermissions = [{
        "table_slug": "client_platform",
        "relation_id": "426a0cd6-958d-4317-bf23-3b4ea4720e53",
        "view_permission": true,
        "guid": "4a186d1d-8ebd-4828-9a77-a7a6da245976",
        "role_id": roleID,
        "__v": 0,
        "createdAt": new Date(),
        "updatedAt": new Date(),
    }]

    return viewRelationPermissions
}

module.exports = createViewRelationPermissions;
