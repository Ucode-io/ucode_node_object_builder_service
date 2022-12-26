
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { k8s_namespace, companyServiceHost, companyServicePort } = require("../../config");

console.log(companyServiceHost, companyServicePort)

const logger = require('../../config/logger')

const ProjectService = () => {
    const PROTO_PATH = __dirname + '/../../protos/company_service/projects_service.proto';
    
    const packageDefinition = protoLoader.loadSync(
        PROTO_PATH,
        {
         keepCase: true,
         longs: String,
         enums: String,
         defaults: true,
         oneofs: true
        });
        
    const project_service = grpc.loadPackageDefinition(packageDefinition).company_service;
    return new project_service.ProjectService(`${companyServiceHost}${companyServicePort}`, grpc.credentials.createInsecure());
};

const autoConn = async (k8s_namespace) => {
    return new Promise((resolve, reject) => {
        ProjectService().AutoConnect({k8s_namespace: k8s_namespace}, (err, res) => {
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

module.exports = {autoConn};