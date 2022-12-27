async function createTestLogin(testLoginID, clientTypeID) {
    testLogin = [
        {
            "login_strategy": "Login with password",
            "table_slug": "user",
            "login_view": "login",
            "login_label": "Логин",
            "password_view": "password",
            "object_id": "2546e042-af2f-4cef-be7c-834e6bde951c",
            "password_label": "Парол",
            "guid": testLoginID,
            "client_type_id": clientTypeID,
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "__v": 0
        }
    ]

    return testLogin
}

module.exports = createTestLogin