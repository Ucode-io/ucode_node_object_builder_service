const projectStore = require("../storage/mongo/project");
const catchWrapService = require("../helper/catchWrapService");

const projectService = {
    Register: catchWrapService(`service.project.register`, projectStore.register),
    Deregister: catchWrapService(`service.project.deregister`, projectStore.deregister),
    RegisterMany: catchWrapService(`service.project.registerMany`, projectStore.registerMany),
    DeregisterMany: catchWrapService(`service.project.deregisterMany`, projectStore.deregisterMany),
    Reconnect: catchWrapService(`service.project.reconnect`, projectStore.reconnect),
    RegisterProjects: catchWrapService(`service.project.registerProjects`, projectStore.registerProjects),
    AutoConnect: catchWrapService(`service.project.autoConnect`, projectStore.autoConnect)
};



module.exports = projectService;
