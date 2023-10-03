const { assert } = require('chai');
const tableStorage = require('../storage/mongo/table'); 
const { struct } = require('pb-util');
const { v4 } = require("uuid");


describe('Table testing', function () {
    this.timeout('5000s')

    let id = v4()

    it('Create table', async () => {
        const res = await tableStorage.create({
            id: id,
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            label: "Unit test label",
            description: "unit test description",
            show_in_menu: true,
            is_changed: true,
            is_cached: false,
            soft_delete: false,
            order_by: false,
            slug: "unit_test_table"
        })

        assert.equal(res.id, id)
    })
   
    it('Get List table', async () => {
        const res = await tableStorage.getAll({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            offset: 0,
            limit: 5
        })
        
        assert.ok(res.tables?.length < 6, "Response must have length in menus key")
    })

    it('Get Single table', async () => {
        const res = await tableStorage.getByID({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id
        })

        assert.equal(res.id, id)
    })

    it('Update table', async () => {
        const res = await tableStorage.update({
            id: id,
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            label: "Unit test label after update",
            description: "unit test description",
            show_in_menu: true,
            is_changed: true,
            is_cached: false,
            soft_delete: false,
            order_by: false,
            slug: "unit_test_table"
        })

        assert.equal(res.label, "Unit test label after update")
    })

    it('Delete table', async () => {
        const res = await tableStorage.delete({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id
        })

        assert.equal(res.id, id)
    })

})

