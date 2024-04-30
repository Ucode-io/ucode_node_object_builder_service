const catchWrapDb = require("../../helper/catchWrapDb");
const generateBarcode = require("../../helper/generator");
const ObjectBuilder = require("../../models/object_builder");
const { struct } = require("pb-util");
const generator = require("../../helper/generator");
const mongoPool = require('../../pkg/pool');



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
        const mongoConn = await mongoPool.get(data.project_id)
        const Field = mongoConn.models['Field']
        const field = await Field.findOne({
            id: data.field_id
        })
        if (field && field.attributes) {
            const attributes = struct.decode(field.attributes)
            if (attributes) {
                if (attributes.prefix && attributes.digit_number) {
                    let randomNumber = generator.generateRandomNumberWithOutDash(attributes.prefix, attributes.digit_number)
                    const tableInfo = (await ObjectBuilder(true, data.project_id))[data.table_slug]
                    const isExist = await tableInfo.models.findOne({
                        [field.slug]: randomNumber
                    })

                    if (isExist) {
                        return await barcodeStore.generateCodebar(data)
                    } else {
                        return { code: randomNumber }
                    }
                }
            }
        }
    }),
    generateDynamicBarcode: catchWrapDb(`${NAMESPACE}.generateCodebar`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const tableInfo = (await ObjectBuilder(true, data.project_id))[data.table_slug]
        const Field = mongoConn.models['Field']
        const field = await Field.findOne({
            id: data.field_id
        })
        if (!field) {
            throw new Error("Couldn't find field with given id: ", data.field_id)
        }
        if (data.type === "codabar" && field.type === "CODABAR") {
            if (field.attributes) {
                const attributes = struct.decode(field.attributes)
                if (attributes) {
                    if (attributes.prefix && attributes.digit_number) {
                        let randomNumber = generator.generateRandomNumberWithOutDash(attributes.prefix, attributes.digit_number)
                        
                        const isExist = await tableInfo.models.findOne({
                            [field.slug]: randomNumber
                        })

                        if (isExist) {
                            return await barcodeStore.generateDynamicBarcode(data)
                        } else {
                            return { barcode: randomNumber }
                        }
                    }
                }
            }
        } else if (data.type === "barcode" && field.type === "BARCODE") {
            let barcode = generateBarcode.generateBarcode()

            let params = {}
            params[field.slug] = barcode.toString()
            const isExist = await tableInfo.models.findOne({
                $and: [params]
            })
            if (isExist) {
                return await barcodeStore.generateDynamicBarcode(data)
            } else {
                return { barcode: barcode }
            }
        } else {
            throw new Error("invalid credentials for generating barcode")
        }
    })
}

module.exports = barcodeStore
// just comment