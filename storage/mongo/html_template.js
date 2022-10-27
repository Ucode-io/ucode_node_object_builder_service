const HtmlTemplate = require("../../models/html_template");
const Table = require("../../models/table");
const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");


let NAMESPACE = "storage.html_template";

let htmlTemplateStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {
        const htmlTemplate = new HtmlTemplate(data);

        const response = await htmlTemplate.save();

        const resp = await Table.updateOne({
            slug: data.table_slug,
        },
        {
            $set: {
                is_changed: true
            }
        })

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
        const htmlTemplate = await HtmlTemplate.updateOne(
            {
                id: data.id,
            },
            {
                $set: data
            }
        )

        const resp = await Table.updateOne({
            slug: data.table_slug,
        },
        {
            $set: {
                is_changed: true
            }
        })


        return htmlTemplate;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {        
        let query = {
            table_slug: data.table_slug,
        }
        const htmlTemplates = await HtmlTemplate.find(
            {
                table_slug: data.table_slug, 
            },
            null,
            {
                sort: {created_at: -1}
            }
        );
        const count = await HtmlTemplate.countDocuments(query);
        return {htmlTemplates, count};
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {     
        const htmlTemplate = await HtmlTemplate.findOne(
        {
            id: data.id
        },
        {
            _id: 0,
            created_at: 0,
            updated_at: 0,
            __v: 0
        });
        return htmlTemplate;
    }
    ),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const htmlTemplate = await HtmlTemplate.findOne({id:data.id})

        await Table.updateOne({
            slug: htmlTemplate.table_slug,
        },
        {
            $set: {
                is_changed: true
            }
        })

        const resp = await HtmlTemplate.deleteOne({id: data.id});

        return resp;
    }
    ),
};

module.exports = htmlTemplateStore;
