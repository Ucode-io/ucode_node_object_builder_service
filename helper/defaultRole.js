const ObjectBuilder = require("./../models/object_builder");
const inittialClientType = require("../initial_setups/guessClientType")
const inittialRole = require("../initial_setups/defaultRole")
const { v4 } = require("uuid");

module.exports = async (mongoConn, projectId) => {
    try {
        const Role = mongoConn.models["role"]
        const ClientType = mongoConn.models["client_type"]
        const Table = mongoConn.models["Table"]
        const Field = mongoConn.models["Field"]
        const RecordPermission = mongoConn.models["record_permission"]
        const FieldPermission = mongoConn.models["field_permission"]

        // check guess client type
        let guessClientType = await ClientType?.findOne({guid: inittialClientType.guid})
        if(!guessClientType) {
            inittialClientType.project_id = projectId
            guessClientType = await ClientType?.create(inittialClientType)
        }

        // checl guess role
        let guessRole = await Role?.findOne({guid: inittialRole.guid})
        if(!guessRole) {
            inittialRole.project_id = projectId
            guessRole = await Role?.create(inittialRole)
        }

        // check guess role record permissions
        const tables = await Table?.find().lean()
        const mapTables = {}
        const table_slugs = tables?.map(el => {
            mapTables[el.slug] = el
            return el.slug
        })
        const existRecordPermissions = await RecordPermission?.find({table_slug: {$in: table_slugs}, role_id: guessRole.guid}).lean() || []
        const mapRecordPermissions = {}
        existRecordPermissions?.forEach(el => {
            mapRecordPermissions[el.table_slug] = el
        });
        for(let slug of table_slugs) {
            if(!mapRecordPermissions[slug]) {
                await RecordPermission.create({
                    guid: v4(),
                    table_slugs: slug,
                    write: "yes",
                    update: "yes",
                    read: "yes",
                    delete: "yes",
                    role_id: guessRole.guid,
                    is_public: false,
                    is_have_condition: true
                })
            }
        }

        // check guess role field permissions
        const  fields = await Field?.find().lean()
        let mapFields = {}
        const field_ids = fields.map(el => {
            mapFields[el.id] = el
            return el.id
        })
        const existFieldPermissions = await FieldPermission?.find({field_id: {$in: field_ids}, role_id: guessRole.guid}).lean() || []
        const mapFieldPermissions = {}
        existFieldPermissions.forEach(el => {
            mapFieldPermissions[el.field_id] = el
        });
        for(let id of field_ids) {
            if(!mapFieldPermissions[id] && mapFields[id]) {
                await FieldPermission?.create({
                    guid: v4(),
                    field_id: id,
                    table_slug: mapTables[mapFields[id]?.table_id],
                    role_id: guessRole.guid,
                    label: mapFields[id]?.label,
                    view_permission: true,
                    edit_permission: true
                })
            }
        }

    } catch (err) {
        throw Error(err)
    }
}