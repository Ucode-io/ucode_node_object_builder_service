
async function createUser(userID, roleID, clientTypeID, clientPlatformID, projectID) {
    let userData = [{
        "phone": "(90) 150-10-69",
        "work_place": "<p>Udevs</p>",
        "active": 1,
        "passport_number": "111111",
        "expires_at": "2026-08-21T09:03:03.905Z",
        "name": "Admin",
        "photo_url": "https://cdn.medion.uz/medion/d9bd2cd6-ada1-452a-849f-32fbfa81dd1d_Medion.png",
        "verified": true,
        "email": "jeesbek@gmail.com",
        "passpost_serial": "AA",
        "salary": "2000000",
        "guid": userID,
        "role_id": roleID,
        "client_type_id": clientTypeID,
        "client_platform_id": clientPlatformID,
        "project_id": projectID,
        "createdAt": {
          "$date": "2022-08-25T09:03:28.869Z"
        },
        "updatedAt": {
          "$date": "2022-12-23T05:53:59.152Z"
        },
        "__v": 0,
        "surname": ""
      }]

      return userData
}

module.exports = createUser