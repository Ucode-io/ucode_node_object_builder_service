const { parse } = require('date-fns');


let updateISODateFunction = {
    updateISODate:  async (obj) => {
        try {

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    if (value instanceof Object) {
                        updateISODateFunction.updateISODate(value); // Recursive call for nested objects
                    } else if (typeof value === 'string' && isDateString(value)) {
                        // Replace ISODate string with BSON Date
                        obj[key] = new Date(value);
                    }
                }
            }

            return obj
        } catch(err) {
            throw err
        }
    }
}



//YYYY-MM-DD HH:MM:SS
function isDateString(value) {
    return !isNaN(parse('VALUE: ',value, 'yyyy-MM-dd HH:mm:ss', new Date()));
}

module.exports = updateISODateFunction