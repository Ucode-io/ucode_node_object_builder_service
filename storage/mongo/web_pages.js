const WebPage = require("../../models/web_pages");
const catchWrapDb = require("../../helper/catchWrapDb");

let NAMESPACE = "storage.web_page"

let webPage = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        const webPages = new WebPage(data);
        var response = await webPages.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        const webPageUpdate = await WebPage.findOneAndUpdate(
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
        return webPageUpdate;
    }),
    getById: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        const webPage = await WebPage.findOne({
            id: data.id,
        })

        return webPage
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        const webPages = await WebPage.find({

        }).skip(data.offset)
            .limit(data.limit);

        const count = await WebPage.countDocuments();
        return {web_pages: webPages, count: count};
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        const webPages = await WebPage.deleteOne({
            id: data.id,
        })
    }),
};

module.exports = webPage;