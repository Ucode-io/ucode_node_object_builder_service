const con = require("./constants");


function convertToClickhouseType(type) {
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

function updatePaidStatus(order, options) {
    const paidStatus = order.paid_status[0];
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === paidStatus) {
          order.paid_status = [options[i].label];
          labelFound = true;
          break;
        }
      }
    console.log("return >>> ");
    return order
  }

module.exports = {convertToClickhouseType, updatePaidStatus}