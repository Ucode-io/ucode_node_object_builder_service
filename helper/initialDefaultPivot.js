const mongoPool = require('../pkg/pool');
const { v4 } = require("uuid")
const menuStore = require('../storage/mongo/menu')

module.exports = async function (data) {
    console.log(": Default pivot checking...")
    const mongoConn = await mongoPool.get(data.project_id)
    const PivotTemplateSetting = mongoConn.models['PivotTemplate']
    const menuTable = mongoConn.models['object_builder_service.menu']
    let defaultPivot = await PivotTemplateSetting.findOne({ pivot_table_slug: "DEFAULT" , status: "SAVED"})
    let id = v4()
    if (!defaultPivot) {
        await PivotTemplateSetting.create(
            { id: id, pivot_table_slug: "DEFAULT", status: "SAVED" }
        )
    } else {
        id = defaultPivot.id
    }
    let defaultPivotMenu = await menuTable.findOne({ pivot_template_id: id })
    if (!defaultPivotMenu) {
        await menuStore.create({
            project_id: data.project_id,
            label: "DEFAULT",
            icon: "chart-simple.svg",
            parent_id: "7c26b15e-2360-4f17-8539-449c8829003f",
            type: "PIVOT",
            pivot_template_id: id,
        })
    }
    console.log(": Default pivot checking done...")
}