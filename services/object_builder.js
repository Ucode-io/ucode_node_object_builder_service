const objectBuilderStore = require(`../storage/mongo/object_builder`);
const catchWrapServiceObjectBuilder = require(`../helper/catchWrapServiceObjectBuilder`);

const objectBuilderService = {
    Create: catchWrapServiceObjectBuilder(`service.object_builder.create`, objectBuilderStore.create),
    Update: catchWrapServiceObjectBuilder(`service.object_builder.update`, objectBuilderStore.update),
    GetSingle: catchWrapServiceObjectBuilder(`service.object_builder.getSingle`, objectBuilderStore.getSingle),
    GetList: catchWrapServiceObjectBuilder(`service.object_builder.getList`, objectBuilderStore.getList),
    GetList2: catchWrapServiceObjectBuilder(`service.object_builder.getList2`, objectBuilderStore.getList2),
    GetSingleSlim: catchWrapServiceObjectBuilder(`service.object_builder.getSingleSlim`, objectBuilderStore.getSingleSlim),
    GetListSlim: catchWrapServiceObjectBuilder(`service.object_builder.getListSlim`, objectBuilderStore.getListSlim),
    GetListSlimV2: catchWrapServiceObjectBuilder(`service.object_builder.getListSlim2`, objectBuilderStore.getListSlim2),
    GetListInExcel: catchWrapServiceObjectBuilder(`service.object_builder.getListInExcel`, objectBuilderStore.getListInExcel),
    Delete: catchWrapServiceObjectBuilder(`service.object_builder.delete`, objectBuilderStore.delete),
    ManyToManyAppend: catchWrapServiceObjectBuilder(`service.object_builder.appendManyToMany`, objectBuilderStore.appendManyToMany),
    ManyToManyDelete: catchWrapServiceObjectBuilder(`service.object_builder.deleteManyToMany`, objectBuilderStore.deleteManyToMany),
    GetTableDetails: catchWrapServiceObjectBuilder(`service.object_builder.getObjectDetails`, objectBuilderStore.getTableDetails),
    Batch: catchWrapServiceObjectBuilder(`service.object_builder.batch`, objectBuilderStore.batch),
    MultipleUpdate: catchWrapServiceObjectBuilder(`service.object_builder.multipleUpdate`, objectBuilderStore.multipleUpdate),
    GetFinancialAnalytics: catchWrapServiceObjectBuilder(`service.object_builder.getFinancialAnalytics`, objectBuilderStore.getFinancialAnalytics),
    GetGroupReportTables: catchWrapServiceObjectBuilder(`service.object_builder.getGroupReportTables`, objectBuilderStore.getGroupReportTables),
    GetGroupByField: catchWrapServiceObjectBuilder(`service.object_builder.getGroupByField`, objectBuilderStore.getGroupByField),
    DeleteMany: catchWrapServiceObjectBuilder(`service.object_builder.deleteMany`, objectBuilderStore.deleteMany),
    GroupByColumns: catchWrapServiceObjectBuilder(`service.object_builder.groupByColumns`, objectBuilderStore.groupByColumns),
    CopyFromProject: catchWrapServiceObjectBuilder(`service.object_builder.copyFromProject`, objectBuilderStore.copyFromProject),
    GetListWithOutRelations: catchWrapServiceObjectBuilder(`service.object_builder.getListWithOutRelations`, objectBuilderStore.getListWithOutRelations),
    GetListAggregation: catchWrapServiceObjectBuilder(`service.object_builder.getListAggregation`, objectBuilderStore.getListAggregation),
    GetListRelationTabInExcel:catchWrapServiceObjectBuilder(`service.object_builder.getListRelationTabInExcel`, objectBuilderStore.getListRelationTabInExcel),
    UpsertMany: catchWrapServiceObjectBuilder(`service.object_builder.upsertMany`, objectBuilderStore.upsertMany),
    UpdateByUserIdAuth: catchWrapServiceObjectBuilder(`service.object_builder.updateByUserIdAuth`, objectBuilderStore.updateByUserIdAuth),
    AgGridTree: catchWrapServiceObjectBuilder(`service.object_builder.agGridTree`, objectBuilderStore.agGridTree),
    GetBoardStructure: catchWrapServiceObjectBuilder(`service.object_builder.getBoardStructure`, objectBuilderStore.getBoardStructure),
    GetBoardData: catchWrapServiceObjectBuilder(`service.object_builder.getBoardData`, objectBuilderStore.getBoardData),
};

module.exports = objectBuilderService;  