const { assert } = require('chai');
const projectStorage = require('../storage/mongo/project'); 
const objectStorage = require('../storage/mongo/object_builder'); 
const { struct } = require('pb-util');

function add(a, b) {
    return 8
}

before( function (done) {
    this.timeout('5000s')
    projectStorage.reconnect({
        project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81", // youtube dev
        credentials: {
            host: "65.109.239.69",
            port: 30027,
            database: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
            username: "youtube_62d6f9d4dd9c425b84f6cb90860967a8_p_obj_build_svcs",
            password: "bLjkGFjiva"
        }
    }).then(() => {done()}).catch(err => {})
});


describe('Object testing', function () {
    this.timeout('5000s')

    it('Create object', async () => {
        const res = await objectStorage.create({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            table_slug: "user",
            data: struct.encode({
                role_id: "3306fd21-ee1a-4c68-8843-6d0699b6f9ce",
                client_type_id: "921743b1-9315-4eb9-b180-244bcbeb67cb",
                guid: "fcff8ec0-1864-4a58-892b-6b7d19985499",
                project_id: "62d6f9d4-dd9c-425b-84f6-cb90860967a8",
                name: "unit test user"
            })
        })
    })

    it('Get List object', async () => {
        const res = await objectStorage.getList({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            table_slug: "user",
            data: struct.encode({})
        })
    })

    it('Get Single object', async () => {
        const res = await objectStorage.getSingle({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            table_slug: "user",
            data: struct.encode({
                id: "fcff8ec0-1864-4a58-892b-6b7d19985499",
                table_slug: "user"
            })
        })
    })

    it('Update object', async () => {
        const res = await objectStorage.update({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            table_slug: "user",
            data: struct.encode({
                role_id: "3306fd21-ee1a-4c68-8843-6d0699b6f9ce",
                client_type_id: "921743b1-9315-4eb9-b180-244bcbeb67cb",
                guid: "fcff8ec0-1864-4a58-892b-6b7d19985499",
                project_id: "62d6f9d4-dd9c-425b-84f6-cb90860967a8",
                name: "unit test user after update test case"
            })
        })
    })

    it('Delete object', async () => {
        const res = await objectStorage.delete({
            project_id: "ecb08c73-3b52-42e9-970b-56be9b7c4e81",
            table_slug: "user",
            data: struct.encode({
                id: "fcff8ec0-1864-4a58-892b-6b7d19985499",
            })
        })
    })

})

