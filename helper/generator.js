
function generateBarcode() {
    let countryCode = 478
    let medionCompanyCode = 8064
    let checkDigit = 5
    let productCode = Math.floor(1000 + Math.random() * 9000)

    let result = countryCode * 10 ** 10 + medionCompanyCode * 10 ** 6 + productCode * 10 ** 1 + checkDigit

    return result
}

module.exports = generateBarcode;