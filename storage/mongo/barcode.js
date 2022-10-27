const catchWrapDb = require("../../helper/catchWrapDb");
const generateBarcode = require("../../helper/generator");
const ObjectBuilder = require("../../models/object_builder");



let NAMESPACE = "storage.barcode"

let barcodeStore = {
    generateBarcode: catchWrapDb(`${NAMESPACE}.generateBarcode`, async (data) => {
        let barcode = generateBarcode()
        const tableInfo = (await ObjectBuilder())[data.table_slug]
        let barcodeFields = tableInfo.fields.filter(value => (value.type === "BARCODE"))

        for (const barcodeField of barcodeFields) {
            let fieldSlug = ""
            fieldSlug = barcodeField.slug
            let params = {}
            params[fieldSlug] = barcode.toString()
            const isExist = await tableInfo.models.findOne({
                $and: [params]
            })
            if (isExist) {
                return await barcodeStore.generateBarcode(data)
            } else {
                return { number: barcode }
            }
        }

    })
}

module.exports = barcodeStore
// just comment