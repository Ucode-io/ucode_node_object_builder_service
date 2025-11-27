async function customErrMsg() {
    let customErrMsgs = [
        {
            "title": "Обязательное поля",
            "guid": "2546e042-af2f-4cef-be7c-834e6bde951d",
            "name": "required",
            "updatedAt": new Date()
        },
        {
            "title": "Дубликат",
            "guid": "746c924d-28de-46d0-95d9-8a7b15403fe6",
            "name": "duplicate",
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "__v": 0
        },
        {
            "title": "Таблица не найдено",
            "guid": "b18fbe81-779c-40fc-bd59-11d2ad413933",
            "name": "table not found",
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "__v": 0
        }
    ]

    return customErrMsgs
}

module.exports = customErrMsg;