const config = {
    environment: getConf("NODE_ENV", "dev"),

    mongoHost: getConf("MONGO_HOST", ""),
    mongoPort: getConf("MONGO_PORT", ""),
    mongoUser: getConf("MONGO_USER", ""),
    mongoPassword: getConf("MONGO_PASSWORD", ""),
    mongoDatabase: getConf("MONGO_DATABASE", ""),

    RPCPort: getConf("RPC_PORT", 9102),

    kafkaHost: getConf("KAFKA_HOST", ""),
    kafkaPort: getConf("KAFKA_PORT", ""),
    kafkaClientId: getConf("KAFKA_CLIENT_ID", ""),

    limit: getConf("DEFAULT_LIMIT", 10),
    page: getConf("DEFAULT_PAGE", 1),

    minioAccessKeyID: getConf("MINIO_ACCESS_KEY", ""),
    minioSecretAccessKey: getConf("MINIO_SECRET_KEY", ""),
    minioEndpoint: getConf("MINIO_ENDPOINT", ""),
    minioPort: getConf("MINIO_PORT", 0),
    minioSSL: getConf("MINIO_SSL", true),

    ucodeDefaultProjectID: "ucode_default_project_id",
    k8s_namespace: "cp-region-type-id",

    companyServiceHost: getConf("COMPANY_SERVICE_HOST", ""),
    companyServicePort: getConf("COMPANY_GRPC_PORT", ""),
    authServiceHost: getConf("AUTH_SERVICE_HOST", ""),
    authServicePort: getConf("AUTH_GRPC_PORT", ""),

    nodeType: getConf("NODE_TYPE", "LOW")
};

function getConf(name, def = "") {
    if (process.env[name]) {
        return process.env[name];
    }
    return def;
}

module.exports = config;


