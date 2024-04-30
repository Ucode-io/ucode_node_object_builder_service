const constants = require('./constants')

module.exports = async function (data) {
    try {
        const Menu = data.mongoDBConn.models['object_builder_service.menu']
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

      console.log("is_static field is added to menu")
    } catch(error) {
        console.log("Error in is_static.js", error)
    }
}