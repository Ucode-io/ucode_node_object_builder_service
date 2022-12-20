const Vault = require('hashi-vault-js');

const roleId = "94b6dff5-61f1-ea99-f129-5585978a48e4";
const secretId = "9db7aa35-f2a4-7349-3ba4-d05a14e1db91";

const vault = new Vault( {
    baseUrl: 'https://vault.udevs.io/v1',
    timeout: 2000,
});


const status =  vault.healthCheck()
.catch( (err)=> {console.log(err)} )

const token = vault.loginWithAppRole(roleId, secretId, "auth/ucode")
.then( (result) => {
    console.log(result.client_token)
    vault.createKVSecret(result.client_token, "slack", {data: "hello world"}, "secret/k8s/ucode-test")
    .then( res => { console.log(res)})
    .catch( err => console.log("111",err.message))
})
.catch( (err)=> {
    console.log(err)
})

