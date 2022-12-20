const vault = require("node-vault")({
    apiVersion: "v1",
    endpoint: "https://vault.udevs.io",
});

const roleId = "94b6dff5-61f1-ea99-f129-5585978a48e4";
const secretId = "9db7aa35-f2a4-7349-3ba4-d05a14e1db91";

const run = async () => {
    const result = await vault.approleLogin({
        role_id: roleId,
        secret_id: secretId,
        mount: "auth/ucode"
    });

    vault.token = result.auth.client_token; // Add token to vault object for subsequent requests.

    const { data } = await vault.read("secret/k8s/ucode-test"); // Retrieve the secret stored in previous steps.

    console.log(data)

    console.log("Attempt to delete the secret");

    await vault.delete("secret/data/mysql/webapp"); // This attempt will fail as the AppRole node-app-role doesn't have delete permissions.
};

run();
