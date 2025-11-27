const barCodeStore = require("../storage/mongo/barcode");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const barcodeService = {
    Generate: catchWrapServiceObjectBuilder(`service.barcode.getBarcode`, barCodeStore.generateBarcode),
    GenerateCodeWithPrefix: catchWrapServiceObjectBuilder(`service.barcode.generateCodebar`, barCodeStore.generateCodebar),
    GenerateDynamic:catchWrapServiceObjectBuilder(`service.barcode.generateDynamicBarcode`, barCodeStore.generateDynamicBarcode),
}

module.exports = barcodeService;
