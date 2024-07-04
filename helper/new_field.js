module.exports = async function (data) {
    try {
        const Menu = data.mongoDBConn.models['record_permission'];
        const Field = data.mongoDBConn.models['Field'];

        Menu.updateMany(
            { language_btn: { $exists: true } },
            { $set: { add_field: 'Yes', pdf_action: 'Yes', add_filter: 'Yes', header: 'Yes', field_filter: 'Yes' } },
            (err, result) => {
                if (err) {
                    return;
                }
            }
        );

        Menu.updateMany(
            { language_btn: { $exists: false } },
            { $unset: { add_field: '', pdf_action: '', add_filter: '', header: '', field_filter: '' } },
            (err, result) => {
                if (err) {
                    return;
                }

            }
        );

        Field.updateMany(
            {},
            { $set: { is_search: true } },
            (err, result) => {
                if (err) {
                    return;
                }
            }
        )

        
    } catch (error) {
    }
};
