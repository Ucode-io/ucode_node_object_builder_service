async function createAppPermission(guid, role_id) {
    let appPermission = [{
        "chat": true,
        "menu_button": true,
        "settings_button": true,
        "projects_button": true,
        "environments_button": true,
        "api_keys_button": true,
        "menu_setting_button": true,
        "redirects_button": true,
        "profile_settings_button": true,
        "project_settings_button": true,
        "project_button": true,
        "sms_button": true,
        "version_button": true,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "guid": guid,
        "role_id": role_id,
        "__v": 0,
    }]

    return appPermission
}

module.exports = createAppPermission