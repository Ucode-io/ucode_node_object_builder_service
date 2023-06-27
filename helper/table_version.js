module.exports = async function (mongoConn, payload = {}, version_id = "", row = true, offset = 0, limit = 1000) {
    try {
        const Table = mongoConn.models['Table']
        const TableVersion = mongoConn.models['Table.version']

        let resp = []
        if (version_id) {
            payload.version_id = version_id
            resp = await TableVersion.find(payload, {}, { sort: { created_at: -1 } }).skip(offset).limit(limit).populate({
                path: "record_permissions",
                match: {
                    role_id: payload.role_id
                }
            });
        } else {
            resp = await Table.find(payload, {}, { sort: { created_at: -1 } }).skip(offset).limit(limit).populate({
                path: "record_permissions",
                match: {
                    role_id: payload.role_id
                }
            });
        }

        if (row) {
            return resp[0]
        }

        return resp
    } catch (err) {
        throw err
    }
}