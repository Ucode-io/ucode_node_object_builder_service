module.exports = async function (data) {
    try {
        const Menu = data.mongoDBConn.models['record_permission'];

        console.log("Updating add_field and pdf_action fields based on the presence of language_btn");

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

        Menu.updateMany(
            { language_btn: { $exists: false } },
            { $unset: { add_field: '', pdf_action: '' } },
            (err, result) => {
                if (err) {
                    console.error('Error:', err);
                    return;
                }

                console.log(`${result.modifiedCount} documents updated successfully.`);
            }
        );

        
    } catch (error) {
        console.log("Error in yourFileName.js", error);
    }
};
