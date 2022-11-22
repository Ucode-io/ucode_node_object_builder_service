const config = {
    environment: getConf("NODE_ENV", "dev"),
    mongoHost: getConf("MONGO_HOST", "161.35.26.178"),
    mongoPort: getConf("MONGO_PORT", "27017"),
    mongoUser: getConf("MONGO_USER", "object_builder_service"),
    mongoPassword: getConf("MONGO_PASSWORD", "eeNgoot2"),
    mongoDatabase: getConf("MONGO_DATABASE", "object_builder_service"),
    RPCPort: getConf("RPC_PORT", 9102),
    kafkaHost: getConf("KAFKA_HOST", "localhost"),
    kafkaPort: getConf("KAFKA_PORT", "9092"),
    kafkaClientId: getConf("KAFKA_CLIENT_ID", ""),
    limit: getConf("DEFAULT_LIMIT", 10),
    page: getConf("DEFAULT_PAGE", 1),
    minioAccessKeyID: getConf("MINIO_ACCESS_KEY", "JqEZQP7w5XJSy2K6ZQh5VJbLWZWbcESZcVkNbakGw977FCwa"),
    minioSecretAccessKey: getConf("MINIO_SECRET_KEY", "bYTX8fnBKGLhvpvQfsp63MXkBHCuEp8gScf4wUfnGANUwHxZ"),
    minioEndpoint: getConf("MINIO_ENDPOINT", "test.cdn.medion.uz"),
    minioPort: getConf("MINIO_PORT", 9001),
    minioSSL: getConf("MINIO_SSL", true)
};

function getConf(name, def = "") {
    if (process.env[name]) {
        return process.env[name];
    }
    return def;
}

module.exports = config;


