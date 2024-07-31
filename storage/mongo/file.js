const catchWrapDb = require("../../helper/catchWrapDb");
const mongoPool = require('../../pkg/pool');
const cfg = require("../../config/index");
const fs = require('fs');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const { Client } = require ('minio')
const path = require('path');
const { struct } = require('pb-util');
const { v4 } = require("uuid");




let NAMESPACE = "storage.file";

let fileStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {

        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['object_builder_service.file']
        data.createdAt = new Date();
        const response = await Files.create(data);

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['object_builder_service.file']

        const file = await Files.updateOne(
            {
                id: data.id,
            },
            {
                $set: {
                    description: data.description,
                    file_name_download: data.file_name_download,
                    tags: data.tags,
                    title: data.title
                }
            }
        )

        return file;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {   
        
        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['object_builder_service.file']

        let query = {
            storage: data.folder_name
        }
        if (data.search != "") {
            query = {
                    title: { $regex: ".*" + data.search + ".*", $options: "i" }
                    }
        }
        switch (data.sort) {
            case "asc":
                query = {
                    ...query,
                    sort: { createdAt: -1 }
                };
                break;
            case "desc":
                query = {
                    ...query,
                    sort: { createdAt: 1 }
                };
                break;
            }
        const files = await Files.find(query, {});

        const count = await Files.countDocuments(query);
        return {files, count};
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {   
        
        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['object_builder_service.file']
        
        const file = await Files.findOne(
        {
            id: data.id
        },
        {
            _id: 0,
            created_at: 0,
            updated_at: 0,
            __v: 0
        });
        return file;
    }
    ),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const mongoConn = await mongoPool.get(data.project_id)
        const Files = mongoConn.models['object_builder_service.file']

        const resp = await Files.deleteMany({id: {$in: data.ids}});

        return resp;
    }
    ),
    wordTemplate: catchWrapDb(`${NAMESPACE}.wordTemplate`, async(req) => {
        try {
            let data = struct.decode(req.data)

            console.log('data', JSON.stringify(data))

            let name1 = '1_Иштирокчилар_умумий_йиғилиши_протокол.docx'
            let genName1 = '1_Иштирокчилар_умумий_йиғилиши_протокол_gen'+v4().toString() +'.docx'
            let name2 = '2_Таъсис_шартномаси_учр_договор.docx'
            let genName2 = '2_Таъсис_шартномаси_учр_договор_gen' + v4().toString() + '.docx'
            let name3 = '3.Устав.docx'
            let genName3 = '3.Устав_gen' + v4().toString() + '.docx'
            let name4 = '4.Ишончли_бошқарув_шартномаси.docx'
            let genName4 = '4.Ишончли_бошқарув_шартномаси_gen' + v4().toString() + '.docx'
            let files = []

            const filename1 = path.join(__dirname, '..', '..', 'document', name1);

            const content = fs.readFileSync(filename1);
            const zip = new PizZip(content);
            const doc = new Docxtemplater();
            doc.loadZip(zip);
            doc.setData(data)

            try {
                doc.render();
            } catch (error) {
                console.error('Error rendering document:', error);
                throw error
            }
            const buf = doc.getZip().generate({ type: 'nodebuffer' });
            let genFileName1 = path.join(__dirname, '..', '..', 'document', genName1);
            fs.writeFileSync(genFileName1, buf);

            //2nd file
            const filename2 = path.join(__dirname, '..', '..', 'document', name2);

            const content2 = fs.readFileSync(filename2);
            const zip2 = new PizZip(content2);
            const doc2 = new Docxtemplater();
            doc2.loadZip(zip2);
            doc2.setData(data)

            try {
                doc2.render();
            } catch (error) {
                console.error('Error rendering document:', error);
                throw error
            }

            const buf2 = doc2.getZip().generate({ type: 'nodebuffer' });
            let genFileName2 = path.join(__dirname, '..', '..', 'document', genName2);
            fs.writeFileSync(genFileName2, buf2);

            // 3rd file
            const filename3 = path.join(__dirname, '..', '..', 'document', name3);

            const content3 = fs.readFileSync(filename3);
            const zip3 = new PizZip(content3);
            const doc3 = new Docxtemplater();
            doc3.loadZip(zip3);
            doc3.setData(data)

            try {
                doc3.render();
            } catch (error) {
                console.error('Error rendering document:', error);
                throw error
            }

            const buf3 = doc3.getZip().generate({ type: 'nodebuffer' });
            let genFileName3 = path.join(__dirname, '..', '..', 'document', genName3);
            fs.writeFileSync(genFileName3, buf3);

            // 4rd file
            const filename4 = path.join(__dirname, '..', '..', 'document', name4);

            const content4 = fs.readFileSync(filename4);
            const zip4 = new PizZip(content4);
            const doc4 = new Docxtemplater();
            doc4.loadZip(zip4);
            doc4.setData(data)

            try {
                doc4.render();
            } catch (error) {
                console.error('Error rendering document:', error);
                throw error
            }

            const buf4 = doc4.getZip().generate({ type: 'nodebuffer' });
            let genFileName4 = path.join(__dirname, '..', '..', 'document', genName4);
            fs.writeFileSync(genFileName4, buf4);

            // let ssl = true
            // if (cfg.minioSSL !== true) {
            //     ssl = false
            // }

            var minioClient = new Client({
                endPoint: cfg.minioEndpoint,
                useSSL: false,
                accessKey: cfg.minioAccessKeyID,
                secretKey: cfg.minioSecretAccessKey,
                port: Number(cfg.minioPort),
            })

            minioClient.putObject('wayll', genName1, buf, function (error, etag) {
                if (error) {
                    return console.log(error);
                }
                fs.unlink(genFileName1, (err => {
                    if (err) console.log(err);
                    else {
                    }
                }));
            })

            //2nd file
            minioClient.putObject('wayll', genName2, buf2, function (error, etag) {
                if (error) {
                    return console.log(error);
                }
                fs.unlink(genFileName2, (err => {
                    if (err) console.log(err);
                    else {
                    }
                }));
            })

            //3rd file
            minioClient.putObject('wayll', genName3, buf3, function (error, etag) {
                if (error) {
                    return console.log(error);
                }
                fs.unlink(genFileName3, (err => {
                    if (err) console.log(err);
                    else {
                    }
                }));
            })

            //4rd file
            minioClient.putObject('wayll', genName4, buf4, function (error, etag) {
                if (error) {
                    return console.log(error);
                }
                fs.unlink(genFileName4, (err => {
                    if (err) console.log(err);
                    else {
                    }
                }));
            })


            files.push(cfg.minioEndpoint + "/wayll/" + genName1)
            files.push(cfg.minioEndpoint + "/wayll/" + genName2)
            files.push(cfg.minioEndpoint + "/wayll/" + genName3)
            files.push(cfg.minioEndpoint + "/wayll/" + genName4)
            
            return { files: files };
        } catch (error) {
            throw error;
        }
    }),
};

module.exports = fileStore;
