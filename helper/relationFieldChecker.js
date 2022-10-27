const Field = require("../models/field");
const Table = require("../models/table");


async function checkRelationFieldExists (field_name, table_id) {

    const table = await Table.findOne({
        id: table_id
    })
    const relationFields = await Field.find(
        {
            table_id: table_id,
            slug: {$regex: field_name+"*"}
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
            sort: {slug: 1}
        }
    );
    let lastField = ""
    if (relationFields.length) {
        let i = 2;
        for (const relationField of relationFields) {
            if (relationField.slug === field_name) {
                lastField = field_name + "_" + i.toString();
                let splitedFieldSlug = relationField.slug.split("_")
                if (splitedFieldSlug[splitedFieldSlug.length - 1] === i.toString()) {
                    i++;
                    lastField = field_name+"_" + i.toString()
                }
            }
        };
        if (lastField !== "") {
            return {exists: true, lastField: lastField}
        }
    }
    return {exists: false, lastField: ""}
};

module.exports = checkRelationFieldExists;