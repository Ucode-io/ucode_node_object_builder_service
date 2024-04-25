const mongoPool = require('../pkg/pool');
const config = require('../config/index')

async function checkRelationFieldExists(field_name, table_id, project_id, field_type) {
    if (!project_id) {
        console.warn('WARNING:: Using default project id in checkRelationFieldExists...')
    }
    const mongoConn = await mongoPool.get(project_id)
    const Table = mongoConn.models['Table']
    const Field = mongoConn.models['Field']

    const table = await Table.findOne({
        id: table_id
    })

    let filter  = new RegExp(`^${field_name}`)
    const relationFields = await Field.find(
        {
            table_id: table_id,
            slug: filter,
            type: field_type
            // slug: {$regex: field_name+"*"}
        },
        {
            createdAt: 0, 
            updatedAt: 0,
            created_at: 0, 
            updated_at: 0,
            _id: 0, 
            __v: 0
        },
        {
            sort: {slug: -1}
        }
    );
    let lastField = ""
    if (relationFields.length) {
        let i = 2;
            if (relationFields[0].slug === field_name) {
                lastField = field_name + "_" + i.toString();
            } else {
                let splittedSlug = relationFields[0].slug.split("_")
                let j = splittedSlug[splittedSlug.length - 1]
                idIndex = parseInt(j)
                idIndex++
                lastField = field_name + "_" + idIndex
            }
        if (lastField !== "") {
            return {exists: true, lastField: lastField}
        }
    }
    return {exists: false, lastField: ""}
};
//
module.exports = checkRelationFieldExists;
