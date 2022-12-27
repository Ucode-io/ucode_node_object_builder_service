const loginStore = require("../storage/mongo/login");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const loginService = {
    Login: catchWrapServiceObjectBuilder("service.loginStore.login", loginStore.login),
    LoginData: catchWrapServiceObjectBuilder("service.loginStore.login_data", loginStore.login_data),
    LoginWithOtp: catchWrapServiceObjectBuilder("service.loginStore.loginWithOtp", loginStore.loginWithOtp),
    LoginWithEmailOtp: catchWrapServiceObjectBuilder("service.loginStore.loginWithEmailOtp", loginStore.loginWithEmailOtp),
    GetUserUpdatedPermission: catchWrapServiceObjectBuilder("service.loginStore.getUserUpdatedPermission", loginStore.getUserUpdatedPermission)
};

module.exports = loginService;  