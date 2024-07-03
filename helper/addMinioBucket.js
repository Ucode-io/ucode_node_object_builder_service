const Minio = require('minio')

const endpoint = 'dev-cdn.ucode.run';
const accessKey = 'Mouch0aij8hui2Aivie7Weethoobee3o';
const secretKey = 'eezei5eaJah7mohNgohxo1Eb3wiex1sh';

const minioClient = new Minio.Client({
    endPoint: endpoint,
    port: 9002,
    accessKey: accessKey,
    secretKey: secretKey,
    useSSL: false, 
})

async function createMinioBucket(bucketName) {
  minioClient.bucketExists(bucketName, function(err, exists) {
      if (err) {
        throw new Error(err)
      } else {
        if (exists) {
          console.log(`Bucket '${bucketName}' exists.`)
        } else {
          const policy = {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "AWS": "*" 
                },
                "Action": [
                  "s3:GetBucketLocation",
                  "s3:ListBucket",
                  "s3:GetObject"
                ],
                "Resource": [
                  `arn:aws:s3:::${bucketName}`,
                  `arn:aws:s3:::${bucketName}/*`
                ]
              }
            ]
          };

          minioClient.makeBucket(bucketName, '', function(err) {
            if (err) {
              throw new Error(err)
            }
          })

          minioClient.setBucketPolicy(bucketName, JSON.stringify(policy), (err) => {
            if (err) {
              console.log('Error setting bucket policy:', err);
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
          } else {
          }
        });
      } else {
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
        } else {
        }
      });
    })
    .on('end', () => {
      // The folder is empty, you can now remove the folder itself
      minioClient.removeObject(bucketName, folderName, (err) => {
        if (err) {
        } else {
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
