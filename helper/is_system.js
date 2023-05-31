

module.exports = async function (mongoConn) {
    // user table system field ids
    console.log("Field table is_system true checking...");
    let field_ids = ["2a77fd05-5278-4188-ba34-a7b8d13e2e51", "be11f4ac-1f91-4e04-872d-31cef96954e9", "5ca9db39-f165-4877-a191-57b5e8fedaf5", "bd5f353e-52d6-4b07-946c-678534a624ec"]

    const Field = mongoConn.models['Field']

    const fields = await Field.find({id: {$in: field_ids}})
    for(let field of fields) {
        if(!field.is_system) {
            field.is_system = true
            await field.save()
        }
    }
    console.log("Field table is_system true done");
}