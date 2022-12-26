const fs = require('fs');

function insertCollections(conn) {
    return new Promise((resolve, reject) => {

        const appFile = fs.readFileSync("./initial_setups/apps.json")
        const apps = JSON.parse(appFile.toString())
        conn.collection('apps').insertMany(apps, function (err, result) {
            if (err) throw err;
            console.log('Inserted Apps', result.insertedCount);

        })

        const clientPlatformFile = fs.readFileSync("./initial_setups/client_platforms.json")
        const clientPlatforms = JSON.parse(clientPlatformFile.toString())
        conn.collection('client_platforms').insertMany(clientPlatforms, function (err, result) {
            if (err) throw err;
            console.log('Inserted Client Platforms:', result.insertedCount);

        })

        const clientTypesFile = fs.readFileSync("./initial_setups/client_types.json")
        const clientTypes = JSON.parse(clientTypesFile.toString())
        conn.collection('client_types').insertMany(clientTypes, function (err, result) {
            if (err) throw err;
            console.log('Inserted Client Types:', result.insertedCount);

        })

        const connectionFile = fs.readFileSync("./initial_setups/connections.json")
        const connections = JSON.parse(connectionFile.toString())
        conn.collection('connections').insertMany(connections, function (err, result) {
            if (err) throw err;
            console.log('Inserted Connections:', result.insertedCount);

        })

        const fieldsFile = fs.readFileSync("./initial_setups/fields.json")
        const fields = JSON.parse(fieldsFile.toString())
        conn.collection('fields').insertMany(fields, function (err, result) {
            if (err) throw err;
            console.log('Inserted Fields:', result.insertedCount);

        })


        const projectFile = fs.readFileSync("./initial_setups/projects.json")
        const projects = JSON.parse(projectFile.toString())
        conn.collection('projects').insertMany(projects, function (err, result) {
            if (err) throw err;
            console.log('Inserted Projects:', result.insertedCount);

        })


        const recordPermissionFile = fs.readFileSync("./initial_setups/record_permissions.json")
        const recordPermissions = JSON.parse(recordPermissionFile.toString())
        conn.collection('record_permissions').insertMany(recordPermissions, function (err, result) {
            if (err) throw err;
            console.log('Inserted Record Permissions:', result.insertedCount);

        })


        const relationFile = fs.readFileSync("./initial_setups/relations.json")
        const relations = JSON.parse(relationFile.toString())
        conn.collection('relations').insertMany(relations, function (err, result) {
            if (err) throw err;
            console.log('Inserted Relations:', result.insertedCount);

        })

        const roleFile = fs.readFileSync("./initial_setups/roles.json")
        const roles = JSON.parse(roleFile.toString())
        conn.collection('roles').insertMany(roles, function (err, result) {
            if (err) throw err;
            console.log('Inserted Roles:', result.insertedCount);

        })


        const sectionFile = fs.readFileSync("./initial_setups/sections.json")
        const sections = JSON.parse(sectionFile.toString())
        conn.collection('sections').insertMany(sections, function (err, result) {
            if (err) throw err;
            console.log('Inserted Sections:', result.insertedCount);

        })


        const tableFile = fs.readFileSync("./initial_setups/tables.json")
        const tables = JSON.parse(tableFile.toString())
        conn.collection('tables').insertMany(tables, function (err, result) {
            if (err) throw err;
            console.log('Inserted Tables:', result.insertedCount);

        })


        const testLoginFile = fs.readFileSync("./initial_setups/test_logins.json")
        const testLogins = JSON.parse(testLoginFile.toString())
        conn.collection('test_logins').insertMany(testLogins, function (err, result) {
            if (err) throw err;
            console.log('Inserted Test Logins:', result.insertedCount);

        })


        const userFile = fs.readFileSync("./initial_setups/users.json")
        const users = JSON.parse(userFile.toString())
        conn.collection('users').insertMany(users, function (err, result) {
            if (err) throw err;
            console.log('Inserted Users:', result.insertedCount);

        })

        const fieldPermissionFile = fs.readFileSync("./initial_setups/field_permissions.json")
        const fieldPermissions = JSON.parse(fieldPermissionFile.toString())
        conn.collection('field_permissions').insertMany(fieldPermissions, function (err, result) {
            if (err) throw err;
            console.log('Inserted Field Permission File:', result.insertedCount);

        })

        const viewRelationPermissionFile = fs.readFileSync("./initial_setups/view_relation_permissions.json")
        const viewRelationPermission = JSON.parse(viewRelationPermissionFile.toString())
        conn.collection('view_relation_permissions').insertMany(viewRelationPermission, function (err, result) {
            if (err) throw err;
            console.log('Inserted View Relation Permission :', result.insertedCount);

        })

    })
}

module.exports = insertCollections