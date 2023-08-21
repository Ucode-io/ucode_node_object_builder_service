const { assert } = require('chai');
const menuStorage = require('../storage/mongo/menu'); 
const { struct } = require('pb-util');
const { v4 } = require("uuid");


describe('Menu testing', function () {
    this.timeout('5000s')

    let id = v4()

    it('Create menu', async () => {
        const res = await menuStorage.create({
            id: id,
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            type: "FOLDER",
            label: "Unit test label",
            order: 9999
        })

        assert.equal(res.id, id)
    })
   
    it('Get List menu', async () => {
        const res = await menuStorage.getAll({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            offset: 0,
            limit: 5
        })
        
        assert.ok(res.menus?.length < 6, "Response must have length in menus key")
    })

    it('Get Single menu', async () => {
        const res = await menuStorage.getByID({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id
        })

        assert.equal(res.id, id)
    })

    it('Update menu', async () => {
        const res = await menuStorage.update({
            id: id,
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            type: "FOLDER",
            label: "Unit test label after update",
            order: 9999
        })

        assert.equal(res.label, "Unit test label after update")
    })

    it('Delete menu', async () => {
        const res = await menuStorage.delete({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id
        })

        assert.equal(res.id, id)
    })

})

