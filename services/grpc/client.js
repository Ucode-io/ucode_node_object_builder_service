const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { k8s_namespace, companyServiceHost, companyServicePort } = require("../../config");

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

const autoConn = async (k8s_namespace) => {
    return new Promise((resolve, reject) => {
        ResourceService().AutoConnect({k8s_namespace: k8s_namespace}, (err, res) => {
            if (err) {
                logger.error("Error while auto connecting", {
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

const reConn = async (k8s_namespace, project_id) => {
    return new Promise((resolve, reject) => {
        ResourceService().AutoConnectByProjectId({k8s_namespace: k8s_namespace, project_id: project_id}, (err, res) => {
            if (err) {
                logger.error("Error while auto connecting", {
                    function: "autoConn",
                    error: err
                });
                console.log("err: ", err)
                reject(err);
                return;
            }

            resolve(res);
        });
    })
}

module.exports = {autoConn, reConn};