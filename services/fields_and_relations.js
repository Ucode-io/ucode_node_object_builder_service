const catchWrapService = require("../helper/catchWrapService");
const fieldsRelationsStore = require("../storage/mongo/fields_and_relations");

const NAMESPACE = 'service.fields_and_relations'

const fieldsRelationsService = {
    CreateFieldsAndRelations: catchWrapService(`${NAMESPACE}.create`, fieldsRelationsStore.create)
}

module.exports = fieldsRelationsService;