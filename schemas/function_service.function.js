const mongoose = require('mongoose');

const FunctionServiceCustomEventSchema = new mongoose.Schema({}, { strict: false });
const FucntionServiceCustomEvent = mongoose.model('function_service.function', FunctionServiceCustomEventSchema, 'function_service.functions');

module.exports = FunctionServiceCustomEventSchema;