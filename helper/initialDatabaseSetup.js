const { v4 } = require("uuid");

const appCreate = require("../initial_setups/app");
const createClientPlatform = require("../initial_setups/clientPlatforms");
const createClientType = require("../initial_setups/clientType");
const createRole = require("../initial_setups/role");
const createUser = require("../initial_setups/user");
const createTestLogin = require("../initial_setups/testLogin");
const createConnection = require("../initial_setups/connections");
const createField = require("../initial_setups/field");
const createTable = require("../initial_setups/tables");
const createRecordPermision = require("../initial_setups/recordPermission");
const createFieldPermission = require("../initial_setups/fieldPermission");
const createSection = require("../initial_setups/section");
const createViewRelationPermissions = require("../initial_setups/viewRelationPermission");
const createRelation = require("../initial_setups/relation");

async function insertCollections(conn, userId, projectId) {

        const projectID = projectId.toString()
        const clientPlatformID = v4().toString()
        const clientTypeID = v4().toString()
        const roleID = v4().toString()
        const userID = userId.toString()
        const testLoginID = v4().toString()
        const connectionID = v4().toString()

        const app = await appCreate()

        conn.collection('apps').insertMany(app, function (err, result) {
            if (err) throw err;
            console.log("Inserted Apps : ", result.insertedCount)
        })

        const clientPlatform = await createClientPlatform(clientPlatformID, clientTypeID, projectID)
        conn.collection('client_platforms').insertMany(clientPlatform, function (err, result) {
            if (err) throw err;
            console.log("Inserted Client Platform : ", result.insertedCount)
        })

        const clientType = await createClientType(clientPlatformID, clientTypeID, projectID)
        conn.collection('client_types').insertMany(clientType, function (err, result) {
            if (err) throw err;
            console.log("Inserted Client Type :", result.insertedCount)
        })

        const role = await createRole(roleID, clientPlatformID, clientTypeID, projectID)
        conn.collection('roles').insertMany(role, function (err, result) {
            if (err) throw err;
            console.log("Inserted Role :", result.insertedCount)
        })

        const user = await createUser(userID, roleID, clientTypeID, clientPlatformID, projectID)
        conn.collection('users').insertMany(user, function (err, result) {
            if (err) throw err;
            console.log("Inserted User :", result.insertedCount)
        })

        const testLogin = await createTestLogin(testLoginID, clientTypeID)
        conn.collection('test_logins').insertMany(testLogin, function (err, result) {
            if (err) throw err;
            console.log("Inserted Test Login :", result.insertedCount)
        })

        const connections = await createConnection(connectionID, clientTypeID)
        conn.collection('connections').insertMany(connections, function (err, result) {
            if (err) throw err;
            console.log("Inserted Connections : ", result.insertedCount)
        })

        const table = await createTable()
        conn.collection('tables').insertMany(table, function (err, result) {
            if (err) throw err;
            console.log("Inserted Table :", result.insertedCount)
        })

        const relation = await createRelation()
        conn.collection('relation').insertMany(relation, function (err, result) {
            if (err) throw err;
            console.log("Inserted Relation :", result.insertedCount)
        })

        const recordPermission = await createRecordPermision(roleID)
        conn.collection('record_permissions').insertMany(recordPermission, function (err, result) {
            if (err) throw err;
            console.log("Inserted Record Permission :", result.insertedCount)
        })

        const fields = await createField()
        conn.collection('field').insertMany(fields, function (err, result) {
            if (err) throw err;
            console.log("Inserted Field :", result.insertedCount)
        })

        const fieldPermissions = await createFieldPermission(roleID)
        conn.collection('field_permissions').insertMany(fieldPermissions, function (err, result) {
            if (err) throw err;
            console.log("Inserted Field Permissions :", result.insertedCount)
        })

        const section = await createSection()
        conn.collection('section').insertMany(section, function (err, result) {
            if (err) throw err;
            console.log("Inserted Section :", result.insertedCount)
        })

        const viewRelationPermissions = await createViewRelationPermissions(roleID)
        conn.collection('view_permissions').insertMany(viewRelationPermissions, function (err, result) {
            if (err) throw err;
            console.log("Inserted View Permissions :", result.insertedCount)
        })

}

module.exports = insertCollections