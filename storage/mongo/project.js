const {get, set, remove} = require("../../pool")
const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");

let NAMESPACE = "storage.project";

let projectStore = {
    register: catchWrapDb(`${NAMESPACE}.register`, async(data) => {
      throw new Error("not implemented yett")
    }),
    deregister: catchWrapDb(`${NAMESPACE}.deregister`, async(data) => {
        throw new Error("not implemented yett")
    }),
    registerMany: catchWrapDb(`${NAMESPACE}.registerMany`, async(data) => {        
        throw new Error("not implemented yett")
    }),
    deregisterMany: catchWrapDb(`${NAMESPACE}.deregisterMany`, async (data) => {
        throw new Error("not implemented yett")
    }),
};

module.exports = projectStore;
