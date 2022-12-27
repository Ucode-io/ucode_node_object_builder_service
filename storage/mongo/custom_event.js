const CustomEvent = require("../../models/custom_event");
const Field = require("../../models/field");
const Function = require("../../models/function");
const Table = require("../../models/table");
const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const table = require("../../models/table");
const field = require("../../models/field");
const ObjectBuilder = require("../../models/object_builder");


let NAMESPACE = "storage.custom_event";

let customEventStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {
        const custom_event = new CustomEvent(data);

        const response = await custom_event.save();

        const func = await Function.findOne({
            id: data.event_path
        });
        const table = await Table.findOne({
            slug: data.table_slug
        });
        const fieldRequest = {
            id: v4(),
            slug: func.path + "_disable",
            label: func.name,
            table_id: table.id,
            type: "SWITCH",
            attributes: {
                icon: "",
                placeholder: ""
            }
        };
        const field = new Field(fieldRequest);
        const resp = await field.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
    
        const custom_event = await CustomEvent.updateOne(
            {
                id: data.id,
            },
            {
                $set: data
            }
        )
        
        return custom_event;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {        
        let query = {
            table_slug: data.table_slug,
        }
        const custom_events = await CustomEvent.find(
            {
                table_slug: data.table_slug,
            },
            null,
            {
                sort: {created_at: -1}
            }).populate('functions');
        const count = await CustomEvent.countDocuments(query);
        return {custom_events, count};
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getSingle`, async (data) => {
        const custom_event = await CustomEvent.findOne({id: data.id});

        return custom_event;
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const resp = await CustomEvent.findOne({id: data.id})
        const table = await Table.findOne({slug: resp.table_slug})
        const custom_event = await CustomEvent.deleteOne({id: data.id});
        const func = await Function.findOne({id: resp.event_path})
        await Field.deleteOne({
            table_id: table.id,
            slug: func.path+"_disable"
        })
        return custom_event;
    }),
    updateCustomEventByFunctionId: catchWrapDb(`${NAMESPACE}.updateCustomEventByFunctionId`, async(data) => {
        let custom_event = await CustomEvent.findOneAndUpdate(
            {
                event_path: data.function_id
            },
            {
                $set: {
                    disable: true
                }
            }
        )
        let field_slug = data.field_slug
        const tableInfo = (await ObjectBuilder(true, data.project_id))[custom_event.table_slug]
        for (const id of data.object_ids) {
            let object = await tableInfo.models.findOne({
                guid: id
            })
            object[field_slug] = true
            const objectUpdate = await tableInfo.models.updateOne(
                {
                    guid: id
                },
                {
                    $set: object
                }
                
            )
        }
        custom_event = await CustomEvent.updateMany(
            {
                table_slug: custom_event.table_slug,
                event_path: {$ne: data.function_id}
            },
            {
                $set: {
                    disable: false
                }
            }
        )
        return custom_event
    })
};

module.exports = customEventStore;
