
function generateBarcode() {
    let countryCode = 478
    let medionCompanyCode = 8064
    let checkDigit = 5
    let productCode = Math.floor(1000 + Math.random() * 9000)

    let result = countryCode * 10 ** 10 + medionCompanyCode * 10 ** 6 + productCode * 10 ** 1 + checkDigit

    return result
}

function generateRandomNumber(prefix, digitNumber) {
    let result
    let generateRandomNumber = Math.floor(10 ** digitNumber + Math.random() * 9 * 10 ** digitNumber)

    result = prefix + "-" + generateRandomNumber

    return result
}

function generateRandomNumberWithOutDash(prefix, digitNumber) {
    let result
    let generateRandomNumber = Math.floor(10 ** digitNumber + Math.random() * 9 * 10 ** digitNumber)

    result = prefix + generateRandomNumber

    return result
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

function generateRandomString(prefix, length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    result = prefix + result

    return result;
}

module.exports = {generateBarcode, generateRandomNumber, generateRandomNumberWithOutDash, generateRandomString}