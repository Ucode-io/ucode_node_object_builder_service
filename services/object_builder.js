const objectBuilderStore = require("../storage/mongo/object_builder");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const objectBuilderService = {
    Create: catchWrapServiceObjectBuilder(`service.object_builder.create`, objectBuilderStore.create),
    Update: catchWrapServiceObjectBuilder(`service.object_builder.update`, objectBuilderStore.update),
    GetSingle: catchWrapServiceObjectBuilder(`service.object_builder.getSingle`, objectBuilderStore.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.object_builder.getList`, objectBuilderStore.getList),
    GetListInExcel: catchWrapServiceObjectBuilder(`service.object_builder.getListInExcel`, objectBuilderStore.getListInExcel),
    Delete: catchWrapServiceObjectBuilder(`service.object_builder.delete`, objectBuilderStore.delete),
    ManyToManyAppend: catchWrapServiceObjectBuilder(`service.object_builder.appendManyToMany`, objectBuilderStore.appendManyToMany),
    ManyToManyDelete: catchWrapServiceObjectBuilder(`service.object_builder.deleteManyToMany`, objectBuilderStore.deleteManyToMany),
    GetObjectDetails: catchWrapServiceObjectBuilder(`service.object_builder.getObjectDetails`, objectBuilderStore.getObjectDetails),
    Batch: catchWrapServiceObjectBuilder("service.object_builder.batch", objectBuilderStore.batch),
    MultipleUpdate: catchWrapServiceObjectBuilder("service.object_builder.multipleUpdate", objectBuilderStore.multipleUpdate)
};

module.exports = objectBuilderService;  