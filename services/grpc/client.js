const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { k8s_namespace, companyServiceHost, companyServicePort, authServiceHost, authServicePort } = require("../../config");

const logger = require('../../config/logger')

const ResourceService = () => {
    const PROTO_PATH = __dirname + '/../../protos/company_service/resource_service.proto';

    const packageDefinition = protoLoader.loadSync(
        PROTO_PATH,
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

    const resource_service = grpc.loadPackageDefinition(packageDefinition).company_service;
    return new resource_service.ResourceService(`${companyServiceHost}${companyServicePort}`, grpc.credentials.createInsecure());
};

const SyncUserService = () => {
    const PROTO_PATH = __dirname + '/../../protos/auth_service/sync_user.proto';

    const packageDefinition = protoLoader.loadSync(
        PROTO_PATH,
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

    const sync_user_with_auth_service = grpc.loadPackageDefinition(packageDefinition).auth_service;
    return new sync_user_with_auth_service.SyncUserService(`${authServiceHost}${authServicePort}`, grpc.credentials.createInsecure());
};

const autoConn = async (k8s_namespace, node_type) => {
    return new Promise((resolve, reject) => {
        console.log("\n\n ~~~ NODE TYPE --> ", node_type);
        ResourceService().AutoConnect({ k8s_namespace: k8s_namespace, node_type: node_type }, (err, res) => {
            if (err) {
                logger.error("Error while auto connecting", {
                    function: "autoConn",
                    error: err
                });
                console.log("err: >> while company service", err)
                reject(err);
                return;
            }

            resolve(res);
        });
    });
};

const reConn = async (k8s_namespace, project_id, node_type) => {
    return new Promise((resolve, reject) => {
        ResourceService().AutoConnectByProjectId({ k8s_namespace: k8s_namespace, project_id: project_id, node_type }, (err, res) => {
            if (err) {
                logger.error("Error while auto connecting by project id", {
                    function: "autoConn",
                    error: err
                });
                console.log("err: ", err)
                reject(err);
                return;
            }

            resolve(res);
        });
    });
};

const createUserAuth = async (data) => {
    return new Promise((resolve, reject) => {
        SyncUserService().CreateUser(data, (err, res) => {
            if (err) {
                logger.error("Error synchronize user with auth service", {
                    function: "createUserAuth",
                    error: err
                });
                console.log("err: ", err)
                reject(err);
                return;
            }

            resolve(res);
        });
    });
};

const createUsersAuth = async (data) => {
    return new Promise((resolve, reject) => {
        SyncUserService().CreateUsers(data, (err, res) => {
            if (err) {
                logger.error("Error synchronize users with auth service", {
                    function: "createUsersAuth",
                    error: err
                });
                console.log("err: ", err)
                reject(err);
                return;
            }

            resolve(res);
        });
    });
};

const updateUserAuth = async (data) => {
    return new Promise((resolve, reject) => {
        SyncUserService().UpdateUser(data, (err, res) => {
            if (err) {
                logger.error("Error synchronize user with auth service", {
                    function: "updateUserAuth",
                    error: err
                });
                console.log("err: ", err)
                reject(err);
                return;
            }

            resolve(res);
        });
    });
};

const deleteUserAuth = async (data) => {
    return new Promise((resolve, reject) => {
        SyncUserService().DeleteUser(data, (err, res) => {
            if (err) {
                logger.error("Error synchronize user with auth service", {
                    function: "deleteUserAuth",
                    error: err
                });
                console.log("err: ", err)
                reject(err);
                return; 
            }

            resolve(res);
        });
    }); 
}; 

const deleteUsersAuth = async (data) => {
    return new Promise((resolve, reject) => {
        SyncUserService().DeleteManyUser(data, (err, res) => {
            if (err) {
                logger.error("Error synchronize users with auth service", {
                    function: "deleteUsersAuth",
                    error: err
                });
                console.log("err: ", err)
                reject(err);
                return;
            }

            resolve(res);
        });
    });
};
module.exports = { autoConn, createUsersAuth, createUserAuth, updateUserAuth, deleteUserAuth, reConn, deleteUsersAuth };
