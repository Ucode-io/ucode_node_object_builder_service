const constants = require('./constants')
const createTemplate = require("../initial_setups/template");

module.exports = async function (data) {
    try {
        const Menu = data.mongoDBConn.models['object_builder_service.menu']
        // const Role = data.mongoDBConn.models['role']
        // const FieldPermission = data.mongoDBConn.models['field_permission']
        console.log("is_static field is being added to menu")
        Menu.updateMany(
            { id: { $in: constants.STATIC_MENU_IDS } },
            { $set: { is_static: true } },
            (err, result) => {
              if (err) {
                console.error('Error:', err);
                return;
              }
          
            }
          );
        console.log("is_static field is added to menu")

        Menu.deleteOne(
          { id: 'db4ffda3-7696-4f56-9f1f-be128d82ae68' },
          (err, result) => {
              if (err) {
                  console.error('Error:', err);
                  return;
              }
              console.log('Menu deleted successfully');
          }
      );


      // let role = await Role?.findOne({ name: "DEFAULT ADMIN" })
      // let bulkWriteFieldPermissions = []
      //   let templates = await createTemplate(role.guid)
      //   templates.forEach(el => {
      //       bulkWriteFieldPermissions.push({
      //           updateOne: {
      //               filter: {
      //                   guid: el.guid,
      //                   role_id: role.guid
      //               },
      //               update: el,
      //               upsert: true
      //           }
      //       })
      //   })

      // bulkWriteFieldPermissions.length && await FieldPermission.bulkWrite(bulkWriteFieldPermissions)

      console.log("is_static field is added to menu")
    } catch(error) {
        console.log("Error in is_static.js", error)
    }
}