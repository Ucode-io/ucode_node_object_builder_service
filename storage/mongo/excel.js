const Table = require("../../models/table");
const catchWrapDb = require("../../helper/catchWrapDb");
const cfg = require('../../config/index')
const xlsxFile = require('read-excel-file/node');
const fs = require("fs");
const Minio = require("minio");
const obj = require("./object_builder");
const { struct } = require("pb-util/build");
const Field = require("../../models/field")
const ObjectBuilder = require("../../models/object_builder");
const Relation = require("../../models/relation");

let NAMESPACE = "storage.excel";

let excelStore = {
    ExcelRead: catchWrapDb(`${NAMESPACE}.read`, async (data) => {
        const createFilePath = "./"+data.id+".xlsx"
        let minioClient = new Minio.Client({
            accessKey: cfg.minioAccessKeyID,
            secretKey: cfg.minioSecretAccessKey,
            endPoint: "172.20.20.17",
            port: 9001,
            useSSL: false,
            pathStyle: true,
        });
        let bucketName = "docs";
        let fileStream = fs.createWriteStream(createFilePath);
        let fileObjectKey = data.id+".xlsx";
        let objectRow = {}
        await new Promise((resolve, reject) => {
            minioClient.getObject(bucketName, fileObjectKey, async function(err, object) {
                if (err) {
                    console.log(err)
                }
                if (object) {
                    object.on("data", (chunk) => fileStream.write(chunk));
                    object.on("end", () => console.log(`Reading ${fileObjectKey} finished`))
                    xlsxFile(createFilePath).then((rows) => {
                        objectRow["rows"] = rows[0]
                        fs.unlink(createFilePath, function (err) {
                            if (err) throw err;
                            resolve()  
                        });
                    })
                } else {
                    console.log('object not found')
                }
            });
        })
        return objectRow;
    }
    ),
    ExcelToDb: catchWrapDb(`${NAMESPACE}.create`, async (req) => {
        const datas = struct.decode(req.data)
        let exColumnSlugs = Object.keys(datas)

        const createFilePath = "./"+req.id+".xlsx"
        let minioClient = new Minio.Client({
            accessKey: cfg.minioAccessKeyID,
            secretKey: cfg.minioSecretAccessKey,
            endPoint: "172.20.20.17",
            port: 9001,
            useSSL: false,
            pathStyle: true,
        });
  
        let bucketName = "docs";
        let fileStream = fs.createWriteStream(createFilePath);
        let fileObjectKey = req.id+".xlsx";
            minioClient.getObject(bucketName, fileObjectKey, async function(err, object) {
                if (err) {
                    console.log(err)
                }
                object.on("data", (chunk) => fileStream.write(chunk));
                object.on("end", () => console.log(`Reading ${fileObjectKey} finished`))
                if (object) {
                    xlsxFile(createFilePath).then(async (rows) => {
                        let i = 0;
                        for (const row of rows) {
                            if (i === 0) {
                                i++;
                                continue;
                            }
                            let object = {}
                            for (const column_slug of exColumnSlugs) {
                                let id = datas[column_slug]
                                const field = await Field.findOne({
                                    id: id
                                })
                                if (field.type === "LOOKUP" || field.type === "LOOKUPS") {
                                    const relation = await Relation.findOne({
                                        id: field.relation_id
                                    })
                                    if (relation) {
                                        const viewFields = await Field.find({
                                            id: {$in: relation.view_fields}
                                        })
                                        let params = {}
                                        let isHave = true
                                        for (const viewField of viewFields) {
                                            if (row[rows[0].indexOf(column_slug)] !== null) {
                                                params[viewField.slug] = {$regex: row[rows[0].indexOf(column_slug)]}
                                            } else {
                                                isHave = false
                                            }
                                        }
                                        if (isHave) {
                                            const tableTo = (await ObjectBuilder())[relation.table_to]
                                            const objectFromObjectBuilder = await tableTo.models.findOne({
                                                $and: [params]
                                            })
                                            object[field?.slug] = objectFromObjectBuilder?.guid     
                                        }
                                    }
                                } else {
                                    object[field?.slug] = row[rows[0].indexOf(column_slug)]
                                }
                            }
                            object = struct.encode(object)
                            await obj.create({
                                table_slug: req.table_slug,
                                data: object
                            })
                        }
                        fs.unlink(createFilePath, function (err) {
                            if (err) throw err;
                        });
                    })
                } else {
                    console.log("object not found")
                }
            });
    }
    ),
};

module.exports = excelStore;
