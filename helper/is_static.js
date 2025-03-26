const constants = require('./constants')

module.exports = async function (data) {
    try {
        const Menu = data.mongoDBConn.models['object_builder_service.menu']
        const ClientType = data.mongoDBConn.models["client_type"]
        const CustomPermission = data.mongoDBConn.models['global_permission']

        await CustomPermission.updateMany(
          {
            $or: [
              { gitbook_button: { $exists: false } },
              { chatwoot_button: { $exists: false } },
              { gpt_button: { $exists: false } }
            ]
          },
          {
            $set: {
              gitbook_button: true,
              chatwoot_button: true,
              gpt_button: true
            }
          },
          { strict: false }
        )     

        ClientType.updateMany(
          { session_limit: { $exists: false } },
          { $set: { session_limit: 50 } },
          (err, result) => {
            if (err) {
              return;
            }
          }
        )

        Menu.updateMany(
            { id: { $in: constants.STATIC_MENU_IDS } },
            { $set: { is_static: true } },
            (err, result) => {
              if (err) {
                return;
              }
          
            }
          );

        Menu.deleteOne(
          { id: 'db4ffda3-7696-4f56-9f1f-be128d82ae68' },
          (err, result) => {
              if (err) {
                  return;
              }
          }
      );

    } catch(error) {}
}