var {addMonths, addDays, addYears} = require('date-fns')



async function rangeDate(startDate, endDate, interval) {
    let lastPart = endDate.substring(10,19) + ".999Z"
    let fromDate = new Date(startDate)
    let toDate = new Date(endDate)
    if (fromDate.getTime() > toDate.getTime()) {
        throw new Error("Дата начала должна быть больше даты окончания")
    }
    let dates = []
    while (fromDate.getTime() < toDate.getTime()) {
        let dateObject = {
            "$gte": fromDate.toISOString(),
            "$lte": ""
        }
        try {
            switch (interval) {
                case "year":
                    fromDate = addYears(fromDate, 1)
                    break;
                case "week": 
                    fromDate = addDays(fromDate, 7)
                    break;
                case "day":
                    fromDate = addDays(fromDate, 1)  
                    break;
                default:
                    fromDate = addMonths(fromDate, 1)
                    break;
            }
            dateObject.$lte = fromDate.toISOString().substring(0,10) + lastPart
            dates.push(dateObject)
        } catch (error) {
        }
    }
    return dates
}

module.exports = rangeDate