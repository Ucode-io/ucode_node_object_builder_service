const Minio = require('minio')

const endpoint = 'dev-cdn-api.ucode.run';
const accessKey = 'Mouch0aij8hui2Aivie7Weethoobee3o';
const secretKey = 'eezei5eaJah7mohNgohxo1Eb3wiex1sh';

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
