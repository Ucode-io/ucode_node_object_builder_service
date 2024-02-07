const catchWrapDb = require("../../helper/catchWrapDb");
const { struct } = require('pb-util');
const mongoPool = require('../../pkg/pool');
const { v4 } = require("uuid");
const { VIEW_TYPES, VERSION_HISTORY_TYPES } = require('../../helper/constants')
const { VERSION_SOURCE_TYPES_MAP, ACTION_TYPE_MAP } = require("../../helper/constants")
const tableStorage = require('./table')
const fieldStorage = require('./field')
const relationStorage = require('./relation')
const menuStorage = require('./menu')
const actionStorage = require('./custom_event')
const viewStorage = require('./view')
const layoutStorage = require('./layout')



let NAMESPACE = "storage.version_history";

let versionHistoryStorage = {
    getAll: catchWrapDb(`${NAMESPACE}.getAll`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']
            const query = {}
            const limit = data.limit
            const offset = data.offset

            // if (data.type == "DOWN") {
            //     sort = { created_at: -1 }
            // }

            if (data.type) {
                query.type = data.type
            }

            if(data.env_id) {
                query["$or"] = [
                    {
                        [`is_used.${data.env_id}`]: false
                    },
                    {
                        [`is_used.${data.env_id}`]: {
                            "$exists": false
                        }
                    }
                ]
            }

            if (data.from_date) {
                query.created_at = {$gte: new Date(data.from_date)}
            }
            if (data.to_date) {
                if (!query.created_at) {
                    query.created_at = {};
                }
                query.created_at.$lte = new Date(data.to_date);
            }
            if (data.user_info) {
                query.user_info = data.user_info;
            }
            if (data.api_key) {
                query.api_key = data.api_key
            }

            const sortOrder = data.order_by ? 1 : -1
            
            const resp = await History.find(query, {created_at: 0, update_at: 0})
                .sort({created_at: sortOrder})
                .skip(offset)
                .limit(limit)

            const count = await History.countDocuments(query);
    
            return {histories: resp, count: count}

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
    migrate: catchWrapDb(`${NAMESPACE}.migrate1`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']

            const tables = [], fields = [], relations = [], layouts = [], tabs = [], sections = [], menus = [], actions = [], views = [], ids = []

            data.histories = data.histories || []
            for(let i = data.histories.length - 1; i >= 0; i--) {
                el = data.histories[i]
                if (el.current) {
                    el.current = struct.decode(el.current)
                } else if(el.action_source == VERSION_SOURCE_TYPES_MAP.TAB && el.action_source == VERSION_SOURCE_TYPES_MAP.SECTION){
                    el.current = []
                } else {
                    el.current = {}
                }

                if (el.previus) {
                    el.previus = struct.decode(el.previus)
                } else if(el.action_source == VERSION_SOURCE_TYPES_MAP.TAB && el.action_source == VERSION_SOURCE_TYPES_MAP.SECTION){
                    el.previus = []
                } else {
                    el.previus = {}
                }
                
                ids.push(el.id)
                switch(el.action_source) {
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

            console.log("~~~~~~~~~~~~~~~ TEST MIGRATE #1", tables.length)
            for(const el of tables) {
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await tableStorage.create(el.current)
                        el.current.fields = []
                        await fieldStorage.createAll(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await tableStorage.update(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await tableStorage.delete(el.previus)
                    }
                }
            }

            console.log("~~~~~~~~~~~~~~~ TEST MIGRATE #2")
            for(const el of fields) {
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await fieldStorage.create(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await fieldStorage.update(el.current)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await fieldStorage.delete(el.previus)
                    }
                }
            }

            console.log("~~~~~~~~~~~~~~~ TEST MIGRATE #3")
            for(const el of relations) {
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await relationStorage.create(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await relationStorage.update(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await relationStorage.delete(el.previus)
                    }
                }
            }

            console.log("~~~~~~~~~~~~~~~ TEST MIGRATE #5")
            for(const el of actions) {
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await actionStorage.create(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await actionStorage.update(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await actionStorage.delete(el.previus)
                    }
                }
            }

            console.log("~~~~~~~~~~~~~~~ TEST MIGRATE #6")
            for(const el of views) {
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await viewStorage.create(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await viewStorage.update(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await viewStorage.delete(el.previus)
                    }
                }
            }
            console.log("~~~~~~~~~~~~~~~ TEST MIGRATE #7")

            // let ready_tab_map = {}
            // for(const el of tabs) {
            //     for(let tab of tab.current) {
            //         for(let el_s of sections) {
            //             if(el_s.current?.length) {
            //                 tab.sections = el_s.current.filter((s) => s.tab_id == tab.id)
            //             }
            //         }
            //         if(ready_tab_map[tab.layout_id]) {
            //             ready_tab_map[tab.layout_id].push(tab)
            //         } else {
            //             ready_tab_map[tab.layout_id] = [tab]
            //         }
            //     }
            // }

            for(const el of layouts) {
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                
                // el.current.tabs = ready_tab_map[el.current.id] || []

                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.UPDATE: {

                        if(el.current.data) {
                            el.current.data = JSON.parse(el.current.data)
                        }

                        await layoutStorage.update(el.current.data)
                        break
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await layoutStorage.delete(el.previus)
                    }
                }
            }

            return {ids}

        } catch (err) {
            throw err
        }
    }),
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            console.log("Data->", data)
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']
            if (data.type == '') {
                data.type = VERSION_HISTORY_TYPES.GLOBAL
            }

            const resp = await History.create(data)

            return resp

        } catch (err) {
            throw err
        }
    }),
    getByID: catchWrapDb(`${NAMESPACE}.getByID`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']

            const query = {}

            if (data.type) {
                query.action_source = data.type
            }

            if(data.env_id) {
                query["$or"] = [
                    {
                        [`is_used.${data.env_id}`]: false
                    },
                    {
                        [`is_used.${data.env_id}`]: {
                            "$exists": false
                        }
                    }
                ]
            }

            if (data.from_time) {
                query.created_at = {$gte: new Date(data.from_time)}
            }
            if (data.to_time) {
                if (!query.created_at) {
                    query.created_at = {};
                }
                query.created_at.$lte = new Date(data.to_time);
            }
            if (data.user_info) {
                query.user_info = data.user_info;
            }
            if (data.api_key) {
                query.api_key = data.api_key
            }

            const sortOrder = data.order_by ? 1 : -1
            
            const resp = await History.find(query, {created_at: 0, update_at: 0}).sort({created_at: sortOrder})

            return {histories: resp}

        } catch (err) {
            throw err
        }
    }),
};

module.exports = versionHistoryStorage;
