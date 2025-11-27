const EventLogs = require("../../models/event_log");
const catchWrapDb = require("../../helper/catchWrapDb");

let NAMESPACE = "storage.event_logs";

let eventLogsStore = {
    getList: catchWrapDb(`${NAMESPACE}.getList`, async(data) => {
        let query = {
            table_slug: data.table_slug,
        }
        
        const event_logs = await EventLogs.find(
            {
                table_slug: data.table_slug,
            },
            null,
            {
                sort: {created_at: -1}
            }
            ).skip(data.offset)
            .limit(data.limit);

        const count = await EventLogs.countDocuments(query);

        return {event_logs, count};
    }
    ),
    getSingle: catchWrapDb(`${NAMESPACE}.getSingle`, async (data) => {
        const event_log = await EventLogs.findOne({id: data.id});

        return event_log;
    }),
};

module.exports = eventLogsStore;
