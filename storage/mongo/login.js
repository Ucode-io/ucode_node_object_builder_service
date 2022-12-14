const ObjectBuilder = require("../../models/object_builder");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")

let NAMESPACE = "storage.login";


// just comment
let loginStore = {
    login: catchWrapDbObjectBuilder(`${NAMESPACE}.login`, async (req) => {
        const clientTypeTable = (await ObjectBuilder())["client_type"]

        const clientType = await clientTypeTable.models.findOne(
            {
                name: req.client_type,
            }
        )
        const tableInfo = (await ObjectBuilder())["test_login"]
        const login = await tableInfo.models.findOne(
            {
                $and: [
                    {
                        client_type_id: clientType.guid
                    },
                    {
                        login_strategy: "Login with password"
                    }
                ]
            }
        )
        if (!login) {
            return null
        }

        let params = {}
        params[login.login_view] = req.login
        params[login.password_view] = req.password

        const userTable = (await ObjectBuilder())[login.table_slug]
        let user, userId;
        user = await userTable.models.findOne(
            {
                $and: [params]
            }
        )
        let user_found = false
        if (!user) {
            return {
                user_found: user_found
            }
        }
        const roleTable = (await ObjectBuilder())["role"]

        const role = await roleTable.models.findOne(
            {
                client_type_id: clientType.guid,
            }
        )

        const clientPlatfromTable = (await ObjectBuilder())["client_platform"]

        const clientPlatform = await clientPlatfromTable.models.findOne(
            {
                guid: role.client_platform_id
            }
        )


        const connectionsTable = (await ObjectBuilder())["connections"]

        const connections = await connectionsTable.models.find(
            {
                client_type_id: clientType.guid
            }
        )
        let clientTypeResp = {}
        clientTypeResp = clientType
        clientTypeResp.tables = connections

        const recordPermission = (await ObjectBuilder())["record_permission"]

        const permissions = await recordPermission.models.find(
            {
                $and: [
                    {
                        client_type_id: clientType.guid
                    },
                    {
                        role_id: role.guid
                    }
                ]
            }
        )
        if (user) {
            user_found = true
            userId = user.guid
        } else {
            userId = ""
        }

        const appPermissions = await recordPermission.models.find(
            {
                $and: [
                    {
                        table_slug: "app"
                    },
                    {
                        role_id: user.role_id
                    }
                ]
            }
        )

        console.log('user_found', user_found)
        console.log('user_id', user_id)
        console.log('login.table_slug', login.table_slug)
        console.log('clientPlatform', JSON.parse(clientPlatform))
        console.log('clientTypeResp', JSON.parse(clientTypeResp))
        console.log('appPermissions', JSON.parse(appPermissions))
        console.log('role', JSON.parse(role))
        console.log('permissions', JSON.parse(permissions))

        return {
            user_found: user_found,
            client_platform: clientPlatform,
            client_type: clientTypeResp,
            user_id: userId,
            app_permissions: appPermissions,
            role: role,
            permissions: permissions,
            login_table_slug: login.table_slug
        }
    }),
    loginWithOtp: catchWrapDbObjectBuilder(`${NAMESPACE}.loginWithOtp`, async (req) => {

        let clientType,
            clientPlatform,
            role,
            permissions,
            user,
            clientTypeResp,
            userTable,
            userId;

        let user_found = false
        const tableInfo = (await ObjectBuilder())["test_login"]
        const clientTypeTable = (await ObjectBuilder())["client_type"]
        clientType = await clientTypeTable.models.findOne(
            {
                name: req.client_type
            }
        )
        const login = await tableInfo.models.findOne(
            {
                $and: [
                    {
                        login_strategy: "Phone OTP"
                    },
                    {
                        client_type_id: clientType.guid
                    }
                ]
            }
        )
        if (!login) {
            return null
        }

        let temp = req.phone_number.toString()
        let tempPhone = temp.substring(5, temp.length)
        let phone = `\(` + temp.substring(1, 3) + `\) ` + tempPhone
        let params = {}
        params[login.login_view] = phone
        userTable = (await ObjectBuilder())[login.table_slug]
        user = await userTable.models.findOne(
            {
                $and: [params]
            }
        )
        if (user) {

            const roleTable = (await ObjectBuilder())["role"]

            role = await roleTable.models.findOne(
                {
                    client_type_id: clientType.guid,
                }
            )
            const clientPlatfromTable = (await ObjectBuilder())["client_platform"]

            clientPlatform = await clientPlatfromTable.models.findOne(
                {
                    guid: role.client_platform_id,
                }
            )


            const connectionsTable = (await ObjectBuilder())["connections"]

            const connections = await connectionsTable.models.find(
                {
                    client_type_id: clientType.guid
                }
            )

            clientTypeResp = clientType
            clientTypeResp.tables = connections

            const recordPermission = (await ObjectBuilder())["record_permission"]

            permissions = await recordPermission.models.find(
                {
                    $and: [
                        {
                            client_type_id: clientType.guid
                        },
                        {
                            role_id: role.guid
                        }
                    ]
                }
            )

            user_found = true
        }
        if (!user) {
            userId = ""
        } else {
            userId = user.guid
        }
        return {
            user_found: user_found,
            client_platform: clientPlatform,
            client_type: clientTypeResp,
            user_id: userId,
            role: role,
            permissions: permissions,
            login_table_slug: login.table_slug
        }
    }),
    loginWithEmailOtp: catchWrapDbObjectBuilder(`${NAMESPACE}.loginWithEmailOtp`, async (req) => {

        let clientType, clientPlatform, role, permissions, user, clientTypeResp, userTable, userId;
        let user_found = false
        const tableInfo = (await ObjectBuilder())["test_login"]
        const clientTypeTable = (await ObjectBuilder())["client_type"]
        clientType = await clientTypeTable.models.findOne(
            {
                name: req.client_type
            }
        )
        const login = await tableInfo.models.findOne(
            {
                $and: [{
                    login_strategy: "Email OTP"
                }, {
                    client_type_id: clientType.guid
                }]
            }
        )
        if (!login) {
            return null
        }
        let params = {}
        params[login.login_view] = req.email
        userTable = (await ObjectBuilder())[login.table_slug]
        user = await userTable.models.findOne(
            {
                $and: [params]
            }
        )
        if (user) {

            const roleTable = (await ObjectBuilder())["role"]

            role = await roleTable.models.findOne(
                {
                    client_type_id: clientType.guid,
                }
            )
            const clientPlatfromTable = (await ObjectBuilder())["client_platform"]

            clientPlatform = await clientPlatfromTable.models.findOne(
                {
                    guid: role.client_platform_id,
                }
            )


            const connectionsTable = (await ObjectBuilder())["connections"]

            const connections = await connectionsTable.models.find(
                {
                    client_type_id: clientType.guid
                }
            )

            clientTypeResp = clientType
            clientTypeResp.tables = connections

            const recordPermission = (await ObjectBuilder())["record_permission"]

            permissions = await recordPermission.models.find(
                {
                    $and: [{
                        client_type_id: clientType.guid
                    }, {
                        role_id: role.guid
                    }]
                }
            )

            user_found = true
        }
        if (!user) {
            userId = ""
        } else {
            userId = user.guid
        }
        return {
            user_found: user_found,
            client_platform: clientPlatform,
            client_type: clientTypeResp,
            user_id: userId,
            role: role,
            permissions: permissions,
            login_table_slug: login.table_slug
        }
    }),
    getUserUpdatedPermission: catchWrapDbObjectBuilder(`${NAMESPACE}.getUserUpdatedPermission`, async (req) => {

        let clientType, clientPlatform, role, permissions, user, clientTypeResp, userTable, userId;
        const tableInfo = (await ObjectBuilder())["test_login"]
        const clientTypeTable = (await ObjectBuilder())["client_type"]
        clientType = await clientTypeTable.models.findOne(
            {
                guid: req.client_type_id
            }
        )

        const roleTable = (await ObjectBuilder())["role"]

        role = await roleTable.models.findOne(
            {
                client_type_id: clientType.guid,
            }
        )
        const clientPlatfromTable = (await ObjectBuilder())["client_platform"]

        clientPlatform = await clientPlatfromTable.models.findOne(
            {
                guid: role.client_platform_id,
            }
        )

        const connectionsTable = (await ObjectBuilder())["connections"]

        const connections = await connectionsTable.models.find(
            {
                client_type_id: clientType.guid
            }
        )

        clientTypeResp = clientType
        clientTypeResp.tables = connections

        const recordPermission = (await ObjectBuilder())["record_permission"]

        permissions = await recordPermission.models.find(
            {
                $and: [{
                    client_type_id: clientType.guid
                }, {
                    role_id: role.guid
                }]
            }
        )

        return {
            user_found: true,
            client_platform: clientPlatform,
            client_type: clientTypeResp,
            user_id: req.user_id,
            role: role,
            permissions: permissions,
        }
    }),
}

module.exports = loginStore;