const permissionStore = require("../storage/mongo/permission");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const permissionService = {
    UpsertPermissionsByAppId: catchWrapServiceObjectBuilder("service.permissionStore.upsertPermissionsByAppId", permissionStore.upsertPermissionsByAppId),
    GetAllPermissionsByRoleId: catchWrapServiceObjectBuilder("service.permissionStore.getAllPermissionsByRoleId", permissionStore.getAllPermissionsByRoleId),
    GetFieldPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getFieldPermissions", permissionStore.getFieldPermissions),
<<<<<<< HEAD
    GetListWithAppTablePermissions: catchWrapServiceObjectBuilder(`service.app.getListWithAppTablePermissions`, permissionStore.getListWithAppTablePermissions),
    GetListWithRoleAppTablePermissions: catchWrapServiceObjectBuilder(`service.app.getListWithRoleAppTablePermissions`, permissionStore.getListWithRoleAppTablePermissions),
    UpdateRoleAppTablePermissions: catchWrapServiceObjectBuilder(`service.app.updateRoleAppTablePermissions`, permissionStore.updateRoleAppTablePermissions),
    CreateRoleAppTablePermissions: catchWrapServiceObjectBuilder(`service.app.createRoleAppTablePermissions`, permissionStore.createRoleAppTablePermissions),
=======
    GetActionPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getActionPermissions", permissionStore.getActionPermissions),
    GetViewRelationPermissions: catchWrapServiceObjectBuilder("service.permissionStore.getViewRelationPermissions", permissionStore.getViewRelationPermissions)
>>>>>>> 6de6a39b106b59ba7420fe8ec290b748cc79c98e
};

module.exports = permissionService;