// file: example/auth_approle.js

process.env.DEBUG = 'node-vault'; // switch on debug mode

// curl \
//     --request POST \
//     --data '{"role_id":"94b6dff5-61f1-ea99-f129-5585978a48e4","secret_id":"9db7aa35-f2a4-7349-3ba4-d05a14e1db91"}' \
//     https://vault.udevs.io/v1/auth/ucode/login


const vault = require('node-vault')({
    apiVersion: "v1",
    endpoint: "https://vault.udevs.io",
    namespace: "ucode"
});

const mountPoint = 'k8s/ucode-test';
const roleName = 'ucode';

const roleId = "94b6dff5-61f1-ea99-f129-5585978a48e4";
const secretId = "9db7aa35-f2a4-7349-3ba4-d05a14e1db91";

vault.auths({
    role_id: roleId,
    secret_id: secretId,
})
.then((result) => {
  if (result.hasOwnProperty('approle/')) return undefined;
  return vault.enableAuth({
    mount_point: mountPoint,
    type: 'approle',
    description: 'Approle auth',
  });
})
.catch( (err) => {console.log("errorline2", err)})
// .then(() => vault.addApproleRole({ role_name: roleName, policies: 'dev-policy, test-policy' }))
// .then(() => Promise.all([vault.getApproleRoleId({ role_name: roleName }),
//   vault.getApproleRoleSecret({ role_name: roleName })])
// )
.then((result) => {
//   const roleId = result[0].data.role_id;
//   const secretId = result[1].data.secret_id;
  return vault.approleLogin({ role_id: roleId, secret_id: secretId });
})
.then((result) => {
  console.log(result);
})
<<<<<<< HEAD
.catch((err) => console.error("errorline", err.message));
=======
.catch((err) => console.error("errorline", err.message));
>>>>>>> 2fbf8fabc2aec9207eea37ff75cd26705f4dcf74
