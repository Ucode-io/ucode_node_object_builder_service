var {Parser} = require("hot-formula-parser");
const ObjectBuilder = require("../models/object_builder");


let formulaFunction = {
    calculateFormulaFrontend: async (attributes, fields, object) => {
        let sortedFields = fields.sort((a, b) => {
            return b.slug.length - a.slug.length
        })
       
        let parser = new Parser()
        let computedFormula = attributes.formula
        // console.log("test #00 >> ", computedFormula)
        let newValue
        sortedFields.forEach(el => {
            let value = object[el.slug] ?? 0;
            console.log("test #1 >> ", el.slug, value, typeof value)
            if (typeof value === "boolean") {
                value = JSON.stringify(value).toUpperCase()
            }
            if (typeof value === "string") {
                value = `${value}`
            }
            if (typeof value === "object") {
                value = `'${value[0]}'`
            }
            if (typeof value === "number") {
                value = `${value}`
            }
            computedFormula = computedFormula.replaceAll(`${el.slug}`, `${value}`)
        })
        // console.log(">> Replaced formula ", computedFormula)
        const {error, result} = parser.parse(computedFormula)
        // console.log(">>>>> error formula frontend", error, result)
        newValue = error ?? result
        return newValue
    },
    calculateFormulaBackend: async (attributes, matchField, matchParams, project_id) => {
        let groupByWithDollorSign = '$' + matchField
        let sumFieldWithDollowSign = '$' + attributes["sum_field"]
        let aggregateFunction = '$sum';
        switch (attributes.type) {
            case 'SUMM':
                aggregateFunction = '$sum'
                break;
            case 'AVG':
                aggregateFunction = '$avg'
                break;
            case 'MAX':
                aggregateFunction = '$max'
                break;
            case 'LAST': 
                aggregateFunction = '$last'
        }
        const pipelines =   [
            {
                '$match': matchParams
            }, {
                '$group': {
                '_id': groupByWithDollorSign, 
                'res': {
                    [aggregateFunction]: sumFieldWithDollowSign
                    }
                }
            }
        ];  
        // console.log("pipe::",  pipelines);  
            
        const resultFormula = await (await ObjectBuilder(true, project_id))[attributes.table_from.split('#')[0]].models.aggregate(pipelines)
        return resultFormula
    }
}

module.exports = formulaFunction
