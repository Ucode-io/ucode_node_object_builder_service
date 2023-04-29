module.exports = async function (mongoConn, payload = {}, version_id = "", row = true, offset = 0, limit = 1000) {
    try {   
        const Table = mongoConn.models['Table']
        const TableVersion = mongoConn.models['Table_version']

        let resp = []
        if(version_id) {
            payload.version_id = version_id
            resp = await TableVersion.find(payload, {}, {sort: { created_at: -1 }}).skip(offset).limit(limit);
        } else {
            resp = await Table.find(payload, {}, {sort: { created_at: -1 }}).skip(offset).limit(limit);
        }

        if(row) {
            return resp[0]
        } 

        return resp
    } catch (err) {
        throw err
    }
}