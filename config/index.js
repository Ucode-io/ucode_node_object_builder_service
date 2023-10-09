const config = {
    environment: getConf("NODE_ENV", "aaa"),

    mongoHost: getConf("MONGO_HOST", "161.35.26.178"),
    mongoPort: getConf("MONGO_PORT", "27017"),
    mongoUser: getConf("MONGO_USER", "object_builder_service"),
    mongoPassword: getConf("MONGO_PASSWORD", "eeNgoot2"),
    mongoDatabase: getConf("MONGO_DATABASE", "object_builder_service"),

    RPCPort: getConf("RPC_PORT", 9102),

    kafkaHost: getConf("KAFKA_HOST", "localhost"),
    kafkaPort: getConf("KAFKA_PORT", "9092"),
    kafkaClientId: getConf("KAFKA_CLIENT_ID", "medion_node_object_builder_service"),

    limit: getConf("DEFAULT_LIMIT", 10),
    page: getConf("DEFAULT_PAGE", 1),

    minioAccessKeyID: getConf("MINIO_ACCESS_KEY", "minio-access-key"),
    minioSecretAccessKey: getConf("MINIO_SECRET_KEY", "minio-secret-key"),
    minioEndpoint: getConf("MINIO_ENDPOINT", "minio-endpoint"),
    minioPort: getConf("MINIO_PORT", 9001),
    minioSSL: getConf("MINIO_SSL", true),

    ucodeDefaultProjectID: "ucode_default_project_id",
    k8s_namespace: "cp-region-type-id",

    companyServiceHost: getConf("COMPANY_SERVICE_HOST", "localhost"),
    companyServicePort: getConf("COMPANY_GRPC_PORT", ":8092"),
    authServiceHost: getConf("AUTH_SERVICE_HOST", "localhost"),
    authServicePort: getConf("AUTH_GRPC_PORT", ":9103")
};

function getConf(name, def = "") {
    if (process.env[name]) {
        return process.env[name];
    }
    return def;
}

module.exports = config;


