const catchWrapDb = require("../../helper/catchWrapDb");

const { struct } = require('pb-util');
const { v4 } = require("uuid");
const relationStore = require("../mongo/relation");

const mongoPool = require('../../pkg/pool');
const ObjectBuilder = require("../../models/object_builder");

// const mongoConn = await mongoPool.get(data.project_id)
// const Table = mongoConn.models['Table']
// const Field = mongoConn.models['Field']
// const Section = mongoConn.models['Section']
// const App = mongoConn.models['App']
// const View = mongoConn.models['View']
// const Relation = mongoConn.models['Relation']
// const ViewRelation = mongoConn.models['ViewRelation']


// const mongoConn = await mongoPool.get(data.project_id)
// const Table = mongoConn.models['Table']
// const Field = mongoConn.models['Field']
// const Section = mongoConn.models['Section']
// const App = mongoConn.models['App']
// const View = mongoConn.models['View']
// const Relation = mongoConn.models['Relation']
// const ViewRelation = mongoConn.models['ViewRelation']


let NAMESPACE = "storage.setting";

let settingStore = {
    getDefaultSettings: catchWrapDb(`${NAMESPACE}.getDefaultSettings`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const Language = mongoConn.models['Setting.Languages']
            const Currency = mongoConn.models['Setting.Currencies']
            const Timezone = mongoConn.models['Setting.Timezones']

            const lang = await Language.findOne({
                default: true
            });

            const cur = await Currency.findOne({
                default: true
            });

            const tzone = await Timezone.findOne({
                default: true
            });

            return {
                language: lang,
                currency: cur,
                timezone: tzone
            }
        } catch (err) {
            throw err
        }
    }),
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            var collection
            switch(data.type) {
                case "LANGUAGE":
                    collection = mongoConn.models['Setting.Languages']
                    break
                case "CURRENCY":
                    collection = mongoConn.models['Setting.Currencies']
                    break
                case "TIMEZONE":
                    collection = mongoConn.models['Setting.Timezones']
                    break
                default:
                    throw new Error("type is not valid")
            }

            var filter = {}
            if (data.search !== "") {
                filter = {
                    $text: {
                        $search: data.search
                    }
                }
            }
            const res = await collection.find(
                filter,
            {
                _id: 0,
                created_at: 0,
                updated_at: 0
            },
            )
            .limit(data.limit+data.offset)
            .skip(data.offset)
            .lean()

            const count = await collection.countDocuments(filter)

            const resEncode = struct.encode({ res })

            return {
                data: resEncode,
                count: count
            }
        } catch (err) {
            throw err
        }

    }),
    setDefaultSettings: catchWrapDb(`${NAMESPACE}.setDefaultSettings`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            var collection
            switch(data.type) {
                case "LANGUAGE":
                    collection = mongoConn.models['Setting.Languages']
                    break
                case "CURRENCY":
                    collection = mongoConn.models['Setting.Currencies']
                    break
                case "TIMEZONE":
                    collection = mongoConn.models['Setting.Timezones']
                    break
                default:
                    throw new Error("type is not valid")
            }
            await collection.updateOne(
                {
                    id: data.id
                },
                {
                    $set: {
                        dafault: true
                    }
                }
            )
            await collection.updateMany(
                {
                    id: {
                        $ne: data.id
                    },
                    default: true
                },
                {
                    $set: {
                        dafault: false
                    }
                }
            )
            const res = await collection.findOne({id: data.id}).lean()

            if (!res) {
                return {
                    data: struct.encode({}),
                    count: 0
                }
            }

            return {
                data: struct.encode(res),
                count: 1
            }
        } catch (err) {
            throw err
        }
    }),
};

module.exports = settingStore;
