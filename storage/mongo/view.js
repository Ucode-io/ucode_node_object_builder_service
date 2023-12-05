const catchWrapDb = require("../../helper/catchWrapDb");
const Minio = require('minio');
const fs = require("fs");
const cfg = require("../../config/index");
const { struct } = require('pb-util');
var wkhtmltopdf = require('wkhtmltopdf');
var Eta = require("eta");
const ObjectBuilder = require("../../models/object_builder");
const objectBuilderStore = require("./object_builder");
const numberFormatter = require("../../helper/formatNumber")
const mongoPool = require('../../pkg/pool');
var JsBarcode = require('jsbarcode');
const { DOMImplementation, XMLSerializer } = require('xmldom');
const { v4 } = require("uuid");
const xmlSerializer = new XMLSerializer();
const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const { VIEW_TYPES } = require('../../helper/constants')
const os = require('os')

console.log()
// const mongoConn = await mongoPool.get(data.project_id)
// const Table = mongoConn.models['Table']
// const Field = mongoConn.models['Field']
// const Section = mongoConn.models['Section']
// const App = mongoConn.models['App']
// const View = mongoConn.models['View']
// const Relation = mongoConn.models['Relation']
// const ViewRelation = mongoConn.models['ViewRelation']



let NAMESPACE = "storage.view";

let viewStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const View = mongoConn.models['View']
            const Role = mongoConn.models['role']
            const ViewPermission = mongoConn.models['view_permission']

            if (data.attributes) {
                data.attributes = struct.decode(data.attributes)
            }

            if(data.type == VIEW_TYPES.BOARD) {
                await BoardOrderChecker(mongoConn, data.table_slug)
            }
            const response = await View.create(data)

            const resp = await Table.updateOne({
                slug: data.table_slug
            },
                {
                    $set: {
                        is_changed: true,
                        [`is_changed_by_host.${os.hostname()}`]: true
                    }
            })

            const roles = await Role.find()
            let query = []
            for (let el of roles) {
                query.push({
                    guid: v4(),
                    view: true,
                    edit: true,
                    delete: true,
                    role_id: el.guid,
                    view_id: response.id
                })
            }
            await ViewPermission?.insertMany(query)

            return response;

        } catch (err) {
            throw err
        }



    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const View = mongoConn.models['View']

            if (data.attributes) {
                data.attributes = struct.decode(data.attributes)
            }

            if(data.type == VIEW_TYPES.BOARD) {
                await BoardOrderChecker(mongoConn, data.table_slug)
            }

            const view = await View.findOneAndUpdate(
                {
                    id: data.id,
                },
                {
                    $set: data
                },
                {
                    new: true
                }
            )

            const resp = await Table.findOneAndUpdate({
                slug: data.table_slug,
            },
                {
                    $set: {
                        is_changed: true,
                        [`is_changed_by_host.${os.hostname()}`]: true
                    }
                },
                {
                    new: true
                })

            console.log("\n\n HOST table view", data.table_slug, resp)

            return view;

        } catch (err) {
            throw err
        }
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const View = mongoConn.models['View']

            let query = {
                table_slug: data.table_slug,
            }
            const views = await View.find(
                {
                    table_slug: data.table_slug,
                },
                {
                    created_at: 0,
                    updated_at: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    _id: 0,
                    __v: 0
                },
                {
                    sort: { order: 1 }
                }
            ).populate({ path: "view_permissions", $match: { role_id: data.role_id } }).lean();
            views.forEach(el => {
                if (el.attributes) {
                    el.attributes["view_permissions"] = el["view_permissions"]
                    el.attributes = struct.encode(el)
                }
            })

            const count = await View.countDocuments(query);
            return { views, count };

        } catch (err) {
            throw err
        }
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getSingle`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const View = mongoConn.models['View']

            const view = await View.findOne(
                {
                    id: data.id
                },
                {
                    _id: 0,
                    created_at: 0,
                    updated_at: 0,
                    __v: 0
                });
            if (view.attributes) {
                view.attributes = struct.encode(view.attributes)
            }
            return view;

        } catch (err) {
            throw err
        }
    }
    ),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Table = mongoConn.models['Table']
            const View = mongoConn.models['View']

            const vieww = await View.findOne({ id: data.id })

            await Table.updateOne({
                slug: vieww.table_slug,
            },
                {
                    $set: {
                        is_changed: true
                    }
                })

            const resp = await View.deleteOne({ id: data.id });

            return vieww;

        } catch (err) {
            throw err
        }
    }
    ),
    convertHtmlToPdf: catchWrapDb(`${NAMESPACE}.convertHtmlToPdf`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

            const decodedData = struct.decode(data.data)

            const object_builder = await ObjectBuilder(true, data.project_id)

            // console.log("TEST:::::::::::::1")
            let filename = "document_" + Math.floor(Date.now() / 1000) + ".pdf"
            link = "https://" + cfg.minioEndpoint + "/docs/" + filename

            var html = data.html
            let patientIdField;
            let output;
            // console.log("TEST:::::::::::::2")
            if (decodedData.linked_table_slug && decodedData.linked_object_id) {
                data.html = data.html.replaceAll('[??', '{')
                data.html = data.html.replaceAll('??]', '}')
                data.html = data.html.replaceAll('&lt;', '<')
                data.html = data.html.replaceAll('&gt;', '>')
                data.html = data.html.replaceAll('&nbsp;', ' ')
                data.html = data.html.replaceAll('&amp;', '&')
                data.html = data.html.replaceAll('&quot;', '"')
                data.html = data.html.replaceAll('&apos;', `'`)
                const tableInfo = object_builder[decodedData.linked_table_slug]
                // patientIdField = tableInfo.fields.find(el => el.slug === "patients_id")

                let relations = await Relation.find({
                    table_from: decodedData.linked_table_slug,
                    type: "Many2One"
                })

                const relationsM2M = await Relation.find({
                    $or: [{
                        table_from: decodedData.linked_table_slug
                    },
                    {
                        table_to: decodedData.linked_table_slug
                    }],
                    $and: [{
                        type: "Many2Many"
                    }]
                })
                // console.log("TEST:::::::::::::3")
                let relatedTable = []
                for (const relation of relations) {
                    const field = await Field.findOne({
                        relation_id: relation.id
                    })
                    if (field) {
                        relatedTable.push(field?.slug + "_data")
                    }
                }
                for (const relation of relationsM2M) {
                    if (relation.table_to === decodedData.linked_table_slug) {
                        relation.field_from = relation.field_to
                    }
                    const field = await Field.findOne({
                        slug: relation.field_from,
                        relation_id: relation.id
                    })
                    if (field) {
                        relatedTable.push(field?.slug + "_data")
                    }
                }
                console.log("TEST:::::::::::::4")
                output = await tableInfo.models.findOne({
                    guid: decodedData.linked_object_id
                },
                    {
                        created_at: 0,
                        updated_at: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        _id: 0,
                        __v: 0
                    }).populate(relatedTable).lean();
                // output = await changeDateFormat(output, tableInfo.fields)

                for (const it of tableInfo.fields) {
                    if (it.type === "CODABAR") {
                        JsBarcode(svgNode, output[it.slug], {
                            xmlDocument: document,
                        });
                        const base64_barcode = Buffer.from(xmlSerializer.serializeToString(svgNode)).toString('base64');
                        output[it.slug] = "<figure class=\"image image_resized\" style=\"width: 10%\"><img src=\"data:image/svg+xml;base64," +
                            base64_barcode +
                            "\"/></figure>"
                        // console.log(output[it.slug])
                    }
                }

                relations = await Relation.find({
                    table_to: decodedData.linked_table_slug,
                    type: "Many2One"
                })
                // console.log("TEST:::::::::::::5")
                for (const relation of relations) {
                    // console.log("relation::::", relation)
                    let relation_field = decodedData.linked_table_slug + "_id"
                    // let m2mrelation_field = decodedData.linked_table_slug + "_ids"

                    let response = await object_builder[relation.table_from].models.find({
                        // '$or': [
                        //     { [relation_field]: decodedData.linked_object_id },
                        //     { [m2mrelation_field]: decodedData.linked_object_id }
                        // ]
                        [relation_field]: decodedData.linked_object_id
                    })

                    if (response) {
                        output[relation.table_from] = response
                    } else {
                        output[relation.table_from] = []
                    }
                }

                html = Eta.render(data.html, output)

                html = html.replaceAll('[??', '{')
                html = html.replaceAll('??]', '}')
                html = html.replaceAll('&lt;', '<')
                html = html.replaceAll('&gt;', '>')
                html = html.replaceAll('&nbsp;', ' ')
                html = html.replaceAll('&amp;', '&')
                html = html.replaceAll('&quot;', '"')
                html = html.replaceAll('&apos;', `'`)
            }


            if (!decodedData.page_height && !decodedData.page_width) {
                decodedData.page_height = "297"
                decodedData.page_width = "210"
            }

            // console.log("TEST:::::::::::::6")
            await new Promise((resolve, reject) => {
                wkhtmltopdf(html, { output: filename, spawnOptions: { shell: true }, pageHeight: decodedData.page_height, pageWidth: decodedData.page_width }, () => {
                    let ssl = true
                    // if (cfg.minioSSL !== "true") {
                    //     ssl =false
                    // }
                    var minioClient = new Minio.Client({
                        endPoint: cfg.minioEndpoint,
                        useSSL: ssl,
                        accessKey: cfg.minioAccessKeyID,
                        secretKey: cfg.minioSecretAccessKey
                    });
                    // console.log("TEST:::::::::::::7")
                    var metaData = {
                        'Content-Type': "application/pdf",
                        'Content-Language': 123,
                        'X-Amz-Meta-Testing': 1234,
                        'example': 5678
                    }

                    let filepath = "./" + filename


                    //file exists
                    minioClient.fPutObject("docs", filename, filepath, metaData, function (error, etag) {
                        if (error) {
                            return console.log(error);
                        }
                        // console.log("TEST:::::::::::::8")
                        // console.log("uploaded successfully")
                        fs.stat(filename, async (err, stats) => {
                            if (err) {
                                console.log(err)
                            } else {
                                let doc = {}
                                splitedFielName = filename.split(".")
                                doc.file_link = link
                                doc[decodedData.table_slug + "_id"] = decodedData.object_id
                                doc.size = stats.size
                                doc.type = splitedFielName[splitedFielName.length - 1]
                                doc.name = filename
                                doc.date = new Date().toISOString()
                                doc.dynamic_author = {
                                    [decodedData.author_table + "_id"]: decodedData.author_id
                                }
                                if (patientIdField) {
                                    doc[patientIdField.slug] = output?.[patientIdField.slug]
                                }
                                if (decodedData.tags) {
                                    doc.tags = decodedData.tags.split(",")
                                }
                                let encodedData = struct.encode(doc)
                                let request = {
                                    table_slug: "file",
                                    project_id: data.project_id,
                                    data: encodedData
                                }
                                await objectBuilderStore.create(request)
                            }
                        })
                        // console.log("TEST:::::::::::::9")
                        fs.unlink(filename, (err => {
                            if (err) console.log(err);
                            else {
                                // console.log("Deleted file: ", filename);

                                resolve()

                            }
                        }));
                    });
                });
            })



            return { link }

        } catch (err) {
            throw err
        }
    }),
    convertTemplateToHtml: catchWrapDb(`${NAMESPACE}.convertTemplateToHtml`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Field = mongoConn.models['Field']
            const Relation = mongoConn.models['Relation']

            const decodedData = struct.decode(data.data)

            const object_builder = await ObjectBuilder(true, data.project_id)

            let filename = "document_" + Math.floor(Date.now() / 1000) + ".pdf"
            link = "https://" + "cdn.medion.uz" + "/docs/" + filename
            // console.log("TEST::::::::1")
            var html = data.html

            data.html = data.html.replaceAll('[??', '{')
            data.html = data.html.replaceAll('??]', '}')
            data.html = data.html.replaceAll('&lt;', '<')
            data.html = data.html.replaceAll('&gt;', '>')
            data.html = data.html.replaceAll('&nbsp;', ' ')
            data.html = data.html.replaceAll('&amp;', '&')
            data.html = data.html.replaceAll('&quot;', '"')
            data.html = data.html.replaceAll('&apos;', `'`)

            if (decodedData.linked_table_slug && decodedData.linked_object_id) {
                // data.html = data.html.replace('[??', '{')
                // data.html = data.html.replace('??]', '}')
                const tableInfo = object_builder[decodedData.linked_table_slug]
                // console.log("TEST::::::::2")
                let relations = await Relation.find({
                    table_from: decodedData.linked_table_slug,
                    type: "Many2One"
                })
                // console.log("TEST::::::::3")
                const relationsM2M = await Relation.find({
                    $or: [{
                        table_from: decodedData.linked_table_slug
                    },
                    {
                        table_to: decodedData.linked_table_slug
                    }],
                    $and: [{
                        type: "Many2Many"
                    }]
                })
                // console.log("TEST::::::::4")
                let relatedTable = []
                for (const relation of relations) {
                    const field = await Field.findOne({
                        relation_id: relation.id
                    })
                    if (field) {
                        relatedTable.push(field?.slug + "_data")
                    }
                }
                for (const relation of relationsM2M) {
                    if (relation.table_to === decodedData.linked_table_slug) {
                        relation.field_from = relation.field_to
                    }
                    const field = await Field.findOne({
                        slug: relation.field_from,
                        relation_id: relation.id
                    })
                    if (field) {
                        relatedTable.push(field?.slug + "_data")
                    }
                }
                let output = await tableInfo.models.findOne({
                    guid: decodedData.linked_object_id
                },
                    {
                        created_at: 0,
                        updated_at: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        _id: 0,
                        __v: 0
                    }).populate(relatedTable).lean();

                for (const it of tableInfo.fields) {
                    if (it.type === "CODABAR") {
                        JsBarcode(svgNode, output[it.slug], {
                            xmlDocument: document,
                        });
                        const base64_barcode = Buffer.from(xmlSerializer.serializeToString(svgNode)).toString('base64');
                        output[it.slug] = "<figure class=\"image image_resized\" style=\"width: 10%\"><img src=\"data:image/svg+xml;base64," +
                            base64_barcode +
                            "\"/></figure>"
                        // console.log(output[it.slug])
                    }
                }
                // console.log("TEST::::::::7")
                relations = await Relation.find({
                    table_to: decodedData.linked_table_slug,
                    type: "Many2One"
                })

                for (const relation of relations) {
                    // console.log("relation::::", relation)
                    let relation_field = decodedData.linked_table_slug + "_id"
                    // let m2mrelation_field = decodedData.linked_table_slug + "_ids"

                    let response = await object_builder[relation.table_from].models.find({
                        // '$or': [
                        //     { [relation_field]: decodedData.linked_object_id },
                        //     { [m2mrelation_field]: decodedData.linked_object_id }
                        // ]
                        [relation_field]: decodedData.linked_object_id
                    })

                    if (response) {
                        output[relation.table_from] = response
                    } else {
                        output[relation.table_from] = []
                    }
                }


                // console.log("output:::::", output)
                for (let key in output) {
                    if (typeof (output[key]) == "number") {
                        output[key] = numberFormatter(output[key])
                    }
                }
                // console.log("TEST::::::::8", output)
                html = Eta.render(data.html, output)
                // console.log("TEST::::::::9")
                html = html.replaceAll('[??', '{')
                html = html.replaceAll('??]', '}')
                html = html.replaceAll('&lt;', '<')
                html = html.replaceAll('&gt;', '>')
                html = html.replaceAll('&nbsp;', ' ')
                html = html.replaceAll('&amp;', '&')
                html = html.replaceAll('&quot;', '"')
                html = html.replaceAll('&apos;', `'`)
            }
            return { html }

        } catch (err) {
            throw err
        }
    }),
    updateViewOrder: catchWrapDb(`${NAMESPACE}.updateViewOrder`, async (data) => {
        console.log("data::::", data)
        try {
            const mongoConn = await mongoPool.get(data.project_id)

            const View = mongoConn.models['View']
            const Table = mongoConn.models['Table']

            let updateViewOrders = []
            let i = 0
            for (const id of data.ids) {
                updateViewOrders.push({
                    updateOne: {
                        filter: { id: id },
                        update: { order: i }
                    }
                })
                i += 1
            }
            await View.bulkWrite(updateViewOrders)
            await Table.updateOne({
                slug: data.table_slug
            }, {
                $set: { is_changed: true },
            })
            return;
        } catch (err) {
            throw err
        }
    })
};

module.exports = viewStore;
