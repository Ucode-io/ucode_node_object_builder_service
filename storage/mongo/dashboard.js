const Dashboard = require("../../models/dashboard");
const catchWrapDb = require("../../helper/catchWrapDb");

let NAMESPACE = "storage.dashboard";

let dashboardStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {
        const dashboard = new Dashboard(data);

        const response = await dashboard.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
        const dashboard = await Dashboard.updateOne(
            {
                id: data.id, 
            },
            {
                $set: data
            }
        )

        return dashboard;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {        
        let query = {}
        if (data.name) {
            query.name = data.name
        }
        const dashboards = await Dashboard.find(
            query,
            null,
            {
                sort: {created_at: -1}
            }
        ).populate("panels").populate("variables");

        const count = await Dashboard.countDocuments(query);
        return {dashboards, count};
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {     
        const dashboard = await Dashboard.findOne(
        {
            id: data.id
        },
        {
            _id: 0,
            created_at: 0,
            updated_at: 0,
            __v: 0
        }).populate("panels").populate("variables");
        return dashboard;
    }
    ),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const resp = await Dashboard.deleteOne({id: data.id});

        return resp;
    }
    ),
};

module.exports = dashboardStore;
