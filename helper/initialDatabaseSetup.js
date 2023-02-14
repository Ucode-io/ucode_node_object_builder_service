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

    
    collections = await new Promise((resolve, reject) => {
        let collections = {}
        conn.db.listCollections()
            .toArray(function (err, collectionNames) {
                if (err) {
                    console.log(err);
                    reject(err)
                }

                for (let collection of collectionNames) {
                    collections[collection.name] = collection.name
                }

                resolve(collections)
            });
    })

    console.log('available collections', collections)


    if (!collections['apps']) {
        const app = await appCreate()
        await conn.collection('apps').insertMany(app, function (err, result) {
            if (err) throw err;
            console.log("Inserted Apps : ", result.insertedCount)
        })
    }

    if (!collections['tables']) {
        const table = await createTable()
        conn.collection('tables').insertMany(table, function (err, result) {
            if (err) throw err;
            console.log("Inserted Table :", result.insertedCount)
        })
    }

    if (!collections['fields']) {
        const fields = await createField()
        conn.collection('fields').insertMany(fields, function (err, result) {
            if (err) throw err;
            console.log("Inserted Field :", result.insertedCount)
        })

    }

    if (!collections['sections']) {
        const section = await createSection()
        conn.collection('sections').insertMany(section, function (err, result) {
            if (err) throw err;
            console.log("Inserted Section :", result.insertedCount)
        })
    }


    if (!collections['client_platforms']) {
        const clientPlatform = await createClientPlatform(clientPlatformID, clientTypeID, projectID)
        conn.collection('client_platforms').insertMany(clientPlatform, function (err, result) {
            if (err) throw err;
            console.log("Inserted Client Platform : ", result.insertedCount)
        })
    }

    if (!collections['client_types']) {
        const clientType = await createClientType(clientPlatformID, clientTypeID, projectID)
        conn.collection('client_types').insertMany(clientType, function (err, result) {
            if (err) throw err;
            console.log("Inserted Client Type :", result.insertedCount)
        })
    }

    if (!collections['roles']) {
        const role = await createRole(roleID, clientPlatformID, clientTypeID, projectID)
        conn.collection('roles').insertMany(role, function (err, result) {
            if (err) throw err;
            console.log("Inserted Role :", result.insertedCount)
        })
    }

    if (!collections['users']) {
        const user = await createUser(userID, roleID, clientTypeID, clientPlatformID, projectID)
        conn.collection('users').insertMany(user, function (err, result) {
            if (err) throw err;
            console.log("Inserted User :", result.insertedCount)
        })
    }

    if (!collections['test_logins']) {
        const testLogin = await createTestLogin(testLoginID, clientTypeID)
        conn.collection('test_logins').insertMany(testLogin, function (err, result) {
            if (err) throw err;
            console.log("Inserted Test Login :", result.insertedCount)
        })
    }

    if (!collections['connections']) {
        const connections = await createConnection(connectionID, clientTypeID)
        conn.collection('connections').insertMany(connections, function (err, result) {
            if (err) throw err;
            console.log("Inserted Connections : ", result.insertedCount)
        })
    }

    if (!collections['relations']) {
        const relation = await createRelation()
        conn.collection('relations').insertMany(relation, function (err, result) {
            if (err) throw err;
            console.log("Inserted Relation :", result.insertedCount)
        })
    }

    if (!collections['record_permissions']) {
        const recordPermission = await createRecordPermision(roleID)
        conn.collection('record_permissions').insertMany(recordPermission, function (err, result) {
            if (err) throw err;
            console.log("Inserted Record Permission :", result.insertedCount)
        })
    }

    if (!collections['field_permissions']) {
        const fieldPermissions = await createFieldPermission(roleID)
        conn.collection('field_permissions').insertMany(fieldPermissions, function (err, result) {
            if (err) throw err;
            console.log("Inserted Field Permissions :", result.insertedCount)
        })
    }

    if (!collections['view_relation_permissions']) {

        const viewRelationPermissions = await createViewRelationPermissions(roleID)
        conn.collection('view_relation_permissions').insertMany(viewRelationPermissions, function (err, result) {
            if (err) throw err;
            console.log("Inserted View Permissions :", result.insertedCount)
        })
    }

}

module.exports = insertCollections