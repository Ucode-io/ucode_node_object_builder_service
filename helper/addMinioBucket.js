const Minio = require('minio')

const endpoint = 'dev-cdn-api.ucode.run';
const accessKey = 'Mouch0aij8hui2Aivie7Weethoobee3o';
const secretKey = 'eezei5eaJah7mohNgohxo1Eb3wiex1sh';

const minioClient = new Minio.Client({
    endPoint: endpoint,
    accessKey: accessKey,
    secretKey: secretKey,
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
  const fullFolderName = folderName + '/';
  minioClient.statObject(bucketName, fullFolderName, function (err, stat) {
    if (err) {
      if (err.code === 'NotFound') {
        minioClient.putObject(bucketName, fullFolderName, '', 0, function (createErr) {
          if (createErr) {
            console.error('Error creating folder:', createErr);
          } else {
            console.log('Folder created successfully!');
          }
        });
      } else {
        console.error('Error checking folder:', err);
      }
    } else {
      throw new Error("Folder already exists");;
    }
  });
}

async function deleteMinioFolder(bucketName, folderName) {
    minioClient.listObjects(bucketName, folderName, true)
    .on('data', (obj) => {
      // Delete each object
      minioClient.removeObject(bucketName, obj.name, (err) => {
        if (err) {
          console.error(`Error deleting object ${obj.name}: ${err}`);
        } else {
          console.log(`Deleted object: ${obj.name}`);
        }
      });
    })
    .on('end', () => {
      // The folder is empty, you can now remove the folder itself
      minioClient.removeObject(bucketName, folderName, (err) => {
        if (err) {
          console.error(`Error deleting folder ${folderName}: ${err}`);
        } else {
          console.log(`Deleted folder: ${folderName}`);
        }
      });
    });
}

// async function createFolderToBucket(bucketName, folderName) {
//   minioClient.putObject(bucketName, folderName+'/', '', 0, function(err) {
//     console.log("CREATING FOLDER")
//     if (err) {
//       throw new Error(err)
//     } else {
//       console.log('Folder created successfully!')
//     }
//   })
// }

module.exports = {createMinioBucket, createFolderToBucket, deleteMinioFolder}
