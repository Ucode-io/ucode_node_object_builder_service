const { assert } = require('chai');
const fieldStorage = require('../storage/mongo/field'); 
const { struct } = require('pb-util');
const { v4 } = require("uuid");


describe('Field testing', function () {
    this.timeout('5000s')

    let id = v4()

    it('Create field', async () => {
        const res = await fieldStorage.create({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id,
            table_id: "41491588-53f1-4457-ba46-93019363ab88",
            required: false,
            slug: "unit_test_slug",
            label: "Unit test label",
            type: "SINGLE_LINE",
            attributes: {},
        })

        assert.equal(res.id, id)
    })
   
    it('Get List field', async () => {
        const res = await fieldStorage.getAll({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            offset: 0,
            limit: 5,
            table_id: "41491588-53f1-4457-ba46-93019363ab88"
        })
        
        assert.ok(res.fields?.length > 0, "Response must have length in menus key")
    })

    it('Update field', async () => {
        const res = await fieldStorage.update({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id,
            table_id: "41491588-53f1-4457-ba46-93019363ab88",
            required: false,
            slug: "unit_test_slug",
            label: "Unit test label after update",
            type: "SINGLE_LINE",
            attributes: {},
        })

        assert.equal(res.label, "Unit test label after update")
    })

    it('Delete field', async () => {
        const res = await fieldStorage.delete({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id
        })

        assert.equal(res.id, id)
    })

})

