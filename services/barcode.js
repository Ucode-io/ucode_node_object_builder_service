const barCodeStore = require("../storage/mongo/barcode");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const barcodeService = {
    Generate: catchWrapServiceObjectBuilder(`service.barcode.getBarcode`, barCodeStore.generateBarcode),
    GenerateCodeWithPrefix: catchWrapServiceObjectBuilder(`service.barcode.generateCodebar`, barCodeStore.generateCodebar)
}

module.exports = barcodeService;
