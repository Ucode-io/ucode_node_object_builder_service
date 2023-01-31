var {Parser} = require("hot-formula-parser");
const ObjectBuilder = require("../models/object_builder");


let formulaFunction = {
    calculateFormulaFrontend: async (attributes, fields, object) => {
        let sortedFields = fields.sort((a, b) => {
            return b.slug.length - a.slug.length
        })
        let parser = new Parser()
        let computedFormula = attributes.formula
        let newValue
        sortedFields.forEach(el => {
            let value = object[el.slug] ?? 0;
            if (typeof value === "string") value = `${value}`
            computedFormula = computedFormula.replaceAll(`${el.slug}`, value)
        })
        const {error, result} = parser.parse(computedFormula)
        newValue = error ?? result
        return newValue
    },
    calculateFormulaBackend: async (attributes, matchField, matchParams, project_id) => {
        console.log("attibites", attributes);
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
        console.log("pipe::",  pipelines);  
            
        const resultFormula = await (await ObjectBuilder(true, project_id))[attributes.table_from.split('#')[0]].models.aggregate(pipelines)
        console.log(resultFormula);
        return resultFormula
    }
}

module.exports = formulaFunction