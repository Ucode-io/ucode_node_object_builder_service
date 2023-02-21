const catchWrapDb = require("../../helper/catchWrapDb");
const generateBarcode = require("../../helper/generator");
const ObjectBuilder = require("../../models/object_builder");
const Field = require("../../models/field");
const { struct } = require("pb-util");
const generator = require("../../helper/generator");



let NAMESPACE = "storage.barcode"

let barcodeStore = {
    generateBarcode: catchWrapDb(`${NAMESPACE}.generateBarcode`, async (data) => {
        let barcode = generateBarcode()
        const tableInfo = (await ObjectBuilder(true, data.project_id))[data.table_slug]
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

    }),
    generateCodebar: catchWrapDb(`${NAMESPACE}.generateCodebar`, async (data) => {
        const field = await Field.findOne({
            id: data.field_id
        })
        if (field && field.attributes) {
            const attributes = struct.decode(field.attributes)
            if (attributes) {
                if (attributes.prefix && attributes.digit_number) {
                    let randomNumber = generator.generateRandomNumber(attributes.prefix, attributes.digit_number)
                    const tableInfo = (await ObjectBuilder(true, data.project_id))[data.table_slug]
                    const isExist = await tableInfo.models.findOne({
                        [field.slug]: randomNumber
                    })

                    if (isExist) {
                        return await barcodeStore.generateCodebar(data)
                    } else {
                        return { number: barcode }
                    }
                }
            }
        }
    })
}

module.exports = barcodeStore
// just comment