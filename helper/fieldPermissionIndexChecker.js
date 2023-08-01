

module.exports = async function (mongoConn) {
    try {
        console.log("Field index checker working...")
        const FieldPermission = mongoConn.models['field_permission']

        const indexs = await FieldPermission?.collection?.getIndexes()

        if (!indexs['role_id_1_field_id_1']) {
            console.log(".>>>>")
            await FieldPermission?.collection?.createIndex({ role_id: 1, field_id: 1 })
        }
        console.log("Field index checker done")
    } catch (error) {
        console.log("Field index checker failed: " + error)
    }

}