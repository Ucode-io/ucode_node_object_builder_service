const permissionStore = require("../storage/mongo/permission");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const permissionService = {
    UpsertPermissionsByAppId: catchWrapServiceObjectBuilder("service.permissionStore.upsertPermissionsByAppId", permissionStore.upsertPermissionsByAppId),
    GetAllPermissionsByRoleId: catchWrapServiceObjectBuilder("service.permissionStore.getAllPermissionsByRoleId", permissionStore.getAllPermissionsByRoleId),
    GetFieldPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getFieldPermissions", permissionStore.getFieldPermissions),
    GetListWithAppTablePermissions: catchWrapServiceObjectBuilder(`service.app.getListWithAppTablePermissions`, permissionStore.getListWithAppTablePermissions),
    GetListWithRoleAppTablePermissions: catchWrapServiceObjectBuilder(`service.app.getListWithRoleAppTablePermissions`, permissionStore.getListWithRoleAppTablePermissions),
    UpdateRoleAppTablePermissions: catchWrapServiceObjectBuilder(`service.app.updateRoleAppTablePermissions`, permissionStore.updateRoleAppTablePermissions),
    CreateDefaultPermission: catchWrapServiceObjectBuilder(`service.app.createDefaultPermission`, permissionStore.createDefaultPermission),
    GetActionPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getActionPermissions", permissionStore.getActionPermissions),
    GetViewRelationPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getViewRelationPermissions", permissionStore.getViewRelationPermissions),
    GetAllMenuPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getAllMenuPermissions", permissionStore.getAllMenuPermissions),
    UpdateMenuPermissions: catchWrapServiceObjectBuilder("service.permissionStore.updateMenuPermissions", permissionStore.updateMenuPermissions),
    GetGlobalPermissionByRoleId: catchWrapServiceObjectBuilder("service.permissionStore.getGlobalPermissionByRoleId", permissionStore.getGlobalPermissionByRoleId),
    GetPermissionsByTableSlug: catchWrapServiceObjectBuilder("service.permissionStore.getPermissionsByTableSlug", permissionStore.getPermissionsByTableSlug),
    UpdatePermissionsByTableSlug: catchWrapServiceObjectBuilder("service.permissionStore.updatePermissionsByTableSlug", permissionStore.updatePermissionsByTableSlug),
    GetTablePermission: catchWrapServiceObjectBuilder("service.permissionStore.getTablePermission", permissionStore.getTablePermission),
};

module.exports = permissionService;