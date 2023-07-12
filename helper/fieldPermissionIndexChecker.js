

module.exports = async function (mongoConn) {
    const FieldPermission = mongoConn.models['field_permission']

    const indexs = await FieldPermission.collection.getIndexes()

    if(!indexs['role_id_1_field_id_1']) {
        console.log(".>>>>")
        await FieldPermission.collection.createIndex({ role_id: 1, field_id: 1 })
    }
}