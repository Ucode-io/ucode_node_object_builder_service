const Event = require("../../models/event");
const Table = require("../../models/table");
const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");


let NAMESPACE = "storage.event";

let eventStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async(data) => {
        const event = new Event(data);

        const response = await event.save();

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async(data) => {
    
        const event = await Event.updateOne(
            {
                id: data.id,
            },
            {
                $set: data
            }
        )
        
        return event;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {        
        let query = {
            table_slug: data.table_slug,
        }
        const events = await Event.find(
            {
                table_slug: data.table_slug,
            },
            null,
            {
                sort: {created_at: -1}
            });

        const count = await Event.countDocuments(query);
        return {events, count};
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getSingle`, async (data) => {
        const event = await Event.findOne({id: data.id});

        return event;
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async(data) => {
        const event = await Event.deleteOne({id: data.id});

        return event;
    }
    ),
};

module.exports = eventStore;
