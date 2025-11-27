const catchWrapDb = require("../../helper/catchWrapDb");
const mongoPool = require('../../pkg/pool');

let NAMESPACE = "storage.language";

let languageStore = {
    create: catchWrapDb(`${NAMESPACE}.create`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Language = mongoConn.models["Language"];
    
            if (!data.key || !data.translations || !data.category || !data.platform) {
                throw new Error("Missing required fields: key, translations, category, or platform");
            }
    
            data.created_at = new Date().toISOString();
            data.updated_at = new Date().toISOString();
    
            const newLanguage = new Language(data);
            await newLanguage.save();
    
            return newLanguage;
        } catch (error) {
            throw error;
        }
    }),
    getById: catchWrapDb(`${NAMESPACE}.getById`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Language = mongoConn.models["Language"];
    
            if (!data.id) {
                throw new Error("Missing 'id' field");
            }
    
            const language = await Language.findOne(
                { id: data.id },
                { _id: 0, __v: 0 }
            );
    
            if (!language) {
                throw new Error("Language not found");
            }
    
            return language;
        } catch (error) {
            throw error;
        }
    }),
    getList: catchWrapDb(`${NAMESPACE}.getList`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Language = mongoConn.models["Language"];
    
            let query = {};
    
            if (data.search) {
                query.platform = data.search;
            }
    
            const languages = await Language.find(query, { _id: 0, __v: 0 })
                .sort({ category: 1 })
                .skip(data.offset || 0)
                .limit(data.limit || 0)
    
            const count = await Language.countDocuments(query);
    
            return { languages: languages, count };
        } catch (error) {
            throw error;
        }
    }),
    update: catchWrapDb(`${NAMESPACE}.update`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Language = mongoConn.models["Language"];
    
            if (!data.id) {
                throw new Error("Missing 'id' field for update");
            }
    
            data.updated_at = new Date().toISOString();
            const updateData = { ...data };
            delete updateData.id;
    
            const updatedLanguage = await Language.findOneAndUpdate(
                { id: data.id }, 
                { $set: updateData },
                { new: true, projection: { _id: 0, __v: 0 } }
            );
    
            return updatedLanguage;
        } catch (error) {
            throw error;
        }
    }),    
    delete: catchWrapDb(`${NAMESPACE}.delete`, async (data) => {
        try {
            const mongoConn = await mongoPool.get(data.project_id);
            const Language = mongoConn.models["Language"];
    
            if (!data.id) {
                throw new Error("Missing 'id' field");
            }
    
            const result = await Language.deleteOne({ id: data.id });
    
            if (result.deletedCount === 0) {
                throw new Error("Language not found or already deleted");
            }
    
            return { success: true, message: "Language deleted successfully" };
        } catch (error) {
            throw error;
        }
    }),
};

module.exports = languageStore;
