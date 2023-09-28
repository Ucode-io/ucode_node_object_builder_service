const cfg = require('../../config/index')
const xlsxFile = require('read-excel-file/node');
const fs = require("fs");
const catchWrapDb = require("../../helper/catchWrapDb");
const Minio = require("minio");
const obj = require("./object_builder");
const { struct } = require("pb-util/build");
const ObjectBuilder = require("../../models/object_builder");
const con = require("../../helper/constants");
const logger = require("../../config/logger");
const mongoPool = require('../../pkg/pool');
var fns_format = require('date-fns/format');
const { getSingleWithRelations } = require('../../helper/getSingleWithRelations');

let NAMESPACE = "storage.excel";

let excelStore = {
    ExcelRead: catchWrapDb(`${NAMESPACE}.read`, async (data) => {
        const createFilePath = "./" + data.id + ".xlsx"
        let ssl = true
        // console.log("ssl::", cfg.minioSSL, "typeof:::", typeof cfg.minioSSL);
        if ((typeof cfg.minioSSL === "boolean" && !cfg.minioSSL) || (typeof cfg.minioSSL === "string" && cfg.minioSSL !== "true")) {
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
        let fileObjectKey = data.id + ".xlsx";
        let objectRow = {}

        await new Promise((resolve, reject) => {
            minioClient.getObject(bucketName, fileObjectKey, async function (err, object) {
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
                    reject()
                }
            });
        })
        return objectRow;
    }
    ),
    ExcelToDb: catchWrapDb(`${NAMESPACE}.create`, async (req) => {
        const datas = struct.decode(req.data)
        console.log("dataset: " + datas);
        // console.log("test project id:::", req.project_id);
        const mongoConn = await mongoPool.get(req.project_id)
        const Field = mongoConn.models['Field']
        const Relation = mongoConn.models['Relation']
        let exColumnSlugs = Object.keys(datas)
        const allTables = await ObjectBuilder(true, req.project_id)
        const fields = allTables[req.table_slug].fields
        let fieldsMap = {}
        for (const field of fields) {
            fieldsMap[field.id] = field
        }
        let ssl = true
        if ((typeof cfg.minioSSL === "boolean" && !cfg.minioSSL) || (typeof cfg.minioSSL === "string" && cfg.minioSSL !== "true")) {
            ssl = false
        }
        // console.log("ssl::", ssl, "type::", typeof cfg.minioSSL);
        const createFilePath = "./" + req.id + ".xlsx"
        let minioClient = new Minio.Client({
            accessKey: cfg.minioAccessKeyID,
            secretKey: cfg.minioSecretAccessKey,
            endPoint: cfg.minioEndpoint,
            useSSL: ssl,
            pathStyle: true,
        });
        // console.log("test ", 111);
        let bucketName = "docs";
        let fileStream = fs.createWriteStream(createFilePath);
        let fileObjectKey = req.id + ".xlsx";
        minioClient.getObject(bucketName, fileObjectKey, async function (err, object) {
            if (err) {
                throw err
            }
            object.on("data", (chunk) => fileStream.write(chunk));
            object.on("end", () => console.log(`Reading ${fileObjectKey} finished`))
            xlsxFile(createFilePath).then(async (rows) => {
                // console.log("test 0");
                let i = 0;
                let objectsToDb = []
                for (const row of rows) {
                    let appendMany2ManyArray = []
                    let relation
                    if (i === 0) {
                        i++;
                        continue;
                    }
                    // console.log("test 1");
                    let objectToDb = {}
                    for (const column_slug of exColumnSlugs) {
                        let id = datas[column_slug]
                        let splitedRelationFieldId = [], viewFieldIds = []
                        if (id.includes(",")) {
                            splitedRelationFieldId = id.split(",")
                            viewFieldIds = splitedRelationFieldId.slice(1, splitedRelationFieldId.length)
                            id = splitedRelationFieldId[0]
                        }
                        // console.log("test 2");
                        const field = fieldsMap[id]
                        if (!field) {
                            // console.log("test 3");
                            continue;
                        }
                        let value = row[rows[0].indexOf(column_slug)]
                        // console.log("VALUE:::::::::::::", value)
                        if (value === null) {
                            con.NUMBER_TYPES.includes(field.type) ? value = 0 :
                                con.STRING_TYPES.includes(field.type) ? value = "" :
                                    con.BOOLEAN_TYPES.includes(field.type) ? value = "false" : ""
                        }
                        let options = []
                        // console.log("test 4");
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
                        } else if (con.BOOLEAN_TYPES.includes(field.type)) {
                            if (typeof (value) == "string") {
                                if (value.toUpperCase() === "ИСТИНА" || value.toUpperCase() == "TRUE") {
                                    value = true
                                } else {
                                    value = false
                                }
                            } else {
                                value = value
                            }

                        } else if (field.type === "LOOKUP" || field.type === "LOOKUPS") {
                            relation = await Relation.findOne({
                                id: field.relation_id
                            })
                            if (relation && relation.type !== "Many2Many") {
                                const viewFields = await Field.find({
                                    id: { $in: viewFieldIds }
                                })
                                let params = {}
                                let payload = {}
                                if (viewFields.length && viewFields.length > 1) {
                                    let values = row[rows[0].indexOf(column_slug)].split(" ")
                                    // console.log("val::", values);
                                    for (let i = 0; i < viewFields.length; i++) {
                                        if (typeof values[i] === "string") {
                                            values[i] = values[i].replaceAll(")", "\)")
                                            values[i] = values[i].replaceAll("(", "\(")
                                            // console.log("val::", values[i]);
                                            params[viewFields[i].slug] = RegExp(values[i], "i")
                                            payload[viewFields[i].slug] = values[i]
                                        } else {
                                            params[viewFields[i].slug] = values[i]
                                            payload[viewFields[i].slug] = values[i]
                                        }

                                    }
                                } else if (viewFields.length) {
                                    for (const viewField of viewFields) {
                                        if (typeof row[rows[0].indexOf(column_slug)] === "string") {
                                            let val = row[rows[0].indexOf(column_slug)]
                                            if (val) {
                                                val = val.replaceAll(")", "\\)")
                                                val = val.replaceAll("(", "\\(")
                                            }
                                            // console.log("val2222::", val);
                                            params[viewField.slug] = RegExp(val, "i")
                                            payload[viewField.slug] = val
                                        } else {
                                            params[viewField.slug] = row[rows[0].indexOf(column_slug)]
                                            payload[viewField.slug] = row[rows[0].indexOf(column_slug)]
                                        }

                                    }
                                }
                                // console.log(" rel params::", params);
                                if (Object.keys(params).length > 0) {
                                    // const tableTo = (await ObjectBuilder(true, req.project_id))[relation.table_to]
                                    const objectFromObjectBuilder = await getSingleWithRelations({
                                        table_slug: relation.table_to,
                                        project_id: req.project_id,
                                        data: params
                                    })
                                    console.log("objectFromObjectBuilder::", objectFromObjectBuilder.data);
                                    if (objectFromObjectBuilder && objectFromObjectBuilder.data) {
                                        if (field.attributes) {
                                            let fieldAttributes = struct.decode(field.attributes)
                                            if (fieldAttributes && fieldAttributes.auto_fill && fieldAttributes.auto_fill.length) {
                                                for (const autoFill of fieldAttributes.auto_fill) {
                                                    objectToDb[autoFill.field_to] = objectFromObjectBuilder.data[autoFill.field_from]
                                                }
                                            }
                                        }
                                        objectToDb[field?.slug] = objectFromObjectBuilder.data.guid
                                    } else {
                                        res = await obj.create({
                                            project_id: req.project_id,
                                            table_slug: relation.table_to,
                                            data: struct.encode(payload)
                                        })
                                        let result = struct.decode(res.data)
                                        objectToDb[field?.slug] = result?.guid
                                    }
                                    console.log("object to db", objectToDb);
                                    continue
                                }

                            }
                        } else if (con.NUMBER_TYPES.includes(field.type)) {
                            let strNumber = value.toString()
                            strNumber = strNumber.replace(/\,/g, '');
                            let i = 0
                            try {
                                i = Number(strNumber)
                            } catch (error) {
                                logger.error("value: ", strNumber, "error: ", error);
                                i = 0
                            }
                            value = i

                        } else if (con.STRING_TYPES.includes(field.type)) {
                            // console.log("EXCEL::::::::::::::::::::::::::::::::::::::", value)
                            if (field.type === "DATE_TIME" || field.type === "DATE") {
                                let i = ""
                                try {
                                    let toDate = new Date(value).toISOString()
                                    // console.log("TODATE::::::::::::", toDate)
                                    i = toDate
                                    // console.log("DATE_TIME::::::::::::::::::", value)
                                } catch (error) {
                                    logger.error("value: ", strNumber, "error: ", error);
                                    i = ""
                                }
                                value = i
                            }
                        }
                        if (value) {
                            objectToDb[field?.slug] = value
                        }

                    }
                    objectToDb['company_service_project_id'] = datas['company_service_project_id']
                    objectToDb['company_service_environment_id'] = datas['company_service_environment_id']
                    objectsToDb.push(objectToDb)
                    // await obj.create({
                    //     table_slug: req.table_slug,
                    //     data: struct.encode(objectToDb)
                    // })
                }
                // console.log("excel write::::", objectsToDb);
                await obj.multipleInsert({
                    table_slug: req.table_slug,
                    data: struct.encode({ objects: objectsToDb }),
                    project_id: req.project_id
                })

                fs.unlink(createFilePath, function (err) {
                    if (err) throw err;
                });
            })
        });
    }
    ),
};

module.exports = excelStore;
