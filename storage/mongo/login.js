const ObjectBuilder = require("../../models/object_builder");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
const mongoPool = require("../../pkg/pool");
const { struct } = require("pb-util");

let NAMESPACE = "storage.login";


// just comment
let loginStore = {
    login: catchWrapDbObjectBuilder(`${NAMESPACE}.login`, async (req) => {
        const clientTypeTable = (await ObjectBuilder(true, req.project_id))["client_type"]

        const clientType = await clientTypeTable.models.findOne(
            {
                name: req.client_type,
            }
        )
        const tableInfo = (await ObjectBuilder(true, req.project_id))["test_login"]
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

        const userTable = (await ObjectBuilder(true, req.project_id))[login.table_slug]
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
        const roleTable = (await ObjectBuilder(true, req.project_id))["role"]

        const role = await roleTable.models.findOne(
            {
                client_type_id: clientType.guid,
            }
        )

        const clientPlatfromTable = (await ObjectBuilder(true, req.project_id))["client_platform"]

        const clientPlatform = await clientPlatfromTable.models.findOne(
            {
                guid: role.client_platform_id
            }
        )


        const connectionsTable = (await ObjectBuilder(true, req.project_id))["connections"]

        const connections = await connectionsTable.models.find(
            {
                client_type_id: clientType.guid
            }
        )
        let clientTypeResp = {}
        clientTypeResp = clientType
        clientTypeResp.tables = connections

        const recordPermission = (await ObjectBuilder(true, req.project_id))["record_permission"]

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

        // console.log('user_found', user_found)
        // console.log('user_id', userId)
        // console.log('login.table_slug', login.table_slug)
        // console.log('clientPlatform', JSON.parse(clientPlatform))
        // console.log('clientTypeResp', JSON.parse(clientTypeResp))
        // console.log('appPermissions', JSON.parse(appPermissions))
        // console.log('role', JSON.parse(role))
        // console.log('permissions', JSON.parse(permissions))

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
        // console.log("::::::::::; login with otp")
        let clientType,
            clientPlatform,
            role,
            permissions,
            user,
            clientTypeResp,
            userTable,
            userId,
            phone_number = req.phone_number

        let user_found = false
        const tableInfo = (await ObjectBuilder(true, req.project_id))["user"]
        const clientTypeTable = (await ObjectBuilder(true, req.project_id))["client_type"]
        clientType = await clientTypeTable.models.findOne(
            {
                name: req.client_type
            }
        )

        let temp = req.phone_number.toString()
        let tempPhone = temp.substring(5, temp.length)
        let phone = `\(` + temp.substring(1, 3) + `\) ` + tempPhone
        let params = {}
        params["phone"] = phone

        userTable = (await ObjectBuilder(true, req.project_id))["user"]

        user = await userTable.models.findOne(params)
        if (!user) {
            user = await userTable.models.findOne({ "phone": phone_number })

        }
        if (user) {

            const roleTable = (await ObjectBuilder(true, req.project_id))["role"]

            role = await roleTable.models.findOne(
                {
                    client_type_id: clientType.guid,
                }
            )
            const clientPlatfromTable = (await ObjectBuilder(true, req.project_id))["client_platform"]

            clientPlatform = await clientPlatfromTable.models.findOne(
                {
                    guid: role.client_platform_id,
                }
            )


            const connectionsTable = (await ObjectBuilder(true, req.project_id))["connections"]

            const connections = await connectionsTable.models.find(
                {
                    client_type_id: clientType.guid
                }
            )

            clientTypeResp = clientType
            clientTypeResp.tables = connections

            const recordPermission = (await ObjectBuilder(true, req.project_id))["record_permission"]

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
        // console.log(">>>.", clientPlatform, clientTypeResp, role, permissions)
        return {
            user_found: user_found,
            client_platform: clientPlatform,
            client_type: clientTypeResp,
            user_id: userId,
            role: role,
            permissions: permissions,
            login_table_slug: "user"
        }
    }),
    loginWithEmailOtp: catchWrapDbObjectBuilder(`${NAMESPACE}.loginWithEmailOtp`, async (req) => {

        let clientType, clientPlatform, role, permissions, user, clientTypeResp, userTable, userId;
        let user_found = false
        const clientTypeTable = (await ObjectBuilder(true, req.project_id))["client_type"]
        clientType = await clientTypeTable.models.findOne(
            {
                name: req.client_type
            }
        )
        // console.log(`[1]-->clientType`, JSON.stringify(clientType, null, 2))
        let params = {}
        params["email"] = req.email
        userTable = (await ObjectBuilder(true, req.project_id))["user"]

        // console.log(`[!!]-->params`, JSON.stringify(params, null, 2))
        user = await userTable.models.findOne(
            {
                $and: [params]
            }
        )
        // console.log(`[3]-->user`, JSON.stringify(user, null, 2))
        if (user) {

            const roleTable = (await ObjectBuilder(true, req.project_id))["role"]

            role = await roleTable.models.findOne(
                {
                    client_type_id: clientType?.guid,
                }
            )
            // console.log(`[4]-->role`, JSON.stringify(role, null, 2))
            const clientPlatfromTable = (await ObjectBuilder(true, req.project_id))["client_platform"]

            clientPlatform = await clientPlatfromTable.models.findOne(
                {
                    guid: role.client_platform_id,
                }
            )
            // console.log(`[4]-->clientPlatform`, JSON.stringify(clientPlatform, null, 2))

            const connectionsTable = (await ObjectBuilder(true, req.project_id))["connections"]

            const connections = await connectionsTable.models.find(
                {
                    client_type_id: clientType?.guid
                }
            )
            // console.log(`[4]-->connections`, JSON.stringify(connections, null, 2))

            clientTypeResp = clientType
            clientTypeResp.tables = connections

            const recordPermission = (await ObjectBuilder(true, req.project_id))["record_permission"]

            permissions = await recordPermission.models.find(
                {
                    $and: [{
                        client_type_id: clientType?.guid
                    }, {
                        role_id: role.guid
                    }]
                }
            )

            // console.log(`[4]-->permissions`, JSON.stringify(permissions, null, 2))

            user_found = true
        }
        if (!user) {
            userId = ""
        } else {
            userId = user?.guid
        }
        return {
            user_found: user_found,
            client_platform: clientPlatform,
            client_type: clientTypeResp,
            user_id: userId,
            role: role,
            permissions: permissions,
            login_table_slug: "user"
        }
    }),
    getUserUpdatedPermission: catchWrapDbObjectBuilder(`${NAMESPACE}.getUserUpdatedPermission`, async (req) => {

        let clientType, clientPlatform, role, permissions, user, clientTypeResp, userTable, userId;
        const tableInfo = (await ObjectBuilder(true, req.project_id))["test_login"]
        const clientTypeTable = (await ObjectBuilder(true, req.project_id))["client_type"]
        clientType = await clientTypeTable.models.findOne(
            {
                guid: req.client_type_id
            }
        )

        const roleTable = (await ObjectBuilder(true, req.project_id))["role"]

        role = await roleTable.models.findOne(
            {
                client_type_id: clientType.guid,
            }
        )
        const clientPlatfromTable = (await ObjectBuilder(true, req.project_id))["client_platform"]

        clientPlatform = await clientPlatfromTable.models.findOne(
            {
                guid: role.client_platform_id,
            }
        )

        const connectionsTable = (await ObjectBuilder(true, req.project_id))["connections"]

        const connections = await connectionsTable.models.find(
            {
                client_type_id: clientType.guid
            }
        )

        clientTypeResp = clientType
        clientTypeResp.tables = connections

        const recordPermission = (await ObjectBuilder(true, req.project_id))["record_permission"]

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
    login_data: catchWrapDbObjectBuilder(`${NAMESPACE}.login_data`, async (req) => {
        // console.log("TEST:::::::::1", req.resource_environment_id)
        // console.log("req", JSON.stringify(req, null, 2))
        const allTables = (await ObjectBuilder(true, req.resource_environment_id))
        const clientTypeTable = allTables["client_type"]
        const globalPermission = allTables["global_permission"]

        const clientType = await clientTypeTable.models.findOne(
            {
                $or: [
                    { guid: req.client_type },
                    { name: req.client_type }
                ]
            }
        ).lean()
        let params = {}, tableSlug = "user"
        params["guid"] = req.user_id
        // params["project_id"] = req.project_id
        params["client_type_id"] = req.client_type
        if (clientType && clientType.table_slug) {
            tableSlug = clientType.table_slug
        }


        const userTable = (await ObjectBuilder(true, req.resource_environment_id))[tableSlug]
        let user = await userTable.models.findOne(params).lean()

        let user_found = false
        // console.log("TEST:::::::::3", JSON.stringify(user, null, 2))

        if (!user) {
            return {
                user_found: user_found
            }
        }
        // console.log("TEST:::::::::3")
        const roleTable = allTables["role"]

        const role = await roleTable.models.findOne(
            {
                guid: user.role_id,
            }
        ).lean()
        if (!role) {
            return {
                user_found: false
            }
        }
        // console.log("TEST:::::::::4")
        // console.log("TEST:::::::::4")
        const clientPlatfromTable = allTables["client_platform"]

        const clientPlatform = await clientPlatfromTable.models.findOne(
            {
                guid: role.client_platform_id
            }
        ).lean()

        // console.log("TEST:::::::::5", JSON.stringify(clientPlatform, null, 2))

        const connectionsTable = allTables["connections"]

        const connections = await connectionsTable.models.find(
            {
                client_type_id: clientType.guid
            }
        ).lean()

        // console.log("TEST:::::::::6", JSON.stringify(connections, null, 2))
        let clientTypeResp = {}
        clientTypeResp = clientType
        clientTypeResp.tables = connections

        const recordPermission = allTables["record_permission"]

        const permissions = await recordPermission.models.find(
            {
                role_id: role.guid
            }
        ).lean()
        // console.log("TEST:::::::::7", JSON.stringify(permissions, null, 2))

        let userId;
        if (user) {
            user_found = true
            userId = user.guid
        }
        // console.log("TEST:::::::::8")
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
        ).lean()

        const global_permission = await globalPermission?.models.findOne({ role_id: user.role_id }) || {}
        // console.log(global_permission)

        //@TODO:: check user can login with this login strategy
        let response = {
            user_found: user_found,
            client_platform: clientPlatform,
            client_type: clientTypeResp,
            user_id: userId,
            app_permissions: appPermissions,
            role: role,
            permissions: permissions,
            global_permission: global_permission,
            login_table_slug: tableSlug,
            user_data: struct.encode(user)
        }
        // console.log("TEST:::::::::10", JSON.stringify(response, null, 2))

        return response
    }),
    loginDataByUserId: catchWrapDbObjectBuilder(`${NAMESPACE}.loginDataByUserId`, async (req) => {
        // console.log("TEST:::::::::1", req.resource_environment_id)
        // console.log("req", JSON.stringify(req, null, 2))

        const userTable = (await ObjectBuilder(true, req.resource_environment_id))["user"]
        let user = await userTable.models.findOne(
            {
                guid: req.user_id,
                project_id: req.project_id
            }
        ).lean()

        let user_found = false
        // console.log("TEST:::::::::3", JSON.stringify(user, null, 2))

        if (!user) {
            return {
                user_found: user_found
            }
        }
        // console.log("TEST:::::::::3")
        const clientTypeTable = (await ObjectBuilder(true, req.resource_environment_id))["client_type"]

        const clientType = await clientTypeTable.models.findOne(
            {
                guid: user.client_type_id
            }
        ).lean()
        // console.log("TEST:::::::::2", JSON.stringify(clientType, null, 2))

        const roleTable = (await ObjectBuilder(true, req.resource_environment_id))["role"]

        const role = await roleTable.models.findOne(
            {
                guid: user.role_id
            }
        ).lean()
        // console.log("TEST:::::::::4")
        const clientPlatfromTable = (await ObjectBuilder(true, req.resource_environment_id))["client_platform"]

        const clientPlatform = await clientPlatfromTable.models.findOne(
            {
                guid: role?.client_platform_id
            }
        ).lean()

        // console.log("TEST:::::::::5", JSON.stringify(clientPlatform, null, 2))

        const connectionsTable = (await ObjectBuilder(true, req.resource_environment_id))["connections"]

        const connections = await connectionsTable.models.find(
            {
                client_type_id: clientType?.guid
            }
        ).lean()

        // console.log("TEST:::::::::6", JSON.stringify(connections, null, 2))
        let clientTypeResp = {}
        clientTypeResp = clientType
        clientTypeResp.tables = connections

        const recordPermission = (await ObjectBuilder(true, req.resource_environment_id))["record_permission"]

        const permissions = await recordPermission.models.find(
            {
                role_id: user.role_id,
            }
        ).lean()
        // console.log("TEST:::::::::7", JSON.stringify(permissions, null, 2))

        let userId;
        if (user) {
            user_found = true
            userId = user.guid
        }
        // console.log("TEST:::::::::8")
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
        ).lean()

        //@TODO:: check user can login with this login strategy
        let response = {
            user_found: user_found,
            client_platform: clientPlatform,
            client_type: clientTypeResp,
            user_id: userId,
            app_permissions: appPermissions,
            role: role,
            permissions: permissions,
            login_table_slug: 'user'
        }
        // console.log("TEST:::::::::10", JSON.stringify(response, null, 2))

        return response
    }),
    getConnetionOptions: catchWrapDbObjectBuilder(`${NAMESPACE}.getConnetionOptions`, async (req) => {
        let options = []
        console.log("req", req);
        const connection = await (await ObjectBuilder(true, req.resource_environment_id))["connections"].models.findOne({ guid: req.connection_id }).lean()
        if (connection && connection.table_slug && connection.field_slug) {
            console.log("test connection: " + connection);
            const clientType = await (await ObjectBuilder(true, req.resource_environment_id))["client_type"].models.findOne({ guid: connection.client_type_id }).lean()
            if (clientType) {
                let tableSlug = "user"
                if (clientType) {
                    tableSlug = clientType.table_slug
                }
                const user = await (await ObjectBuilder(true, req.resource_environment_id))[tableSlug].models.findOne({ guid: req.user_id }).lean()
                if (user && user[connection.field_slug]) {
                    let params = {}
                    if (Array.isArray(user[connection.field_slug])) {
                        params["guid"] = { $in: user[connection.field_slug] }
                    } else {
                        params["guid"] = RegExp(user[connection.field_slug], "i")
                    }
                    options = await (await ObjectBuilder(true, req.resource_environment_id))[connection.table_slug].models.find(params, { "__v": 0, "_id": 0 }).lean()
                }
            }
        }
        return { table_slug: connection.table_slug || "", data: struct.encode({ response: options }) }
    }),
    updateUserPassword: catchWrapDbObjectBuilder(`${NAMESPACE}.updateUserPassword`, async (req) => {
        const mongoConn = await mongoPool.get(req.resource_environment_id)
        const clientType = await (await ObjectBuilder(true, req.resource_environment_id))["client_type"].models.findOne({ guid: req.client_type_id }).lean()
        if (clientType) {
            let tableSlug = "user"
            let field = "password"
            if (clientType.table_slug && clientType.table_slug !== "") {
                tableSlug = clientType.table_slug
            }
            let table = mongoConn.models["Table"].findOne({
                slug: tableSlug
            })
            if (table && table.is_login_table) {
                let tableAttributes = struct.decode(table.attributes)
                if (tableAttributes && tableAttributes.auth_info) {
                    if (tableAttributes.auth_info.password) {
                        field = tableAttributes.auth_info.password
                    }
                }
            }
            await (await ObjectBuilder(true, req.resource_environment_id))[tableSlug]?.models?.updateOne(
                {
                    guid: req.guid
                }, 
                {
                    $set: {
                        [field]: req.password
                    }
                }
            )
        }
    })
}

module.exports = loginStore;
