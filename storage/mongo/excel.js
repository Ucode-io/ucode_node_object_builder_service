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
        console.log("dataset: ", datas);
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
        const createFilePath = "./" + req.id + ".xlsx"
        let minioClient = new Minio.Client({
            accessKey: cfg.minioAccessKeyID,
            secretKey: cfg.minioSecretAccessKey,
            endPoint: cfg.minioEndpoint,
            useSSL: ssl,
            pathStyle: true,
        });
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
                            // console.log("\n\n~~~> field slug ", field.slug, "  ~~~~ value  ", value)
                            if (field.attributes) {
                                let a = struct.decode(field.attributes)
                                // console.log("~~~~ >> ", a,  a.options)
                                // options = struct.decode(field.attributes.options)
                                options = a.options
                            }
                            let arrayMultiSelect = [], labelsOfMultiSelect = []
                            if (value.includes(",") && options.length) {
                                labelsOfMultiSelect = value.split(",")
                                // console.log(":#1")
                                labelsOfMultiSelect.forEach(element => {
                                    let getValueOfMultiSelect = options?.find(val => (val.label === element))
                                    arrayMultiSelect.push(getValueOfMultiSelect.value)
                                })
                            } else if (value.includes(" ") && options.length) {
                                // console.log(":#2")
                                labelsOfMultiSelect.forEach(element => {
                                    let getValueOfMultiSelect = options?.find(val => (val.label === element))
                                    arrayMultiSelect.push(getValueOfMultiSelect.value)
                                })
                            } else {
                                // console.log(":#3", value)
                                let getValueOfMultiSelect = options?.find(val => (val.label === value))
                                arrayMultiSelect.push(getValueOfMultiSelect?.value)
                            }
                            value = arrayMultiSelect
                            objectToDb[field?.slug] = value
                            // console.log("~~~>> multiselect", value)
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

                            objectToDb[field?.slug] = value

                        } else if (field.type === "LOOKUP" || field.type === "LOOKUPS") {
                            
                            relation = await Relation.findOne({
                                id: field.relation_id
                            })

                            const viewFields = []
                            for(let el of viewFieldIds) {
                                const field = await Field.findOne({
                                    id: el
                                }).lean()

                                if(field) {
                                    viewFields.push(field)
                                }
                            }

                            if (relation && relation.type !== "Many2Many") {
                                let params = {}
                                let payload = {}
                                if (viewFields.length && viewFields.length > 1) {
                                    let values = row[rows[0].indexOf(column_slug)].split(";")
                                    for (let i = 0; i < viewFields.length; i++) {
                                        if (typeof values[i] === "string") {
                                            values[i] = values[i].replaceAll(")", "\)")
                                            values[i] = values[i].replaceAll("(", "\(")
                                            
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
                                           
                                            params[viewField.slug] = RegExp(val, "i")
                                            payload[viewField.slug] = val
                                        } else {
                                            params[viewField.slug] = row[rows[0].indexOf(column_slug)]
                                            payload[viewField.slug] = row[rows[0].indexOf(column_slug)]
                                        }

                                    }
                                }
                                if (Object.keys(params).length > 0) {
                                    const objectFromObjectBuilder = await getSingleWithRelations({
                                        table_slug: relation.table_to,
                                        project_id: req.project_id,
                                        data: params
                                    })
                                    // console.log("test 0.1 ", objectFromObjectBuilder)
                                    if (objectFromObjectBuilder && objectFromObjectBuilder.data) {
                                        if (field.attributes) {
                                            let fieldAttributes = struct.decode(field.attributes)
                                            
                                            if (fieldAttributes && fieldAttributes.autofill && fieldAttributes.autofill.length) {
                                                for (const autoFill of fieldAttributes.autofill) {
                                                    if (autoFill?.field_from?.includes('.')) {
                                                        let splitedAutoFillField = autoFill.field_from.split('.')
                                                        if (splitedAutoFillField && splitedAutoFillField.length) {
                                                            objectToDb[autoFill.field_to] = objectFromObjectBuilder.data[splitedAutoFillField[0]][splitedAutoFillField[1]]
                                                        }
                                                    } else {
                                                        objectToDb[autoFill.field_to] = objectFromObjectBuilder.data[autoFill.field_from]
                                                    }
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
                                        // console.log("test #0.11", payload);
                                        objectToDb[field?.slug] = result?.data?.guid
                                    }
                                    // console.log("test #0.2", objectToDb);
                                    continue
                                }

                            } else if (relation && relation.type == "Many2Many") {
                                let values = row[rows[0].indexOf(column_slug)].split(",")
                                // console.log("val::", row[rows[0].indexOf(column_slug)], values)
                                // console.log("~~~~ > values", values)
                                let params = {}
                                let payload = {}
                                if (viewFields.length && viewFields.length > 1) {
                                    for (let i = 0; i < viewFields.length; i++) {
                                        if (typeof values[i] === "string" && isNaN(values[i])) {
                                            values[i] = values[i].replaceAll(")", "\)")
                                            values[i] = values[i].replaceAll("(", "\(")

                                            params[viewFields[i].slug] = RegExp(values[i], "i")
                                            payload[viewFields[i].slug] = values[i]
                                        } else {
                                            params[viewFields[i].slug] = values[i]
                                            payload[viewFields[i].slug] = values[i]
                                        }

                                    }
                                } else if (viewFields.length) {
                                    for (let val of values) {
                                        params = {}
                                        if (typeof val === "string" && isNaN(val)) {
                                            if (val) {
                                                val = val.replaceAll(")", "\\)")
                                                val = val.replaceAll("(", "\\(")
                                            }
                                           
                                            params[viewFields[0].slug] = val
                                            payload[viewFields[0].slug] = val
                                        } else {
                                            params[viewFields[0].slug] = val
                                            payload[viewFields[0].slug] = val
                                        }

                                        if (Object.keys(params).length > 0) {
                                            const objectFromObjectBuilder = await getSingleWithRelations({
                                                table_slug: relation.table_to,
                                                project_id: req.project_id,
                                                data: params
                                            })
                                            // console.log("test #1.1", objectFromObjectBuilder)
                                            if (objectFromObjectBuilder && objectFromObjectBuilder.data) {
                                                if (field.attributes) {
                                                    let fieldAttributes = struct.decode(field.attributes)
                                                    
                                                    if (fieldAttributes && fieldAttributes.autofill && fieldAttributes.autofill.length) {
                                                        for (const autoFill of fieldAttributes.autofill) {
                                                            if (autoFill?.field_from?.includes('.')) {
                                                                let splitedAutoFillField = autoFill.field_from.split('.')
                                                                if (splitedAutoFillField && splitedAutoFillField.length) {
                                                                    objectToDb[autoFill.field_to] = objectFromObjectBuilder.data[splitedAutoFillField[0]][splitedAutoFillField[1]]
                                                                }
                                                            } else {
                                                                objectToDb[autoFill.field_to] = objectFromObjectBuilder.data[autoFill.field_from]
                                                            }
                                                        }
                                                    }
                                                }
        
                                                if(!objectToDb[field?.slug] || !objectToDb[field?.slug].length) {
                                                    objectToDb[field?.slug] = [ objectFromObjectBuilder.data.guid ]
                                                } else {
                                                    objectToDb[field?.slug] = [ ...objectToDb[field?.slug], objectFromObjectBuilder.data.guid ]
                                                }
                                               
                                            } else {
                                                res = await obj.create({
                                                    project_id: req.project_id,
                                                    table_slug: relation.table_to,
                                                    data: struct.encode(payload)
                                                })
                                                let result = struct.decode(res.data)
                                                // console.log("test #1.2", result)
                                                if(!objectToDb[field?.slug] || !objectToDb[field?.slug].length) {
                                                    objectToDb[field?.slug] = [ result?.data?.guid  ]
                                                } else {
                                                    objectToDb[field?.slug] = [ ...objectToDb[field?.slug], result?.data?.guid  ]
                                                }

                                            }
                                            // console.log("test #1.3", objectToDb);
                                            continue
                                        }

                                    }
                                }
                                
                            }
                        } else if (con.NUMBER_TYPES.includes(field.type)) {
                            let strNumber = value.toString()
                            strNumber = strNumber.replace(/\s,/g, '');
                            let i = 0
                            try {
                                i = Number(strNumber)
                            } catch (error) {
                                logger.error("value: ", strNumber, "error: ", error);
                                i = 0
                            }
                            value = i

                            objectToDb[field?.slug] = value

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

                                objectToDb[field?.slug] = value
                            } else {
                                objectToDb[field?.slug] = value
                            }
                        }
                        // if (value) {
                        //     objectToDb[field?.slug] = value
                        // }

                    }

                    objectToDb['company_service_project_id'] = datas['company_service_project_id']
                    objectToDb['company_service_environment_id'] = datas['company_service_environment_id']
                    objectsToDb.push(objectToDb)
                }

                // console.log(":>>> insert pipeline ", objectsToDb)
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
