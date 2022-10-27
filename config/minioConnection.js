const Minio = require('minio');
const cfg = require('./index.js')


var minioClient = new Minio.Client({
    endPoint: "172.20.20.17",
    port: 9001,
    useSSL: false,
    accessKey: cfg.minioAccessKeyID,
    secretKey: cfg.minioSecretAccessKey
});

module.exports = minioClient
