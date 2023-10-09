const a = require('dotenv').config({ path: '../app/.env' });
const Minio = require('minio')
const cfg = require('../config/index')

console.log("dot env::", a);




const endpoint = cfg.minioEndpoint
const accessKey = cfg.minioAccessKeyID
const secretKey = cfg.minioSecretAccessKey

const minioClient = new Minio.Client({
    endPoint: endpoint,
    accessKey,
    secretKey,
    useSSL: true, 
})

async function createMinioBucket(bucketName) {
    minioClient.bucketExists(bucketName, function(err, exists) {
        if (err) {
          throw new Error(err)
        } else {
          if (exists) {
            console.log(`Bucket '${bucketName}' exists.`)
          } else {
            minioClient.makeBucket(bucketName, '', function(err) {
                if (err) {
                  throw new Error(err)
                }
                })
          }
        }
      })
}

async function createFolderToBucket(bucketName, folderName) {
  minioClient.putObject(bucketName, folderName+'/', '', 0, function(err) {
    console.log("CREATING FOLDER")
    if (err) {
      throw new Error(err)
    } else {
      console.log('Folder created successfully!')
    }
  })
}

module.exports = {createMinioBucket, createFolderToBucket}