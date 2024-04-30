const objectBuilderStoreV2 = require("../storage/mongo/items");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const NAMESPACE = "items"

const objectBuilderService = {
    Create: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.create`, objectBuilderStoreV2.create),
    Update: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.update`, objectBuilderStoreV2.update),
    GetSingle: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.getSingle`, objectBuilderStoreV2.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.getList`, objectBuilderStoreV2.getList),
    Delete: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.delete`, objectBuilderStoreV2.delete),
    DeleteMany: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.deleteMany`, objectBuilderStoreV2.deleteMany),
    ManyToManyAppend: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.appendManyToMany`, objectBuilderStoreV2.appendManyToMany),
    ManyToManyDelete: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.deleteManyToMany`, objectBuilderStoreV2.deleteManyToMany),
    MultipleUpdate: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.multipleUpdate`, objectBuilderStoreV2.multipleUpdate),
    MultipleInsert: catchWrapServiceObjectBuilder(`service.${NAMESPACE}.multipleInsert`, objectBuilderStoreV2.multipleInsert),
};

module.exports = objectBuilderService;  