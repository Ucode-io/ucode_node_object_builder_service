const objectBuilderStore = require("../storage/mongo/object_builder");
const catchWrapServiceObjectBuilder = require("../helper/catchWrapServiceObjectBuilder");

const objectBuilderService = {
    Create: catchWrapServiceObjectBuilder(`service.object_builder.create`, objectBuilderStore.create),
    Update: catchWrapServiceObjectBuilder(`service.object_builder.update`, objectBuilderStore.update),
    GetSingle: catchWrapServiceObjectBuilder(`service.object_builder.getSingle`, objectBuilderStore.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.object_builder.getList`, objectBuilderStore.getList),
    GetList2: catchWrapServiceObjectBuilder(`service.object_builder.getList2`, objectBuilderStore.getList2),
    GetSingleSlim: catchWrapServiceObjectBuilder(`service.object_builder.getSingleSlim`, objectBuilderStore.getSingleSlim),
    GetListSlim: catchWrapServiceObjectBuilder(`service.object_builder.getListSlim`, objectBuilderStore.getListSlim),
    GetListInExcel: catchWrapServiceObjectBuilder(`service.object_builder.getListInExcel`, objectBuilderStore.getListInExcel),
    Delete: catchWrapServiceObjectBuilder(`service.object_builder.delete`, objectBuilderStore.delete),
    ManyToManyAppend: catchWrapServiceObjectBuilder(`service.object_builder.appendManyToMany`, objectBuilderStore.appendManyToMany),
    ManyToManyDelete: catchWrapServiceObjectBuilder(`service.object_builder.deleteManyToMany`, objectBuilderStore.deleteManyToMany),
    GetTableDetails: catchWrapServiceObjectBuilder(`service.object_builder.getObjectDetails`, objectBuilderStore.getTableDetails),
    Batch: catchWrapServiceObjectBuilder("service.object_builder.batch", objectBuilderStore.batch),
    MultipleUpdate: catchWrapServiceObjectBuilder("service.object_builder.multipleUpdate", objectBuilderStore.multipleUpdate),
    GetFinancialAnalytics: catchWrapServiceObjectBuilder("service.object_builder.getFinancialAnalytics", objectBuilderStore.getFinancialAnalytics),
    GetGroupReportTables: catchWrapServiceObjectBuilder("service.object_builder.getGroupReportTables", objectBuilderStore.getGroupReportTables),
    GetGroupByField: catchWrapServiceObjectBuilder("service.object_builder.getGroupByField", objectBuilderStore.getGroupByField),
    GroupByColumns: catchWrapServiceObjectBuilder("service.object_builder.groupByColumns", objectBuilderStore.groupByColumns),
    CopyFromProject: catchWrapServiceObjectBuilder("service.object_builder.copyFromProject", objectBuilderStore.copyFromProject),
    DeleteMany: catchWrapServiceObjectBuilder("service.object_builder.deleteMany", objectBuilderStore.deleteMany),
    GetListWithOutRelations: catchWrapServiceObjectBuilder("service.object_builder.getListWithOutRelations", objectBuilderStore.getListWithOutRelations),
};

module.exports = objectBuilderService;  