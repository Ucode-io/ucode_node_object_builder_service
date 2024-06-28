module.exports = async function (mongoConn ,slug) {
    try {

        const RowOrderInfo = mongoConn.models["rowOrder"]

        const rowOrder = await RowOrderInfo.findOneAndUpdate(
            {table_slug: slug},
            {$inc: {value: 1}},
            {returnNewDocument: false}
        )

        return rowOrder
    } catch (err) {
        throw err
    }
}