const projectStorage = require('../storage/mongo/project'); 

console.log("--- Test started ", new Date(), " ---")
before( function (done) {
    this.timeout('9000s')
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