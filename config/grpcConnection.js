const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");

const cfg = require('./index')
const logger = require('./logger')

const tableService = require("../services/table");
const fieldService = require("../services/field");
const objectBuilderService = require("../services/object_builder")
const sectionService = require("../services/section")
const relationService = require("../services/relation")
const viewService = require("../services/view")
const appService = require("../services/app")
const dashboardService = require("../services/dashboard")
const variableService = require("../services/variable")
const panelService = require("../services/panel")
const htmlTemplateService = require("../services/html_template")
const loginService = require("../services/login")
const documentService = require("../services/document")
const eventService = require("../services/event")
const eventLogsService = require("../services/event_logs")
const excelService = require("../services/excel")
const permissionService = require("../services/permission")
const customEventService = require("../services/custom_event")
const functionService = require("../services/function")
const barcodeService = require("../services/barcode")
const queryFolderService = require("../services/query_folder")
const queryService = require("../services/query")
const webPageService = require("../services/web_pages")

const PROTO_URL = __dirname + "/../protos/object_builder_service/object_builder_service.proto";
const packageDefinition = protoLoader.loadSync(PROTO_URL, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const objectBuilderProto =
    grpc.loadPackageDefinition(packageDefinition).object_builder_service;

var server = new grpc.Server();

server.addService(objectBuilderProto.TableService.service, tableService);
server.addService(objectBuilderProto.FieldService.service, fieldService);
server.addService(objectBuilderProto.ObjectBuilderService.service, objectBuilderService);
server.addService(objectBuilderProto.SectionService.service, sectionService);
server.addService(objectBuilderProto.RelationService.service, relationService);
server.addService(objectBuilderProto.ViewService.service, viewService);
server.addService(objectBuilderProto.AppService.service, appService);
server.addService(objectBuilderProto.DashboardService.service, dashboardService);
server.addService(objectBuilderProto.VariableService.service, variableService);
server.addService(objectBuilderProto.PanelService.service, panelService);
server.addService(objectBuilderProto.HtmlTemplateService.service, htmlTemplateService);
server.addService(objectBuilderProto.LoginService.service, loginService);
server.addService(objectBuilderProto.DocumentService.service, documentService);
server.addService(objectBuilderProto.EventService.service, eventService);
server.addService(objectBuilderProto.EventLogsService.service, eventLogsService);
server.addService(objectBuilderProto.ExcelService.service, excelService);
server.addService(objectBuilderProto.PermissionService.service, permissionService);
server.addService(objectBuilderProto.CustomEventService.service, customEventService);
server.addService(objectBuilderProto.FunctionService.service, functionService);
server.addService(objectBuilderProto.BarcodeService.service, barcodeService);
server.addService(objectBuilderProto.QueryFolderService.service, queryFolderService);
server.addService(objectBuilderProto.QueryService.service, queryService);
server.addService(objectBuilderProto.WebPageService.service, webPageService);


server.bindAsync(
    "0.0.0.0:" + cfg.RPCPort,
    grpc.ServerCredentials.createInsecure(),
    (err, bindPort) => {
        if (err) {
            throw new Error("Error while binding grpc server to the port");
        }

        logger.info("grpc server is running at %s", bindPort);
        server.start();
    }
);
