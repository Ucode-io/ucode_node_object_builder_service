const { assert } = require('chai');
const actionStorage = require('../storage/mongo/custom_event'); 
const funcStorage = require('../storage/mongo/function'); 
const { struct } = require('pb-util');
const { v4 } = require("uuid");


describe('Action testing', function () {
    this.timeout('5000s')

    let id = v4()

    it('Create action', async () => {

        const func = await funcStorage.create({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: "unit_test_action_event_path",
            name: "Unit test function",
            path: "unit_test_action_event_path",
            description: "Unit test action description",
            created_at: new Date()
        })

        const res = await actionStorage.create({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id,
            table_slug: "setting.timezones",
            disable: false,
            label: "Unit test label",
            type: "SINGLE_LINE",
            attributes: {},
            event_path: "unit_test_action_event_path",
            url: "unit_test_action_url",
            method: "CREATE",
            action_type: "HTTP"
        })

        assert.equal(res.id, id)
    })
   
    it('Get List action', async () => {
        const res = await actionStorage.getList({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            offset: 0,
            limit: 5,
            table_slug: "setting.timezones"
        })
      
        assert.ok(res.count > 0, "Response must have count")
    })

    it('Update action', async () => {

        const res = await actionStorage.update({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id,
            table_slug: "setting.timezones",
            disable: false,
            label: "Unit test action label after update",
            type: "SINGLE_LINE",
            attributes: {},
            event_path: "unit_test_action_event_path",
            url: "unit_test_action_url",
            method: "CREATE",
            action_type: "HTTP"
        })

        assert.equal(res.label, "Unit test action label after update")
    })

    it('Delete action', async () => {
        const res = await actionStorage.delete({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            id: id
        })

        assert.equal(res.id, id)
    })

})

