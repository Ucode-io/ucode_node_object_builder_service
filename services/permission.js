const permissionStore = require("../storage/mongo/permission");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const permissionService = {
    UpsertPermissionsByAppId: catchWrapServiceObjectBuilder("service.permissionStore.upsertPermissionsByAppId", permissionStore.upsertPermissionsByAppId),
    GetAllPermissionsByRoleId: catchWrapServiceObjectBuilder("service.permissionStore.getAllPermissionsByRoleId", permissionStore.getAllPermissionsByRoleId),
    GetFieldPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getFieldPermissions", permissionStore.getFieldPermissions),
    GetActionPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getActionPermissions", permissionStore.getActionPermissions),
    GetViewRelationPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getViewRelationPermissions", permissionStore.getViewRelationPermissions)
};

module.exports = permissionService;