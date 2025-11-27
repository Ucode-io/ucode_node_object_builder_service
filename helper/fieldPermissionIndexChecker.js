module.exports = async function (mongoConn) {
    try {
        const FieldPermission = mongoConn.models['field_permission']

        const indexs = await FieldPermission?.collection?.getIndexes()

        if (!indexs['role_id_1_field_id_1']) {
            await FieldPermission?.collection?.createIndex({ role_id: 1, field_id: 1 })
        }
    } catch (error) {
    }

}