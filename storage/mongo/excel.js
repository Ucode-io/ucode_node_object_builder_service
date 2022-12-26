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
const con = require("../../helper/constants");
const logger = require("../../config/logger");

let NAMESPACE = "storage.excel";

let excelStore = {
    ExcelRead: catchWrapDb(`${NAMESPACE}.read`, async (data) => {
        const createFilePath = "./"+data.id+".xlsx"
        let ssl = true
        if (cfg.minioSSL !== "true") {
            ssl = false
        }
        let minioClient = new Minio.Client({
            accessKey: cfg.minioAccessKeyID,
            secretKey: cfg.minioSecretAccessKey,
            endPoint: cfg.minioEndpoint,
            useSSL: ssl,
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
        let ssl = true
        if (cfg.minioSSL !== "true") {
            ssl = false
        }

        const createFilePath = "./"+req.id+".xlsx"
        let minioClient = new Minio.Client({
            accessKey: cfg.minioAccessKeyID,
            secretKey: cfg.minioSecretAccessKey,
            endPoint: cfg.minioEndpoint,
            useSSL: ssl,
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
                xlsxFile(createFilePath).then(async (rows) => {
                    let i = 0;
                    for (const row of rows) {
                        let appendMany2ManyArray = []
                        let relation
                        if (i === 0) {
                            i++;
                            continue;
                        }
                        let object = {}
                        for (const column_slug of exColumnSlugs) {
                            let id = datas[column_slug]
                            let splitedRelationFieldId = [], viewFieldId = ""
                            if (id.includes(",")) {
                                splitedRelationFieldId = id.split(",")
                                viewFieldId = splitedRelationFieldId[1]
                                id = splitedRelationFieldId[0]
                            }
                            const field = await Field.findOne({
                                id: id
                            })
                            if (!field) {
                                continue;
                            }
                            let value = row[rows[0].indexOf(column_slug)]
                            if (value === null) {
                                con.NUMBER_TYPES.includes(field.type) ? value = 0 :
                                con.STRING_TYPES.includes(field.type) ? value = "" :
                                con.BOOLEAN_TYPES.includes(field.type) ? value = false : ""
                            }
                            let options = []
                            if (field.type == "MULTISELECT" && value !== null && value.length) {
                                if (field.attributes) {
                                    field.attributes = struct.decode(field.attributes)
                                    options = field.attributes.options
                                }
                                let arrayMultiSelect = [], labelsOfMultiSelect = []
                                if (value.includes(",") && options.length) {
                                    labelsOfMultiSelect = value.split(",")
                                    labelsOfMultiSelect.forEach(element => {
                                        let getValueOfMultiSelect = options.find(val => (val.label === element))
                                        arrayMultiSelect.push(getValueOfMultiSelect.value)
                                    })
                                } else if (value.includes(" ") && options.length) {
                                    labelsOfMultiSelect.forEach(element => {
                                        let getValueOfMultiSelect = options.find(val => (val.label === element))
                                        arrayMultiSelect.push(getValueOfMultiSelect.value)
                                    })
                                } else {
                                    let getValueOfMultiSelect = options?.find(val => (val.label === value))
                                    arrayMultiSelect.push(getValueOfMultiSelect?.value)
                                }
                                value = arrayMultiSelect
                            } else if ((field.type === "LOOKUP" || field.type === "LOOKUPS")) {
                                relation = await Relation.findOne({
                                    id: field.relation_id
                                })
                                if (relation && relation.type !== "Many2Many") {
                                    const viewField = await Field.findOne({
                                        id: viewFieldId
                                    })
                                    let params = {}
                                    if (typeof row[rows[0].indexOf(column_slug)] === "string") {
                                        params[viewField.slug] =  RegExp(row[rows[0].indexOf(column_slug)],"i")
                                    } else {
                                        params[viewField.slug] =  row[rows[0].indexOf(column_slug)]
                                    }
                                    
                                    if (viewField) {
                                        const tableTo = (await ObjectBuilder(true, req.project_id))[relation.table_to]
                                        const objectFromObjectBuilder = await tableTo.models.findOne({
                                            $and: [params]
                                        })
                                        object[field?.slug] = objectFromObjectBuilder?.guid
                                        continue
                                    }

                                }
                            } else if (con.NUMBER_TYPES.includes(field.type)) {
                                let strNumber = value.toString()
                                strNumber=strNumber.replace(/\,/g,'');
                                let i = 0
                                try {
                                    i = Number(strNumber)
                                } catch (error) {
                                    logger.error("value: ", strNumber, "error: ", error);
                                    i = 0
                                }
                                value=i
                                
                            }
                            if (value) {
                                object[field?.slug] = value
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
            });
    }
    ),
};

module.exports = excelStore;
