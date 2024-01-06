module.exports = async function (data) {
    try {
        const Menu = data.mongoDBConn.models['record_permission'];

        console.log("Adding add_field and pdf_action fields to menu with langauge_btn");

        Menu.updateMany(
            { language_btn: { $exists: true } },
            { $set: { add_field: 'Yes', pdf_action: 'Yes' } },
            (err, result) => {
                if (err) {
                    console.error('Error:', err);
                    return;
                }

                console.log(`${result.modifiedCount} documents updated successfully.`);
            }
        );

        console.log("add_field and pdf_action fields added to menu with langauge_btn");
    } catch (error) {
        console.log("Error in yourFileName.js", error);
    }
};