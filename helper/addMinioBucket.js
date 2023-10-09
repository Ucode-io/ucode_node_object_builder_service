const Minio = require('minio')



const endpoint = 'cdn.api.milliontv.uz'
const accessKey = 'eiGeiCoy2puucheengooSaegie4IeRoo'
const secretKey = 'aedup2cook6Coos1Wo5eeGhoo6uoy3sh'

const minioClient = new Minio.Client({
    endPoint: endpoint,
    accessKey,
    secretKey,
    useSSL: true, 
})

function createMinioBucket(bucketName) {
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

function createFolderToBucket(bucketName, folderName) {
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