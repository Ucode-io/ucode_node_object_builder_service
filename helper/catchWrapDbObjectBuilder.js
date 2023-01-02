const logger = require("../config/logger");
const cfg = require("../config/index");

module.exports = (namespace, fn) => {
    return async (arg) => {
        logger.debug(`${namespace}: requested, ${JSON.stringify(arg, null, 2)}`);

        try {
            let resp = await fn(arg);
            logger.debug(`${namespace}: succeeded`);

            return resp;
        } catch (error) {
            console.log(`environment`, cfg.environment);
            if (cfg.environment == "development") {
                logger.error(`${namespace} failed: ${error}`);
            }
            throw new Error(error.message);
        }
    };
};
