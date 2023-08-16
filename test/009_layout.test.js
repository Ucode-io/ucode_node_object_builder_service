const { assert } = require('chai');
const viewStorage = require('../storage/mongo/view'); 
const { struct } = require('pb-util');
const { v4 } = require("uuid");


describe('Layout testing', function () {
    this.timeout('5000s')

    let id = v4()

    it('Layout view', async () => {
        const res = await viewStorage.update({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            table_id: "53edfff0-2a31-4c73-b230-06a134afa50b",
            layouts: [
                {
                "id": "f2f32a37-b3ac-416a-a54f-36d083d60bbb",
                "label": "Layout1",
                "table_id": "53edfff0-2a31-4c73-b230-06a134afa50b",
                "type": "SimpleLayout",
                "is_default": true,
                "summary_fields": [],
                "tabs": [
                    {
                    "type": "section",
                    "id": "8364971f-0d59-445c-86ea-ca7d62e47dc9",
                    "label": "Tab 1",
                    "sections": [
                        {
                        "id": "36eaf9db-9ff6-4303-9b04-f9f86497fdd1",
                        "label": "Section 1",
                        "fields": [
                            {
                            "id": "948500db-538e-412b-ba36-09f5e9f0eccc",
                            "type": "SINGLE_LINE",
                            "index": "string",
                            "label": "Субдомен платформы",
                            "slug": "subdomain",
                            "table_id": "53edfff0-2a31-4c73-b230-06a134afa50b",
                            "attributes": {
                                "maxLength": "",
                                "placeholder": "",
                                "showTooltip": false
                            },
                            "key": "a8ca6a94-4032-49ce-a2e7-59db1bb794a0",
                            "field_name": "Субдомен платформы",
                            "order": 0
                            }
                        ],
                        "order": 0
                        }
                    ]
                    }
                ]
                }
            ],
        })

        assert.equal(res.name, "Unit test name after update")
    })
   
    // it('Get List view', async () => {
    //     const res = await viewStorage.getList({
    //         project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
    //         offset: 0,
    //         limit: 5,
    //         table_slug: "unit_test_table"
    //     })
        
    //     assert.ok(res.views?.length > 0, "Response must have length in menus key")
    // })

})

