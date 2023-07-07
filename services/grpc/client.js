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
    console.log(companyServiceHost, companyServicePort)
    return new resource_service.ResourceService(`${companyServiceHost}${companyServicePort}`, grpc.credentials.createInsecure());
};

const SyncUserWithAuthService = () => {
    const PROTO_PATH = __dirname + '/../../protos/auth_service/sync_user_.proto';

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
    console.log(companyServiceHost, companyServicePort)
    return new sync_user_with_auth_service.SyncUserWithAuthService(`${authServiceHost}${authServicePort}`, grpc.credentials.createInsecure());
};

const syncUserWithAuth = async (data) => {
    return new Promise((resolve, reject) => {
        SyncUserWithAuthService().SyncUserWithAuth(data, (err, res) => {
            if (err) {
                logger.error("Error synchronize user with auth service", {
                    function: "syncUserWithAuth",
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

module.exports = { autoConn, syncUserWithAuth };