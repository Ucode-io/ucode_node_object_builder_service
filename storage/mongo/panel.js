const Panel = require("../../models/panel");
const catchWrapDb = require("../../helper/catchWrapDb");


let NAMESPACE = "storage.panel";

let panelStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {
        const panel = new Panel(data);

        const response = await panel.save()

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
        const panel = await Panel.updateOne(
            {
                id: data.id,
            },
            {
                $set: data
            }
        )

        return panel;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {        
        let query = {}
        if (data.title) {
            query.title = data.title
        }
        const panels = await Panel.find(
            query,
            null,
            {
                sort: {created_at: -1}
            }
        )

        const count = await Panel.countDocuments(query);
        return {panels, count};
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {     
        const panel = await Panel.findOne(
        {
            id: data.id
        },
        {
            _id: 0,
            created_at: 0,
            updated_at: 0,
            __v: 0
        });
        return panel;
    }
    ),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const resp = await Panel.deleteOne({id: data.id});

        return resp;
    }
    ),
    updateCoordinates: catchWrapDb(`${NAMESPACE}.updateCoordinates`, async(data) => {

        for (const panelCooridnate of data.panel_coordinates) {

            const coordinates = {
                coordinates: panelCooridnate.coordinates
            }

            await Panel.updateOne(
                {
                    id: panelCooridnate.id,
                },
                {
                    $set: coordinates
                }
            )
        }
        return;
    }
    ),
};

module.exports = panelStore;
