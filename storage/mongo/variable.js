const Variable = require("../../models/variable");
const catchWrapDb = require("../../helper/catchWrapDb");


let NAMESPACE = "storage.variable";

let variableStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {
        const variable = new Variable(data);

        const response = await variable.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
        const variable = await Variable.updateOne(
            {
                id: data.id,
            },
            {
                $set: data
            }
        )

        return variable;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {        
        let query = {}
        if (data.slug) {
            query.slug = data.slug
        }
        if (data.dashboard_id) {
            query.dashboard_id = data.dashboard_id
        }
        const variables = await Variable.find(
            query,
            null,
            {
                sort: {created_at: -1}
            }
        );

        const count = await Variable.countDocuments(query);
        return {variables, count};
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {     
        const variable = await Variable.findOne(
        {
            id: data.id
        },
        {
            _id: 0,
            created_at: 0,
            updated_at: 0,
            __v: 0
        });
        return variable;
    }
    ),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const resp = await Variable.deleteOne({id: data.id});

        return resp;
    }
    ),
};

module.exports = variableStore;
