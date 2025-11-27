module.exports = async function (data) {
    try {
        const Menu = data.mongoDBConn.models['record_permission'];
        const Field = data.mongoDBConn.models['Field'];

        Menu.updateMany(
            { language_btn: { $exists: false } },
            { $unset: { add_field: '', pdf_action: '', add_filter: '', field_filter: '', fix_column: '', tab_group: '', columns: '', group: '', excel_menu: '', search_button: '' } },
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
