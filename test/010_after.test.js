
const process = require('process');

after( function () {
    setTimeout(() => {
        process.exit(0)
    }, 0)
});