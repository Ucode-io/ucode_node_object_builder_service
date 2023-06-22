const assert = require('chai').assert;
const sinon = require('sinon');
const { prepareToCreateInObjectBuilder } = require('./helper'); 

describe('prepareToCreateInObjectBuilder', () => {
  it('should return the prepared data for object builder service', async () => {
    const req = {
      data: {},
      project_id: '53b9d486-e202-4b0f-bb0c-921634c7f5ec',
      table_slug: 'suppliers',
    };
    const mongoConn = {
      models: {
        Table: {
          findOne: sinon.stub().resolves({ id: '21de4d71-466c-4dd2-853d-b805c2af9287' }), // Mock the required models
        },
        Field: {
          findOne: sinon.stub().resolves({ id: '456a7022-ccd9-4c46-9f85-1d9350189c4e' }),
        },
        Relation: {
          findOne: sinon.stub().resolves({ id: '36fa87ad-29fd-4d3f-953e-995b1e72f3a8' }),
        },
      },
    };

    const result = await prepareToCreateInObjectBuilder(req, mongoConn);

    assert.exists(result.payload);
    assert.exists(result.data);
    assert.exists(result.event);
    assert.exists(result.appendMany2ManyObjects);

    sinon.assert.calledWith(mongoConn.models.Table.findOne, { slug: req.table_slug });
    sinon.assert.calledWith(mongoConn.models.Field.findOne, {
      relation_id: 'your-relation-id',
      table_id: 'your-table-id',
    });
    sinon.assert.calledWith(mongoConn.models.Relation.findOne, {
      $or: [
        {
          $and: [
            { table_to: req.table_slug },
            { table_from: req.data.table_slug },
          ],
        },
        {
          $and: [
            { table_to: req.data.table_slug },
            { table_from: req.table_slug },
          ],
        },
      ],
    });

  });

});
