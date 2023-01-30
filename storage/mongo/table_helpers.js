var fs = require('fs');
const Minio = require('minio');
const { v4 } = require("uuid");

const mongoPool = require('../../pkg/pool');
const cfg = require("../../config/index");
const catchWrapDb = require("../../helper/catchWrapDb");

const tableService = require("../../services/table");

const viewStore = require("./view");
const relationStore = require("./relation");
const sectionStore = require("./section");
const { resolve } = require('path');
const { throws } = require('assert');


let NAMESPACE = "storage.table_helpers";

let tableHelpers = {
    exportToJSON: catchWrapDb(`${NAMESPACE}.exportToJSON`, async (data) => {


        const mongoConn = await mongoPool.get(data.project_id)

        const App = mongoConn.models['App']

        const Table = mongoConn.models['Table']
        const ViewRelation = mongoConn.models['ViewRelation']
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const Section = mongoConn.models['Section']
        const View = mongoConn.models['View']

        const app = await App.findOne({
            id: data.app_id
        },
            {
                _id: 0,
                __v: 0,
            }
        )
        let tableIds = [], jsonObject = {}
        if (app.tables && app.tables.length) {
            app.tables.forEach(el => {
                tableIds.push(el.table_id)
            })
            const tables = await Table.find(
                {
                    deleted_at: "1970-01-01T18:00:00.000+00:00",
                    id: { $in: tableIds }
                },
                {
                    _id: 0,
                    __v: 0,
                    created_at: 0,
                    updated_at: 0,
                },
                {
                    sort: { created_at: -1 }
                }
            )
            let tableSlugs = [], changedTables = []
            for (const table of tables) {
                let changedTable = { ...table._doc }
                let tableInApp = app.tables.find(elInside => elInside.table_id === table.id)
                if (tableInApp) {
                    if (tableInApp.is_own_table) {
                        changedTable["foreign"] = false
                    } else {
                        changedTable["foreign"] = true
                    }
                }
                tableSlugs.push(table.slug)
                changedTables.push(changedTable)

            }
            app.tables = []
            const fields = await Field.find({
                table_id: { $in: tableIds },
                type: { $nin: ["LOOKUP", "LOOKUPS", "DYNAMIC"] },
                slug: { $ne: "guid" }
            },
                {
                    _id: 0,
                    __v: 0,
                    created_at: 0,
                    updated_at: 0,
                }
            )
            const sections = await Section.find({
                table_id: { $in: tableIds }
            },
                {
                    _id: 0,
                    __v: 0,
                    created_at: 0,
                    updated_at: 0,
                }
            )
            const relations = await Relation.find({
                $or: [
                    { table_from: { $in: tableSlugs } },
                    { table_to: { $in: tableSlugs } }
                ]
            },
                {
                    _id: 0,
                    __v: 0,
                    created_at: 0,
                    updated_at: 0,
                }
            )
            const views = await View.find({
                $or: [
                    { table_slug: { $in: tableSlugs } },
                    { relation_table_slug: { $in: tableSlugs } }
                ]
            },
                {
                    _id: 0,
                    __v: 0,
                    created_at: 0,
                    updated_at: 0,
                }
            )
            const viewRelations = await ViewRelation.find({
                table_slug: { $in: tableSlugs }
            },
                {
                    _id: 0,
                    __v: 0,
                    created_at: 0,
                    updated_at: 0,
                }
            )
            jsonObject = {
                app: app,
                tables: changedTables,
                fields: fields,
                relations: relations,
                sections: sections,
                views: views,
                view_relations: viewRelations
            }
        } else {
            throw new Error("No tables")
        }

        let filename = "export_" + Math.floor(Date.now() / 1000) + ".json"
        let filepath = "./" + filename
        let jsonStr = JSON.stringify(jsonObject, null, 2)
        fs.writeFileSync(filename, jsonStr, { encoding: 'utf8' });

        let ssl = true
        if (cfg.minioSSL != true) {
            ssl = false
        }

        console.log(`--->MongoCredentials -->>> 
            endpoint: ${cfg.minioEndpoint}, 
            ssl: ${ssl},
            accessId: ${cfg.minioAccessKeyID},
            secretkey:  ${cfg.minioSecretAccessKey}`);

        var minioClient = new Minio.Client({
            endPoint: cfg.minioEndpoint,
            useSSL: ssl,
            accessKey: cfg.minioAccessKeyID,
            secretKey: cfg.minioSecretAccessKey
        });

        var metaData = {
            'Content-Type': "application/json",
            'Content-Language': 123,
            'X-Amz-Meta-Testing': 1234,
            'example': 5678
        }

        minioClient.putObject("docs", filename, jsonStr, function (error, etag) {
            if (error) {
                console.log("errr:", error);
                return error
            }
            console.log("uploaded successfully");
            fs.unlink(filename, (err => {
                if (err)
                    console.log(err);
                else {
                    console.log("Deleted file: ", filename);
                }
            }));
        });
        let link = cfg.minioEndpoint + "/docs/" + filename
        return { link };
    }
    ),
    importFromJSON: catchWrapDb(`${NAMESPACE}.importFromJSON`, async (data) => {

        const mongoConn = await mongoPool.get(data.project_id)

        const App = mongoConn.models['App']

        const Table = mongoConn.models['Table']
        const ViewRelation = mongoConn.models['ViewRelation']
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        const Section = mongoConn.models['Section']
        const View = mongoConn.models['View']

        const filePath = "./" + data.file_name

        let ssl = true
        if (cfg.minioSSL !== true) {
            ssl = false
        }

        let minioClient = new Minio.Client({
            accessKey: cfg.minioAccessKeyID,
            secretKey: cfg.minioSecretAccessKey,
            endPoint: cfg.minioEndpoint,
            useSSL: ssl,
            pathStyle: true,
        });

        let fileStream = fs.createWriteStream(filePath);
        let bucketName = "docs";
        let jsonObjects;

        await new Promise((resolve, reject) => {
            minioClient.getObject(bucketName, data.file_name, (error, object) => {
                if (error) {
                    console.log('---ERROR---1', error)
                    reject()
                }

                object.on("data", (chunk) => {
                    fileStream.write(chunk)
                });

                object.on("end", () => {
                    fileStream.close()
                    console.log(`Reading ${data.file_name} finished`)
                    resolve()
                })
            })
        })

        await new Promise((resolve, reject) => {
            console.log('-----> FILEPATH', filePath)

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) reject(err);
                jsonObjects = JSON.parse(data);
                resolve()
            });

        })

        fs.unlink(filePath, (err) => {
            if (err) reject()
            else resolve()
        })

        let changedRelations = {}
        let existImportedTables = {}

        if (jsonObjects) {
            let newAppId = v4()
            jsonObjects.app.id = newAppId
            const app = new App(jsonObjects.app)
            await app.save()
            let newTables = {}

            for (const table of jsonObjects.tables) {
                let ownerAppOfTable;
                const isExists = await Table.findOne({
                    slug: table.slug,
                    deleted_at: "1970-01-01T18:00:00.000+00:00"
                })
                if (isExists) {
                    ownerAppOfTable = await App.findOne({
                        "tables.table_id": isExists.id,
                        "tables.is_own_table": true
                    })
                }
                if (ownerAppOfTable) {
                    await App.updateOne(
                        {
                            id: newAppId
                        },
                        {
                            $addToSet:
                            {
                                tables:
                                {
                                    table_id: isExists.id,
                                    is_visible: true,
                                    is_own_table: false
                                }
                            }
                        }
                    );
                    existImportedTables[table.slug] = true
                } else {
                    if (!table.foreign) {
                        table.app_id = newAppId
                        table.fields = jsonObjects.fields.filter(el => el.table_id === table.id)
                        table.sections = jsonObjects.sections.filter(el => el.table_id === table.id)
                        table.id = v4()
                        table.project_id = data.project_id
                        newTables[table.slug] = {
                            table_slug: table.slug,
                            sections: table.sections,
                            id: table.id
                        }
                        let callRequest = {
                            request: table,
                        }
                        await tableService.Create(callRequest, (err, response) => {
                            if (err) throw err;
                        })
                    }
                }
            }

            for (let relation of jsonObjects.relations) {
                let newTable = newTables[relation.table_from]
                if (!newTable) {
                    newTable = newTables[relation.table_to]
                    let tableFrom = existImportedTables[relation.table_from]
                    if (!tableFrom) {
                        continue
                    }
                } else {
                    let tableTo = jsonObjects.tables.find(el => el.slug === relation.table_to)
                    if (!tableTo) {
                        continue
                    }
                }
                if (!newTable) {
                    continue
                }
                let view = jsonObjects.views.find(el => el.relation_id === relation.id)
                if (view) {
                    delete view.type
                    delete view.id
                    view.title = view.name
                    relation = { ...relation, ...view }
                }
                let newRelationId = v4()
                changedRelations[relation.id] = newRelationId
                relation.id = newRelationId
                relation.project_id = data.project_id
                try {
                    await relationStore.create(relation)
                } catch (error) {
                    console.log(error, "relation id:::", relation.id)
                    continue
                }
            }
            for (const view of jsonObjects.views) {
                if (view.app_id) {
                    view.app_id = newAppId
                    view.id = v4()
                    view.project_id = data.project_id
                    await viewStore.create(view)
                }
            }
            for (const viewRelation of jsonObjects.view_relations) {
                let newTable = newTables[viewRelation.table_slug]
                if (!newTable) {
                    continue
                }
                viewRelation.view_relations = viewRelation.relations
                viewRelation.id = v4()
                viewRelation.project_id = data.project_id
                if (viewRelation.view_relations && viewRelation.view_relations.length) {
                    viewRelation.view_relations.forEach(el => {
                        if (changedRelations[el.relation_id]) {
                            el.relation_id = changedRelations[el.relation_id]
                        }
                    })
                }
                await sectionStore.upsertViewRelations(viewRelation)
            }
            let changedTablesAndSection = Object.values(newTables)
            for (const el of changedTablesAndSection) {
                let sectionIsChanged = false
                el.sections.length && el.sections.forEach(elSection => {
                    elSection.fields.length && elSection.fields.forEach(item => {
                        if (item.id.includes("#")) {
                            let relId = changedRelations[item.id.split("#")[1]]
                            if (relId) {
                                item.id = item.id.replaceAll(item.id.split("#")[1], relId)
                                sectionIsChanged = true
                            }
                        }
                    })
                })
                if (sectionIsChanged) {
                    await sectionStore.update({
                        table_id: el.id,
                        table_slug: el.table_slug,
                        sections: el.sections,
                        project_id: data.project_id
                    })
                }

            }
        }


        minioClient.removeObject("docs", data.file_name, (error) => {
            if (error) console.log(error);
        })

        return
    })

}

module.exports = tableHelpers;