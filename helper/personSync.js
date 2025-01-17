const { struct } = require('pb-util');
const grpcClient = require("../services/grpc/client");


const persontTableTools = {
    createSync: async(mongoConn, allTableInfos, data, project_id) => {
        try {
            let loginTableSlug = "user"
            const clientTypeResponse = await allTableInfos["client_type"]?.models?.findOne( { guid: data["client_type_id"] } )
            loginTableSlug = clientTypeResponse?.table_slug
    
            const tableCollection = mongoConn.models["Table"]
            const tableResponse = await tableCollection.findOne( { slug: loginTableSlug } )
            const tableAttributes = struct.decode(tableResponse?.attributes)
    
    
            if (tableResponse && tableAttributes && tableAttributes.auth_info){
                let authInfo = tableAttributes.auth_info
                if (!data['client_type_id'] || !data['role_id'] || !(data['login'] || data['email'] || data['phone_number'])) {
                    throw new Error('This table is auth table. Auth information not fully given')
                }
    
                let loginStrategy = ['login', 'email', 'phone']
                if (authInfo['login_strategy'] && authInfo['login_strategy'].length) {
                    loginStrategy = authInfo['login_strategy']
                }
    
                const loginTableRequest = { 
                    guid:           data.guid,
                    client_type_id: data['client_type_id'],
                    role_id:        data['role_id'],
                }

                loginTableRequest[authInfo['login']] = data["login"]
                loginTableRequest[authInfo['email']] = data["email"]
                loginTableRequest[authInfo['phone']] = data['phone_number']
                loginTableRequest[authInfo['password']] = data['password']
    
                const authCheckRequest = {
                    client_type_id: data['client_type_id'],
                    role_id: data['role_id'],
                    login: data["login"],
                    password: data['password'],
                    email: String((data["email"] || "")).toLowerCase(),
                    phone: data['phone_number'],
                    project_id: data['company_service_project_id'],
                    company_id: data['company_service_company_id'],
                    resource_environment_id: project_id,
                    invite: data['invite'],
                    environment_id: data["company_service_environment_id"],
                    login_strategy: loginStrategy
                }

                const authRes = await grpcClient.createUserAuth(authCheckRequest)
                
                await allTableInfos['person']?.models?.updateOne(
                    { guid: data.guid },
                    { $set: { user_id_auth: authRes.user_id } }
                )

                loginTableRequest.user_id_auth = authRes.user_id

                await allTableInfos[loginTableSlug]?.models.create(loginTableRequest)
            }
        } catch(err) { throw err }
    },
    updateSync: async(mongoConn, allTableInfos, data, env_id, project_id, response) => {
        try {
            let loginTableSlug = "user"
            const clientTypeResponse = await allTableInfos["client_type"]?.models?.findOne( { guid: data["client_type_id"] } )
            loginTableSlug = clientTypeResponse?.table_slug
    
            const tableCollection = mongoConn.models["Table"]
            const tableResponse = await tableCollection.findOne( { slug: loginTableSlug } )
            const tableAttributes = struct.decode(tableResponse?.attributes)

            if (tableResponse && tableAttributes && tableAttributes.auth_info){
                let authInfo = tableAttributes.auth_info
                if (!data['client_type_id'] || !data['role_id'] || !(data['login'] || data['email'] || data['phone_number'])) {
                    throw new Error('This table is auth table. Auth information not fully given')
                }

                if (authInfo['password'] && data['password'] !== ""){
                    if (String(data['password']).length !== 60) {
                        const updateUserRequest = {
                            env_id:         env_id,
                            phone:          data['phone_number'],
                            login:          data['login'],
                            email:          data['email'],
                            guid:           response['user_id_auth'],
                            project_id:     project_id,
                            role_id:        response['role_id'],
                            client_type_id: response['client_type_id'],
                        };
    
                        const loginTableRequest = {
                            guid:           data.guid,
                            client_type_id: response['client_type_id'],
                            role_id:        response['role_id'],
                            user_id_auth:   ""
                        }
    
                        loginTableRequest[authInfo['login']] = data["login"]
                        loginTableRequest[authInfo['email']] = data["email"]
                        loginTableRequest[authInfo['phone']] = data['phone_number']
        
                        
                        if (data['phone_number'] && data['phone_number'] !== response['phone_number']) {
                            updateUserRequest['is_changed_phone'] = true
                        }
    
                        if (data['login'] && data['login'] !== response['login']) {
                            updateUserRequest['is_changed_login'] = true
                        }
    
                        if (data['email'] && data['email'] !== response['email']) {
                            updateUserRequest['is_changed_email'] = true
                        }
    
                        if (data['password'] && data['password'] !== response['password']) {
                            updateUserRequest['password'] = data['password']
                            loginTableRequest[authInfo['password']] = data['password']
                        }
    
                        const authRes = await grpcClient.updateUserAuth(updateUserRequest);
                        loginTableRequest.user_id_auth = authRes.user_id
    
                        await allTableInfos[loginTableSlug]?.models.findOneAndUpdate( { guid: loginTableRequest.guid }, { $set: loginTableRequest } )
                    } else {
                        const updateUserRequest = {
                            env_id:         env_id,
                            phone:          data['phone_number'],
                            login:          data['login'],
                            email:          data['email'],
                            guid:           response['user_id_auth'],
                            project_id:     project_id,
                            role_id:        response['role_id'],
                            client_type_id: response['client_type_id'],
                        };
    
                        const loginTableRequest = {
                            guid:           data.guid,
                            client_type_id: response['client_type_id'],
                            role_id:        response['role_id'],
                            user_id_auth:   ""
                        }
    
                        if (data['phone_number'] && data['phone_number'] !== response['phone_number']) {
                            updateUserRequest['is_changed_phone'] = true
                            loginTableRequest[authInfo['phone']] = data['phone_number']
                        }
    
                        if (data['login'] && data['login'] !== response['login']) {
                            updateUserRequest['is_changed_login'] = true
                            loginTableRequest[authInfo['login']] = data["login"]
                        }
    
                        if (data['email'] && data['email'] !== response['email']) {
                            updateUserRequest['is_changed_email'] = true
                            loginTableRequest[authInfo['email']] = data["email"]
                        }
                        
    
                        const authRes = await grpcClient.updateUserAuth(updateUserRequest);
                        loginTableRequest.user_id_auth = authRes.user_id
    
                        await allTableInfos[loginTableSlug]?.models.findOneAndUpdate( { guid: loginTableRequest.guid }, { $set: loginTableRequest } )
                    }
                }else if (authInfo['phone'] && data['phone_number']){
                    const updateUserRequest = {
                        env_id:         env_id,
                        phone:          data['phone_number'],
                        login:          data['login'],
                        email:          data['email'],
                        guid:           response['user_id_auth'],
                        project_id:     project_id,
                        role_id:        response['role_id'],
                        client_type_id: response['client_type_id'],
                    };

                    const loginTableRequest = {
                        guid:           data.guid,
                        client_type_id: response['client_type_id'],
                        role_id:        response['role_id'],
                        user_id_auth:   ""
                    }

                    if (data['phone_number'] && data['phone_number'] !== response['phone_number']) {
                        updateUserRequest['is_changed_phone'] = true
                        loginTableRequest[authInfo['phone']] = data['phone_number']
                    }

                    const authRes = await grpcClient.updateUserAuth(updateUserRequest);
                    loginTableRequest.user_id_auth = authRes.user_id

                    await allTableInfos[loginTableSlug]?.models.findOneAndUpdate( { guid: loginTableRequest.guid }, { $set: loginTableRequest } )
                }
            }
        } catch(err) { throw err }
    },
    deleteSync: async(mongoConn, allTableInfos, data, response) => {
        try {
            let loginTableSlug = "user"
            const clientTypeResponse = await allTableInfos["client_type"]?.models?.findOne( { guid: response["client_type_id"] } )
            loginTableSlug = clientTypeResponse?.table_slug
            
            const tableCollection = mongoConn.models["Table"]
            const tableResponse = await tableCollection.findOne( { slug: loginTableSlug } )
            const tableAttributes = struct.decode(tableResponse?.attributes)

            if (tableResponse && tableAttributes && tableAttributes.auth_info){
                if (!response['client_type_id'] || !response['role_id']) {
                    throw new Error('This table is auth table. Auth information not fully given')
                }
    
                const authDeleteUserRequest = {
                    client_type_id: response['client_type_id'],
                    role_id: response['role_id'],
                    project_id: data['company_service_project_id'],
                    user_id: response['user_id_auth'],
                    environment_id: data['company_service_environment_id']
                }
    
                try {
                    await grpcClient.deleteUserAuth(authDeleteUserRequest);
                } catch (grpcError) {
                    throw new Error('Failed to delete user authorization: ' + grpcError.message);
                }
    
                if (!tableResponse.soft_delete){
                    await allTableInfos[loginTableSlug].models.findOneAndDelete( { guid: data.id } )
                }else if (tableResponse.soft_delete){
                    await allTableInfos[loginTableSlug].models.findOneAndUpdate( { guid: data.id }, { $set: { deleted_at: new Date() } })
                }
    
            }
        } catch(err) { throw err }
    },
    multipleDeleteSync: async(mongoConn, allTableInfos, data, response) => {
        let readyForAuth = [];
        let tableSlugs = {};

        for (const obj of response){
            let loginTableSlug = 'user'
            if (!obj["client_type_id"] || !obj['role_id']){
                continue
            }
            
            const clientTypeResponse = await allTableInfos['client_type']?.models.findOne({
                guid: obj['client_type_id'],
            })
            loginTableSlug = clientTypeResponse?.table_slug

            const tableCollection = mongoConn.models["Table"]
            const tableResponse = await tableCollection.findOne( { slug: loginTableSlug } )
            const tableAttributes = struct.decode(tableResponse?.attributes)

            if (tableResponse && tableAttributes && tableAttributes.auth_info){
                const authInfo = tableAttributes.auth_info
                if (!tableSlugs[loginTableSlug]){
                    tableSlugs[loginTableSlug] = tableResponse?.soft_delete
                }

                if (authInfo){
                    readyForAuth.push({
                        client_type_id: obj['client_type_id'],
                        role_id: obj['role_id'],
                        user_id: obj['user_id_auth']
                    })
                }
            }
        }

        if (response.length !== readyForAuth.length){
            throw new Error('This table is auth table. Auth information not fully given for delete many users')
        }

        await grpcClient.deleteUsersAuth({
            users: readyForAuth,
            project_id: data['company_service_project_id'],
            environment_id: data['company_service_environment_id'],
        })

        for (const tableSlug in tableSlugs){
            if (!tableSlugs[tableSlug] && data.ids.length){
                await allTableInfos[tableSlug].models.deleteMany({ guid: { $in: data.ids } });
            } else if (tableSlugs[tableSlug] && data.ids.length){
                await allTableInfos[tableSlug].models.updateMany({ guid: { $in: data.ids } }, { $set: { deleted_at: new Date() } })
            }
        }

    }
}


module.exports = persontTableTools
