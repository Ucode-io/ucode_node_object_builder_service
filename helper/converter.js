const con = require("./constants");


function convertToClickhouseType (type) {
    if (con.STRING_TYPES.includes(type)) {
        return "String";
    } else if (con.NUMBER_TYPES.includes(type)) {
        return "Float64";
    } else if (con.BOOLEAN_TYPES.includes(type)) {
        return "Bool";
    } else if (con.MIXED_TYPES.includes(type)) {
        return "Array(String)";
    } else {
        return "String";
    }
}

module.exports = convertToClickhouseType;