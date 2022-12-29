require('dotenv').config({ path: '/app/.env' });
const projectStorage = require('./storage/mongo/project')
const config = require('./config/index')
// const mongooseConnection = require("./config/mongooseConnection");
// const collectionDeleteInterval = require("./helper/collectionDeleteInterval");
const grpcConnection = require("./config/grpcConnection");
const kafka = require("./config/kafka");
const { struct } = require('pb-util');

(async function () {

    await projectStorage.reconnect({
        project_id: '39f1b0cc-8dc3-42df-b2bf-813310c007a4',
        credentials: {
            host: '161.35.26.178',
            port: 27017,
            database: 'transasia_transasia_object_builder_service',
            username: 'transasia_transasia_object_builder_service',
            password: '123JFWxq'
        },
    })



    // await projectStorage.autoConnect(
    //     {
    //         request: {
    //             k8s_namespace : config.k8s_namespace
    //         }
    //     },
    //     (code, result) => {
    //         console.log(code, result)
    //     }
    // )


    // let projectService = require('./services/project')

    // projectService.Register(
    //     {
    //         request: {
    //             user_id: 'a0bb1bdc-e5bd-4f9e-bc45-6f705851f29e',
    //             project_id: '39f1b0cc-8dc3-42df-b2bf-813310c007a4',
    //             credentials: {
    //                 host: '161.35.26.178',
    //                 port: 27017,
    //                 database: 'transasia_transasia_object_builder_service',
    //                 username: 'transasia_transasia_object_builder_service',
    //                 password: '123JFWxq'
    //             }
    //         }
    //     },
    //     ((err, res) => {
    //         if (err) {
    //             throw err
    //         }

    //         console.log(res)
    //     })
    // )

    // let permissionService = require('./services/permission');

    // let data;
    // await permissionService.GetListWithRoleAppTablePermissions(
    //     {
    //         request: {
    //             project_id: '39f1b0cc-8dc3-42df-b2bf-813310c007a4',
    //             role_id: 'd78a8c8e-4b8d-4bbe-9d11-92bb0c4fbd26'
    //         }
    //     },
    //     ((err, res) => {
    //         if (err) { throw err }
    //         data = res
    //         // console.log('-----', JSON.stringify(res, null, 2))
    //         console.log('get ok')
    //     })

    // )

    // await permissionService.UpdateRoleAppTablePermissions(
    //     {
    //         request: {
    //             ...data
    //         }
    //     },
    //     ((err, res) => {
    //         if (err) { throw err }

    //         console.log('+++++', JSON.stringify(res, null, 2))
    //     })
    // )

    // let builderService = require('./services/object_builder')

    // const params = struct.encode({
    //     limit: 10,
    //     offset: 0,
    //     // search: '',
    //     client_type_id_from_token: '',
    //     client_type_id: '',
    //     role_id_from_token: '',
    //     user_id_from_token: '', 
    //     tables: null
    // })

    // await builderService.GetList(
    //     {
    //         request: {
    //             table_slug: 'connections',
    //             project_id: '39f1b0cc-8dc3-42df-b2bf-813310c007a4',
    //             data: params
    //         }
    //     },
    //     ( (err, res) => {
    //         if (err) { throw err }

    //         const response = struct.decode(res)
    //         console.log('res--', JSON.stringify(res, null, 2))
    //     } )
    // )


    // let permissionService = require('./services/permission');

    // let data;
    // await permissionService.GetFieldPermissions(
    //     {
    //         request: {
    //             project_id: '39f1b0cc-8dc3-42df-b2bf-813310c007a4',
    //             role_id: '2d00bb3a-4b5f-47b8-9436-e4bceb096fda',
    //             table_slug: 'role'
    //         }
    //     },
    //     ((err, res) => {
    //         if (err) { throw err }
    //         data = res
    //         // console.log('-----', JSON.stringify(res, null, 2))
    //         console.log('get ok')
    //     })

    // )


})();
