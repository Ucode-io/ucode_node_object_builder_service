const catchWrapDb = require("../../helper/catchWrapDb");
const { struct } = require('pb-util');
const mongoPool = require('../../pkg/pool');
const { v4 } = require("uuid");
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
            let sort = { created_at: 1 }

            if (data.type == "DOWN") {
                sort = { created_at: -1 }
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

            const resp = await History.find(query, {created_at: 0, update_at: 0}).sort(sort)
            // console.log("_____---> ", query, resp)

            return {histories: resp}

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
            for(let i = 0 ; i < data.histories.length; i++) {
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
            for(const el of menus) {
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await menuStorage.create(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await menuStorage.update(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await menuStorage.delete(el.previus)
                    }
                }
            }

            console.log("~~~~~~~~~~~~~~~ TEST MIGRATE #8")
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
    down: catchWrapDb(`${NAMESPACE}.down`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id)
            const History = mongoConn.models['object_builder_service.version_history']

            const tables = [], fields = [], relations = [], layouts = [], menus = [], actions = [], views = [], ids = []
            const map_tables = {}, map_fields = {}, map_relations = {}, map_layouts = {}, map_menus = {}, map_views = {}, map_actions = {}

            data.histories = data.histories || []
            for(let i = data.histories.length -1 ; i >= 0; i--) {
                el = data.histories[i]
                if (el.current) {
                    el.current = struct.decode(el.current)
                } else {
                    el.current = {}
                }

                if (el.previus) {
                    el.previus = struct.decode(el.previus)
                } else {
                    el.previus = {}
                }
                
                ids.push(el.id)
                switch(el.action_source) {
                    case VERSION_SOURCE_TYPES_MAP.TABLE: {
                        tables.push(el)
                        map_tables[el.current.id || el.previus.id] = el
                        break
                    } 
                    case VERSION_SOURCE_TYPES_MAP.FIELD: {
                        fields.push(el)
                        map_fields[el.current.id || el.previus.id] = el
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.RELATION: {
                        relations.push(el)
                        map_relations[el.current.id || el.previus.id] = el
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.LAYOUT: {
                        layouts.push(el)
                        let c_payload = JSON.parse(el.current.data || {})
                        let p_payload = JSON.parse(el.previus.data || {})
                        map_layouts[c_payload.id || p_payload.id] = el
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.MENU: {
                        menus.push(el)
                        map_menus[el.current.id || el.previus.id] = el
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.ACTION: {
                        actions.push(el)
                        map_actions[el.current.id || el.previus.id] = el
                        break
                    }
                    case VERSION_SOURCE_TYPES_MAP.VIEW: {
                        views.push(el)
                        map_views[el.current.id || el.previus.id] = el
                        break
                    }
                }
            }

            for(let key in map_tables) {

                let el = map_tables[key]
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id

                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await tableStorage.delete(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await tableStorage.update(el.previus)
                        break
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await tableStorage.create(el.previus)
                        el.current.fields = []
                        await fieldStorage.createAll(el.previus)
                        break
                    }
                }
            }

            for(const key in map_fields) {
                let el = map_fields[key]
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await fieldStorage.delete(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await fieldStorage.update(el.previus)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await fieldStorage.create(el.previus)
                    }
                }
            }

            for(const key in map_relations) {
                let el = map_relations[key]
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await relationStorage.delete(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await relationStorage.update(el.previus)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await relationStorage.create(el.previus)
                    }
                }
            }

            for(const key in map_actions) {
                let el = map_actions[key]
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await actionStorage.delete(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await actionStorage.update(el.previus)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await actionStorage.create(el.previus)
                    }
                }
            }

            for(const key in map_views) {
                let el = map_views[key]
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await viewStorage.delete(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await viewStorage.update(el.previus)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await viewStorage.create(el.previus)
                    }
                }
            }

            for(const key in map_menus) {
                let el = map_menus[key]
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id
                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.CREATE: {
                        await menuStorage.delete(el.current)
                        break
                    }
                    case ACTION_TYPE_MAP.UPDATE: {
                        await menuStorage.update(el.previus)
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await menuStorage.create(el.previus)
                    }
                }
            }
           
            for(const key in map_layouts) {
                let el = map_layouts[key]
                el.current ? el.current.project_id = data.project_id : el.current = { project_id: data.project_id }
                delete el.current._id

                switch ((el.action_type).toUpperCase()) {
                    case ACTION_TYPE_MAP.UPDATE: {

                        if(el.previus.data) {
                            el.previus.data = JSON.parse(el.previus.data)
                        }

                        await layoutStorage.update(el.previus.data)
                        break
                    }
                    case ACTION_TYPE_MAP.DELETE: {
                        await layoutStorage.update(el.previus)
                    }
                }
            }

        } catch (err) {
            throw err
        }
    })
};

module.exports = versionHistoryStorage;
