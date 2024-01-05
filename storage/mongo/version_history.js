const catchWrapDb = require("../../helper/catchWrapDb");
const { struct } = require('pb-util');
const mongoPool = require('../../pkg/pool');
const { v4 } = require("uuid");
const { VIEW_TYPES } = require('../../helper/constants')
const { VERSION_SOURCE_TYPES_MAP, ACTION_TYPE_MAP } = require("../../helper/constants")
const tableStorage = require('./table')
const fieldStorage = require('./field')
const relationStorage = require('./relation')
const menuStorage = require('./menu')
const actionStorage = require('./custom_event')
const viewStorage = require('./view')



let NAMESPACE = "storage.version_history";

let versionHistoryStorage = {
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']

            const query = {
                is_used: {
                    $or: [
                        {
                            [data.env_id]: false
                        },
                        {
                            [data.env_id]: {
                                $exists: false
                            }
                        }
                    ]
                }
            }

            if (data.type) {
                query.action_source = data.type
            }

            const resp = await History.find(query).sort({created_at: -1})

            return resp

        } catch (err) {
            throw err
        }
    }),
    usedForEnv: catchWrapDb(`${NAMESPACE}.usedForEnv`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']

            const resp = await History.updateMany({
                id: {
                    $in: data.ids
                }
            }, {
                [`is_used.${data.env_id}`]: true
            })

            return resp

        } catch (err) {
            throw err
        }
    }),
    migrate: catchWrapDb(`${NAMESPACE}.migrate`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']

            const tables = [], fields = [], relations = [], layouts = [], tabs = [], sections = [], menus = [], actions = [], views = []

            for(const el of data.histories) {
                switch(el.type) {
                    case VERSION_SOURCE_TYPES_MAP.TABLE: {
                        tables.push(el)
                        break
                    } 
                    case VERSION_SOURCE_TYPES_MAP.FIELD: {
                        fields.push(el)
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.RELATION: {
                        relations.push(el)
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.LAYOUT: {
                        layouts.push(el)
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.TAB: {
                        tabs.push(el)
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.SECTION: {
                        sections.push(el)
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.MENU: {
                        menus.push(el)
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.ACTION: {
                        actions.push(el)
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.VIEW: {
                        views.push(el)
                        break
                    }
                }
            }

            for(const el of tables) {
                el?.current.project_id = data.project_id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await tableStorage.create(el.current)
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await tableStorage.update(el.current)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await tableStorage.delete(el.previus)
                    }
                }
            }

            for(const el of fields) {
                el?.current.project_id = data.project_id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await fieldStorage.create(el.current)
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await fieldStorage.update(el.current)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await fieldStorage.delete(el.previus)
                    }
                }
            }

            for(const el of relations) {
                el?.current.project_id = data.project_id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await relationStorage.create(el.current)
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await relationStorage.update(el.current)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await relationStorage.delete(el.previus)
                    }
                }
            }

            for(const el of menus) {
                el?.current.project_id = data.project_id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await menuStorage.create(el.current)
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await menuStorage.update(el.current)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await menuStorage.delete(el.previus)
                    }
                }
            }

            for(const el of actions) {
                el?.current.project_id = data.project_id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await actionStorage.create(el.current)
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await actionStorage.update(el.current)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await actionStorage.delete(el.previus)
                    }
                }
            }

            for(const el of views) {
                el?.current.project_id = data.project_id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await viewStorage.create(el.current)
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await viewStorage.update(el.current)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await viewStorage.delete(el.previus)
                    }
                }
            }

            return resp

        } catch (err) {
            throw err
        }
    })
};

module.exports = versionHistoryStorage;
