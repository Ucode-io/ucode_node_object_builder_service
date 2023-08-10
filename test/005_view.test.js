const { assert } = require('chai');
const viewStorage = require('../storage/mongo/view'); 
const { struct } = require('pb-util');
const { v4 } = require("uuid");


describe('View testing', function () {
    this.timeout('5000s')

    let id = v4()

    it('Create view', async () => {
        const res = await viewStorage.create({
            id: id,
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            name: "Unit test name",
            description: "unit test description",
            columns: {},
            view_fields: [],
            type: "TABLE",
            table_slug: "unit_test_table"
        })

        assert.equal(res.id, id)
    })
   
    it('Get List view', async () => {
        const res = await viewStorage.getList({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            offset: 0,
            limit: 5,
            table_slug: "unit_test_table"
        })
        
        assert.ok(res.views?.length > 0, "Response must have length in menus key")
    })

    it('Get Single view', async () => {
        const res = await viewStorage.getSingle({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id
        })

        assert.equal(res.id, id)
    })

    it('Update view', async () => {
        const res = await viewStorage.update({
            id: id,
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            name: "Unit test name after update",
            description: "unit test description",
            columns: {},
            view_fields: [],
            type: "TABLE",
            table_slug: "unit_test_table"
        })

        assert.equal(res.name, "Unit test name after update")
    })

    it('Delete view', async () => {
        const res = await viewStorage.delete({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id
        })

        assert.equal(res.id, id)
    })

})

