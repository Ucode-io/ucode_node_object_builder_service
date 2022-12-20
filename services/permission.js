const permissionStore = require("../storage/mongo/permission");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const permissionService = {
    UpsertPermissionsByAppId: catchWrapServiceObjectBuilder("service.permissionStore.upsertPermissionsByAppId", permissionStore.upsertPermissionsByAppId),
    GetAllPermissionsByRoleId: catchWrapServiceObjectBuilder("service.permissionStore.getAllPermissionsByRoleId", permissionStore.getAllPermissionsByRoleId),
    GetFieldPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getFieldPermissions", permissionStore.getFieldPermissions)
};

module.exports = permissionService;