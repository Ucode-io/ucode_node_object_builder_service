const ObjectBuilder = require("../../models/object_builder");
const catchWrapDbObjectBuilder = require("../../helper/catchWrapDbObjectBuilder")
const mongoPool = require("../../pkg/pool");
const { struct } = require("pb-util");

let NAMESPACE = "storage.login";

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
        let params = {}
        params["email"] = req.email
        userTable = (await ObjectBuilder(true, req.project_id))["user"]

        user = await userTable.models.findOne(
            {
                $and: [params]
            }
        )
        if (user) {

            const roleTable = (await ObjectBuilder(true, req.project_id))["role"]

            role = await roleTable.models.findOne(
                {
                    client_type_id: clientType?.guid,
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
                    client_type_id: clientType?.guid
                }
            )

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
        const allTables = (await ObjectBuilder(true, req.resource_environment_id))
        const clientTypeTable = allTables["client_type"]
        const globalPermission = allTables["global_permission"]
        if (req.user_id === "") {
            return { user_found: false }
        }
        const clientType = await clientTypeTable.models.findOne(
            {
                $or: [
                    { guid: req.client_type },
                    { name: req.client_type }
                ]
            }
        ).lean()

        let params = {
            $and: [
                {
                    $or: [
                        { guid: req.user_id },
                        { user_id_auth: req.user_id }
                    ]
                },
                { client_type_id: req.client_type },
                {
                    $or: [
                        { deleted_at: new Date("1970-01-01T18:00:00.000+00:00") },
                        { deleted_at: null }
                    ]
                }
            ]
        };

        let tableSlug = "user"
        if (clientType && clientType.table_slug) { tableSlug = clientType.table_slug }

        const userTable = allTables[tableSlug]
        let user = await userTable.models.findOne(params).lean()
        let user_found = false

        if (!user) { return { user_found: user_found } }

        const roleTable = allTables["role"]

        const role = await roleTable.models.findOne(
            {
                guid: user.role_id,
            }
        ).lean()

        if (!role) { return { user_found: false } }

        const clientPlatfromTable = allTables["client_platform"]

        const clientPlatform = await clientPlatfromTable.models.findOne(
            { guid: role.client_platform_id }
        ).lean()

        const connectionsTable = allTables["connections"]

        const connections = await connectionsTable.models.find(
            { client_type_id: clientType.guid }
        ).lean()

        let clientTypeResp = {}
        clientTypeResp = clientType
        clientTypeResp.tables = connections

        const recordPermission = allTables["record_permission"]

        const permissions = await recordPermission.models.find(
            { role_id: role.guid }
        ).lean()

        let userId;
        if (user) {
            user_found = true
            userId = user.user_id_auth
            if (!userId || userId.length === 0) { userId = user.guid; }

            if (tableSlug === "user") { userId = user.guid }
        }
        
        const global_permission = await globalPermission?.models.findOne({ role_id: user.role_id }) || {}

        let response = {
            user_found: user_found,
            client_platform: clientPlatform,
            client_type: clientTypeResp,
            user_id: user.guid,
            role: role,
            permissions: permissions,
            global_permission: global_permission,
            login_table_slug: tableSlug,
            user_data: struct.encode(user),
            user_id_auth: userId
        }

        return response
    }),
    loginDataByUserId: catchWrapDbObjectBuilder(`${NAMESPACE}.loginDataByUserId`, async (req) => {

        const userTable = (await ObjectBuilder(true, req.resource_environment_id))["user"]
        let user = await userTable.models.findOne(
            {
                guid: req.user_id,
                project_id: req.project_id
            }
        ).lean()

        let user_found = false

        if (!user) {
            return {
                user_found: user_found
            }
        }
        const clientTypeTable = (await ObjectBuilder(true, req.resource_environment_id))["client_type"]

        const clientType = await clientTypeTable.models.findOne(
            {
                guid: user.client_type_id
            }
        ).lean()

        const roleTable = (await ObjectBuilder(true, req.resource_environment_id))["role"]

        const role = await roleTable.models.findOne(
            {
                guid: user.role_id
            }
        ).lean()
        const clientPlatfromTable = (await ObjectBuilder(true, req.resource_environment_id))["client_platform"]

        const clientPlatform = await clientPlatfromTable.models.findOne(
            {
                guid: role?.client_platform_id
            }
        ).lean()

        const connectionsTable = (await ObjectBuilder(true, req.resource_environment_id))["connections"]

        const connections = await connectionsTable.models.find(
            {
                client_type_id: clientType?.guid
            }
        ).lean()

        let clientTypeResp = {}
        clientTypeResp = clientType
        clientTypeResp.tables = connections

        const recordPermission = (await ObjectBuilder(true, req.resource_environment_id))["record_permission"]

        const permissions = await recordPermission.models.find(
            {
                role_id: user.role_id,
            }
        ).lean()

        let userId;
        if (user) {
            user_found = true
            userId = user.guid
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

        return response
    }),
    getConnetionOptions: catchWrapDbObjectBuilder(`${NAMESPACE}.getConnetionOptions`, async (req) => {
        let options = []
        const connection = await (await ObjectBuilder(true, req.resource_environment_id))["connections"]?.models?.findOne({ guid: req.connection_id }).lean()
        if (connection && connection.table_slug && connection.field_slug) {
            const clientType = await (await ObjectBuilder(true, req.resource_environment_id))["client_type"]?.models?.findOne({ guid: connection.client_type_id }).lean()
            if (clientType) {
                let tableSlug = "user"
                if (clientType.table_slug) {
                    tableSlug = clientType.table_slug
                }
                const user = await (await ObjectBuilder(true, req.resource_environment_id))[tableSlug]?.models?.findOne({
                    $or: [
                        { guid: req.user_id },
                        { user_id_auth: req.user_id }
                    ]
                }).lean();
                if ((user && user[connection.field_slug]) || user && user['guid']) {
                    let params = {}
                    if (Array.isArray(user[connection.field_slug])) {
                        params["guid"] = { $in: user[connection.field_slug] }
                    } else {
                        params["guid"] = RegExp(user[connection.table_slug +  "_id"], "i")
                    }
                    options = await (await ObjectBuilder(true, req.resource_environment_id))[connection?.table_slug]?.models?.find(params, { "__v": 0, "_id": 0 }).lean()
                }
            }
        }
        return { table_slug: connection?.table_slug || "", data: struct.encode({ response: options }) }
    }),
    updateUserPassword: catchWrapDbObjectBuilder(`${NAMESPACE}.updateUserPassword`, async (req) => {
        const mongoConn = await mongoPool.get(req.resource_environment_id)
        const clientType = await (await ObjectBuilder(true, req.resource_environment_id))["client_type"].models.findOne(
            { guid: req.client_type_id })
        .lean()
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
            const updatedUser = await (await ObjectBuilder(true, req.resource_environment_id))[tableSlug]?.models?.findOneAndUpdate(
                {
                    guid: req.guid
                }, 
                {
                    $set: {
                        [field]: req.password
                    }
                }
            )

            let response = {
                user_id_auth: updatedUser?.user_id_auth,
                user_id: updatedUser?.guid
            }

            return response
        }
    })
}

module.exports = loginStore;
