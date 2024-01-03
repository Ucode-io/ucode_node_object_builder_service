const catchWrapDb = require("../../helper/catchWrapDb");
const { v4 } = require("uuid");
const ObjectBuilder = require("../../models/object_builder");
const mongoPool = require("../../pkg/pool");
const AddPermission = require("../../helper/addPermission");
const { struct } = require("pb-util");
const { VERSION_SOURCE_TYPES_MAP, ACTION_TYPE_MAP } = require("../../helper/constants")

let NAMESPACE = "storage.custom_event";

let customEventStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id);
        if (data.attributes) {
            data.attributes = struct.decode(data.attributes);
        }

        const CustomEvent = mongoConn.models["CustomEvent"];
        const Table = mongoConn.models["Table"];
        const Function = mongoConn.models["function_service.function"];
        const Field = mongoConn.models["Field"];
        const History = mongoConn.models['object_builder_service.version_history']

        const custom_event = new CustomEvent(data);

        const response = await custom_event.save();

        const func = await Function.findOne({
            id: data.event_path,
        });
        const table = await Table.findOne({
            slug: data.table_slug,
        });
        
        const fieldRequest = {
            id: v4(),
            slug: func.path + "_disable",
            label: func.name,
            table_id: table.id,
            type: "SWITCH",
            attributes: {
                icon: "",
                placeholder: "",
            },
        };
        let fieldPermissions = [];
        const actionPermissionTable = (
            await ObjectBuilder(true, data.project_id)
        )["action_permission"];
        const roleTable = (await ObjectBuilder(true, data.project_id))["role"];
        const roles = await roleTable?.models.find();
        for (const role of roles) {
            let permission = {
                permission: true,
                table_slug: data.table_slug,
                custom_event_id: custom_event.id,
                role_id: role.guid,
            };
            const fieldPermission = new actionPermissionTable.models(
                permission
            );
            fieldPermissions.push(fieldPermission);
        }
        await actionPermissionTable.models.insertMany(fieldPermissions);
        const field = new Field(fieldRequest);
        const resp = await field.save();

        await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.ACTION, action_type: ACTION_TYPE_MAP.CREATE, current: response })

        return response;
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id);
        const History = mongoConn.models['object_builder_service.version_history']
        const CustomEvent = mongoConn.models["CustomEvent"];

        if (data.attributes) {
            data.attributes = struct.decode(data.attributes);
        }

        const beforeUpdate = await CustomEvent.findOne({ id: data.id })
        if(!beforeUpdate) {
            throw new Error("Action not found with given id")
        }
        const custom_event = await CustomEvent.findOneAndUpdate(
            {
                id: data.id,
            },
            {
                $set: data,
            },
            {
                new: true
            }
        );
        let actionPermissions = (await ObjectBuilder(true, data.project_id))["action_permission"]
        await actionPermissions.models.updateMany({ custom_event_id: data.id }, { $set: { label: data.label } })

        await History.create({ action_source: VERSION_SOURCE_TYPES_MAP.ACTION, action_type: ACTION_TYPE_MAP.UPDATE, current: custom_event, previus: beforeUpdate })

        return custom_event;
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id);
        const CustomEvent = mongoConn.models["CustomEvent"];
        // console.log(">>>>>>>>> custom_event test 1")
        let query = {
            table_slug: data.table_slug,
        };
        if (data.method) {
            query.method = data.method;
        }
        // console.log(">>>>>>>>> custom_event test 2")
        const customEvents = await CustomEvent.find(
            {
                $and: [query],
            },
            {
                created_at: 0,
                updated_at: 0,
                createdAt: 0,
                updatedAt: 0,
                _id: 0,
                __v: 0,
            },
            {
                sort: { created_at: -1 },
            }
        ).populate("functions");
        // console.log(">>>>>>>>> custom_event test 3")
        customEvents.forEach((el) => {
            if (el.attributes) el.attributes = struct.encode(el.attributes);
        });
        // console.log(">>>>>>>>> custom_event test 4")
        let customEventWithPermission = await AddPermission.toCustomEvent(
            customEvents,
            data.role_id,
            data.table_slug,
            data.project_id
        );
        // console.log(">>>>>>>>> custom_event test 5")
        const count = await CustomEvent.countDocuments(query);
        // console.log(">>>>>>>>> custom_event test 6")
        return { custom_events: customEventWithPermission, count: count };
    }),
    getSingle: catchWrapDb(`${NAMESPACE}.getSingle`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id);
        const CustomEvent = mongoConn.models["CustomEvent"];

        const custom_event = await CustomEvent.findOne({ id: data.id });

        return custom_event;
    }),
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        const mongoConn = await mongoPool.get(data.project_id);
        const CustomEvent = mongoConn.models["CustomEvent"];
        const Table = mongoConn.models["Table"];
        const Function = mongoConn.models["function_service.function"];
        const Field = mongoConn.models["Field"];
        const actionPermissionTable = (
            await ObjectBuilder(true, data.project_id)
        )["action_permission"];

        const resp = await CustomEvent.findOne({ id: data.id });
        const table = await Table.findOne({ slug: resp.table_slug });
        const custom_event = await CustomEvent.findOneAndDelete({ id: data.id });
        const func = await Function.findOne({ id: resp.event_path });
        await Field.deleteOne({
            table_id: table.id,
            slug: func.path + "_disable",
        });
        actionPermissionTable.models.deleteMany({ custom_event: data.id });
        return custom_event;
    }),
    updateCustomEventByFunctionId: catchWrapDb(
        `${NAMESPACE}.updateCustomEventByFunctionId`,
        async (data) => {
            const mongoConn = await mongoPool.get(data.project_id);
            const CustomEvent = mongoConn.models["CustomEvent"];

            let custom_event = await CustomEvent.findOneAndUpdate(
                {
                    event_path: data.function_id,
                },
                {
                    $set: {
                        disable: true,
                    },
                }
            );
            const tableInfo = (await ObjectBuilder(true, data.project_id))[
                custom_event.table_slug
            ];
            for (const id of data.object_ids) {
                await tableInfo.models.findOneAndUpdate(
                    {
                        guid: id,
                    },
                    {
                        $set: { [data.field_slug]: true },
                    }
                );
            }
            return {};
        }
    ),
};

module.exports = customEventStore;
