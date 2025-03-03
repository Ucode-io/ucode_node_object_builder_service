async function createLanguage() {
    let languages = [
        {
            "id": "4882c498-3cbd-415a-b71c-ef1b107b5fa8",
            "key": "Settings",
            "translations": {
                "uz": "Sozlamalar",
                "ru": "Настройки",
                "en": "Settings"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "e1faaf44-cd93-4478-ac5b-ac5ad29e31fb",
            "key": "Users",
            "translations": {
                "uz": "Foydanaluvchilar",
                "ru": "Участники",
                "en": "Users"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "46bc5bbf-688a-40a2-aa13-43930a54f13e",
            "key": "Create",
            "translations": {
                "uz": "Yaratish",
                "ru": "Создать",
                "en": "Create"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "c3879e2c-d673-4387-a453-32ad84751385",
            "key": "Files",
            "translations": {
                "uz": "Fayllar",
                "ru": "Файлы",
                "en": "Files"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "fe717d41-af85-4ec9-8747-5cc934159a53",
            "key": "Languages",
            "translations": {
                "uz": "Tillar",
                "ru": "Языки",
                "en": "Languages"
            },
            "category": "Profile Setting",
            "platform": "Admin"
        },
        {
            "id": "48f6e47b-d56c-4b5f-92e3-ba0f414792eb",
            "key": "Logout",
            "translations": {
                "uz": "Chiqish",
                "ru": "Выход",
                "en": "Logout"
            },
            "category": "Profile Setting",
            "platform": "Admin"
        },
        {
            "id": "0824724b-56fe-4b9f-90aa-eb402a3ca437",
            "key": "Project Settings",
            "translations": {
                "uz": "Loyiha Parametrlari",
                "ru": "Параметры Проекта",
                "en": "Project Settings"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "b3190680-ddfd-40be-b95a-47af9bf0054c",
            "key": "Permissions",
            "translations": {
                "uz": "Ruxsatlar",
                "ru": "Разрешение",
                "en": "Permissions"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "64902122-d97d-4274-be92-90dee56ed6c9",
            "key": "Resources",
            "translations": {
                "uz": "Resurslar",
                "ru": "Ресурсы",
                "en": "Resources"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "b6d8d3a4-4084-45e5-bf24-ec237cba9ccd",
            "key": "Code",
            "translations": {
                "uz": "Kod",
                "ru": "Код",
                "en": "Code"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "b658814d-eb88-4f12-883f-53ea595129fe",
            "key": "Activity Logs",
            "translations": {
                "uz": "Faoliyat Jurnallari",
                "ru": "Журналы Aктивности",
                "en": "Activity Logs"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "a025a7aa-6245-409e-a848-84bf8d6d6d57",
            "key": "Environments",
            "translations": {
                "uz": "Environments",
                "ru": "Environments",
                "en": "Environments"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "4eab57d9-5b34-4334-9be9-f417ec088e5e",
            "key": "Versions",
            "translations": {
                "uz": "Versiyalar",
                "ru": "Версии",
                "en": "Versions"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "274a2fc6-b010-47ec-9bdc-a75c8ef8c098",
            "key": "Language Control",
            "translations": {
                "uz": "Tilni Boshqarish",
                "ru": "Языковой контроль",
                "en": "Language Control"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "c2db2bf1-1915-4ba7-ba70-0aa8295dc10d",
            "key": "Functions",
            "translations": {
                "uz": "Funksiyalar",
                "ru": "Функции",
                "en": "Functions"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "b981f042-dd2e-4532-8811-370ff6620ccb",
            "key": "Microfrontend",
            "translations": {
                "uz": "Microfrontend",
                "ru": "Микрофронт",
                "en": "Microfrontend"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "36ef81fc-b503-407e-8961-d15f47d48a83",
            "key": "Upload ERD",
            "translations": {
                "uz": "ERD Yuklash",
                "ru": "Загрузка ERD",
                "en": "Upload ERD"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "ce9ef604-7393-4775-8c49-77c9da993e2c",
            "key": "Models",
            "translations": {
                "uz": "Modellar",
                "ru": "Модели",
                "en": "Models"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "ff7e7814-315c-4fdf-9a27-24f2642fd828",
            "key": "Name",
            "translations": {
                "uz": "Nomi",
                "ru": "Наименование",
                "en": "Name"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "e34fd1cb-948e-4c87-8fa3-bea9a7a0fc57",
            "key": "Language",
            "translations": {
                "uz": "Til",
                "ru": "Язык",
                "en": "Language"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "bc1ba084-632e-49ac-b322-0f3fa4bb4c30",
            "key": "Currency",
            "translations": {
                "uz": "Valyuta",
                "ru": "Валюта",
                "en": "Currency"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "4fa47aea-1f57-498f-a532-03887e146000",
            "key": "Timezone",
            "translations": {
                "uz": "Vaqt Mintaqasi",
                "ru": "Часовой Пояс",
                "en": "Timezone"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "283ed6f6-aa6c-485b-8807-8f48bb89900d",
            "key": "Description",
            "translations": {
                "uz": "Tavsif",
                "ru": "Описание",
                "en": "Description"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "842ee412-af79-42cc-b1db-027ed1ee442e",
            "key": "Add",
            "translations": {
                "uz": "Qoshish",
                "ru": "Добавить",
                "en": "Add"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "c2db88ce-63c4-4167-a431-5d0ee0e4eb01",
            "key": "Create folder",
            "translations": {
                "uz": "Papka Q oshish",
                "ru": "Создать Папку",
                "en": "Create folder"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "bb646156-2004-4177-891b-ca69ae57df31",
            "key": "Title",
            "translations": {
                "uz": "Sarlavha",
                "ru": "Заголовок",
                "en": "Title"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "333e36a0-7b0d-4bda-96c2-2fe636b60176",
            "key": "Default page link",
            "translations": {
                "uz": "Standart sahifa havolasi",
                "ru": "Ссылка на страницу по умолчанию",
                "en": "Default page link"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "f3aeb133-a010-4320-9d9a-b8d0570cf670",
            "key": "Self recover",
            "translations": {
                "uz": "O‘zini Tiklash",
                "ru": "Самовосстановление",
                "en": "Self recover"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "ce44f811-971b-4d53-9ad6-993ce289fd94",
            "key": "Self register",
            "translations": {
                "uz": "Mustaqil Ro‘yxatdan O‘tish",
                "ru": "Самостоятельная Регистрация",
                "en": "Self register"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "97d12f9a-fecc-45ad-8b9c-81b40adf2ce4",
            "key": "Table",
            "translations": {
                "uz": "Jadval",
                "ru": "Таблица",
                "en": "Table"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "03df87ed-1b5e-4fd2-bb8f-bda431367d5a",
            "key": "Session limit",
            "translations": {
                "uz": "Sessiya Kheklovi",
                "ru": "Лимит Сессии",
                "en": "Session limit"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "70612c0c-f55d-4209-9ddc-0a17b5ff1f5f",
            "key": "Matrix Details",
            "translations": {
                "uz": "Matritsa Tafsilotlari",
                "ru": "Детали Mатрицы",
                "en": "Matrix Details"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "d4d0c05f-4caa-4033-a4e6-2d68b3d405a7",
            "key": "Role",
            "translations": {
                "uz": "Rol",
                "ru": "Роль",
                "en": "Role"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "e71a3744-bdb3-4139-a29b-7fca8de066de",
            "key": "Connection",
            "translations": {
                "uz": "Ulanish",
                "ru": "Соединение",
                "en": "Connection"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "bb343f3c-1fa1-49f7-9e4e-d33356607e11",
            "key": "View slug",
            "translations": {
                "uz": "Slugni Ko‘rish",
                "ru": "Просмотр Слага",
                "en": "View slug"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "2bf82d46-47f3-42bc-a0c4-79c5cd68549c",
            "key": "Table slug",
            "translations": {
                "uz": "Jadval slugi",
                "ru": "Слаг Таблицы",
                "en": "Table slug"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "56e3f10e-7ba5-4cb7-8ec6-0a72da186d6b",
            "key": "Table",
            "translations": {
                "uz": "Jadval",
                "ru": "Таблица",
                "en": "Table"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "bc491d8c-1000-43f1-b869-ab48899c895b",
            "key": "Menu",
            "translations": {
                "uz": "Menyu",
                "ru": "Меню",
                "en": "Menu"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "13b3bd21-e155-4f32-9acd-1a304b1bf9d5",
            "key": "Global Permission",
            "translations": {
                "uz": "Global Ruxsat",
                "ru": "Глобальное Pазрешение",
                "en": "Global Permission"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "09eba4a5-6cea-4591-9925-26598052a2f7",
            "key": "Objects",
            "translations": {
                "uz": "Obyektlar",
                "ru": "Объекты",
                "en": "Objects"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "350d2744-731d-497d-ac4e-036915c288cb",
            "key": "Record Permission",
            "translations": {
                "uz": "Yozish ruxsatnomasi",
                "ru": "Разрешение на запись",
                "en": "Record Permission"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "4866623d-bd2d-40c5-b5c8-5bfb1da8ee31",
            "key": "Field Permission",
            "translations": {
                "uz": "Maydon uchun ruxsat",
                "ru": "Разрешение на поле",
                "en": "Field Permission"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "631f545f-08b2-4c34-8f6e-69dc5f16f640",
            "key": "Action Permission",
            "translations": {
                "uz": "Amal uchun ruxsat",
                "ru": "Разрешение на действие",
                "en": "Action Permission"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "4f0b9ad6-7d02-4242-9846-73e2ddb3f50e",
            "key": "Relation Permission",
            "translations": {
                "uz": "Aloqa uchun ruxsat",
                "ru": "Разрешение на связь",
                "en": "Relation Permission"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "4f7160aa-cfc6-42b6-a3ce-6cc461d2202c",
            "key": "View Permission",
            "translations": {
                "uz": "Ko‘rish uchun ruxsat",
                "ru": "Разрешение на просмотр",
                "en": "View Permission"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "893e9a8d-4f51-4998-a4da-188f7ba44a2f",
            "key": "Custom Permission",
            "translations": {
                "uz": "Maxsus ruxsat",
                "ru": "Пользовательское разрешение",
                "en": "Custom Permission"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "17a19bf7-6de2-4f5f-b57e-81072eaf351d",
            "key": "Reading",
            "translations": {
                "uz": "O‘qish",
                "ru": "Чтение",
                "en": "Reading"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "1539679a-b60d-4e8e-9c8c-d197d305e324",
            "key": "Adding",
            "translations": {
                "uz": "Qo‘shish",
                "ru": "Добавление",
                "en": "Adding"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "06c56d8d-d7b4-46c5-9e07-9d58a7944317",
            "key": "Editing",
            "translations": {
                "uz": "Tahrirlash",
                "ru": "Редактирование",
                "en": "Editing"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "16dfd864-41c5-4480-b514-61e9cd929adf",
            "key": "Deleting",
            "translations": {
                "uz": "O‘chirish",
                "ru": "Удаление",
                "en": "Deleting"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "fff70601-ad01-4907-b4e3-640f252ccd60",
            "key": "Public",
            "translations": {
                "uz": "Ommaviy",
                "ru": "Публичный",
                "en": "Public"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "6c1cc916-faab-4084-99d4-bff55fb3e709",
            "key": "Resource settings",
            "translations": {
                "uz": "Resurs sozlamalari",
                "ru": "Настройки ресурса",
                "en": "Resource settings"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "35a8a72a-2bc1-4366-8334-c742b7f77643",
            "key": "API keys",
            "translations": {
                "uz": "API Kalitlari",
                "ru": "Ключи API",
                "en": "API keys"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "e5e035ed-1f5e-421b-8789-7aca1fe37a66",
            "key": "Redirects",
            "translations": {
                "uz": "Yo‘naltirishlar",
                "ru": "Перенаправления",
                "en": "Redirects"
            },
            "category": "Custom endpoint",
            "platform": "Admin"
        },
        {
            "id": "421a4dbf-857b-4d67-adba-070a6b439f29",
            "key": "From",
            "translations": {
                "uz": "Dan",
                "ru": "Из",
                "en": "From"
            },
            "category": "Custom endpoint",
            "platform": "Admin"
        },
        {
            "id": "b89d8643-1250-43ad-9ea7-5e6080be0c1b",
            "key": "Created at",
            "translations": {
                "uz": "Yaratilgan vaqti",
                "ru": "Создано в",
                "en": "Created at"
            },
            "category": "Custom endpoint",
            "platform": "Admin"
        },
        {
            "id": "b8f08935-b78a-402d-b593-c30246a1c7a8",
            "key": "Updated at",
            "translations": {
                "uz": "Yangilangan vaqti",
                "ru": "Обновлено в",
                "en": "Updated at"
            },
            "category": "Custom endpoint",
            "platform": "Admin"
        },
        {
            "id": "92848c37-ff72-43fd-9bcf-1a526b93ecc0",
            "key": "Create new",
            "translations": {
                "uz": "Yangi yaratish",
                "ru": "Создать новый",
                "en": "Create new"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "80b6aa83-40b8-465d-bdb5-a9108ba5e016",
            "key": "Faas functions",
            "translations": {
                "uz": "FaaS funksiyalari",
                "ru": "Функции FaaS",
                "en": "Faas functions"
            },
            "category": "Functions",
            "platform": "Admin"
        },
        {
            "id": "4daae2e1-63ad-4e95-a482-57ed5d7f1e10",
            "key": "Status",
            "translations": {
                "uz": "Statuslar",
                "ru": "Статус",
                "en": "Status"
            },
            "category": "Functions",
            "platform": "Admin"
        },
        {
            "id": "048febe1-809e-4401-bef3-182cab28bef1",
            "key": "Path",
            "translations": {
                "uz": "Yo‘l",
                "ru": "Путь",
                "en": "Path"
            },
            "category": "Functions",
            "platform": "Admin"
        },
        {
            "id": "c277b392-93ee-48e3-b9bd-8bf5c41ea420",
            "key": "Framework type",
            "translations": {
                "uz": "Freymvork turi",
                "ru": "Тип фреймворка",
                "en": "Framework type"
            },
            "category": "Microfrontend",
            "platform": "Admin"
        },
        {
            "id": "e4ca819f-effa-43b4-b4a6-0d37de10af40",
            "key": "Action",
            "translations": {
                "uz": "Amal",
                "ru": "Действие",
                "en": "Action"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "6d1ea6e0-0606-43ae-869d-848e8567ffc1",
            "key": "Collection",
            "translations": {
                "uz": "To‘plam",
                "ru": "Коллекция",
                "en": "Collection"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "3d0e59d4-6af7-4fdd-b610-72c6ec185e82",
            "key": "Action On",
            "translations": {
                "uz": "Amal bajariladigan obyekt",
                "ru": "Действие на",
                "en": "Action On"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "f336b910-f79d-4a05-9a07-334395369ae4",
            "key": "Action By",
            "translations": {
                "uz": "Amal bajargan shaxs",
                "ru": "Действие выполнено",
                "en": "Action By"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "5ce13a7e-e306-4df4-9366-b6ba9ab1610f",
            "key": "Media",
            "translations": {
                "uz": "Media",
                "ru": "Медиа",
                "en": "Media"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "921277b1-d009-450c-b60b-37801004a075",
            "key": "Items",
            "translations": {
                "uz": "Elementlar",
                "ru": "Элементы",
                "en": "Items"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "ca9760de-75bd-4d12-8db5-ba18c3239701",
            "key": "Select All",
            "translations": {
                "uz": "Barchasini tanlash",
                "ru": "Выбрать все",
                "en": "Select All"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "b3ed91ff-0338-4c6a-8e31-04d446c5cb5e",
            "key": "Name",
            "translations": {
                "uz": "Nomi",
                "ru": "Наименование",
                "en": "Name"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "8fdb4910-3cbd-4024-ae6e-af5320e1515d",
            "key": "Login",
            "translations": {
                "uz": "Kirish",
                "ru": "Вход",
                "en": "Login"
            },
            "category": "LoginPage",
            "platform": "Admin"
        },
        {
            "id": "3da559e9-5b49-462a-9a25-89f8239dea08",
            "key": "Mail",
            "translations": {
                "uz": "Pochta",
                "ru": "Почта",
                "en": "Mail"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "8f3f049c-2bb5-48dd-986f-23967dfd69f0",
            "key": "Phone",
            "translations": {
                "uz": "Telefon",
                "ru": "Телефон",
                "en": "Phone"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "c01e87b7-cc27-4100-8827-47b9457bbe0d",
            "key": "Invite",
            "translations": {
                "uz": "Taklif qilish",
                "ru": "Пригласить",
                "en": "Invite"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "efbc4089-920b-47f6-a39a-76efd0b1a892",
            "key": "Show",
            "translations": {
                "uz": "Ko‘rsatish",
                "ru": "Показать",
                "en": "Show"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "35095e00-0cf4-4a1a-860d-e8e5ddb32dca",
            "key": "Invite user",
            "translations": {
                "uz": "Foydalanuvchini taklif qilish",
                "ru": "Пригласить пользователя",
                "en": "Invite user"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "f97c6143-c664-4061-b31b-a7783d74c367",
            "key": "Password",
            "translations": {
                "uz": "Parol",
                "ru": "Пароль",
                "en": "Password"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "e42f5cdf-5b67-44e4-af1e-eeaaf7d41204",
            "key": "User type",
            "translations": {
                "uz": "Foydalanuvchi turi",
                "ru": "Тип пользователя",
                "en": "User type"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "2d3247bb-9624-4490-b804-b9746de9566d",
            "key": "More",
            "translations": {
                "uz": "Ko‘proq",
                "ru": "Еще",
                "en": "More"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "e20cca81-c068-4449-af83-f692f0ccb501",
            "key": "Email",
            "translations": {
                "uz": "Pochta",
                "ru": "Электронная почта",
                "en": "Email"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "9eb50ad3-9b09-4f70-a5d2-1e2ed458e5b7",
            "key": "Active role",
            "translations": {
                "uz": "Faol rol",
                "ru": "Активная роль",
                "en": "Active role"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "f2347dfd-f122-44a8-a9fa-376243971254",
            "key": "Create table",
            "translations": {
                "uz": "Jadval yaratish",
                "ru": "Создать таблицу",
                "en": "Create table"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "9a1b410c-88b2-4096-8eef-87d5f4bbd8e9",
            "key": "Add table",
            "translations": {
                "uz": "Jadval qo‘shish",
                "ru": "Добавить таблицу",
                "en": "Add table"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "d34c64b5-4049-4dcb-b96b-3e08707a51e5",
            "key": "Add microfrontend",
            "translations": {
                "uz": "Mikrofrontend qo‘shish",
                "ru": "Добавить микрофронтенд",
                "en": "Add microfrontend"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "469788d8-023c-4634-9d71-da34e005f127",
            "key": "Add website",
            "translations": {
                "uz": "Veb-sayt qo‘shish",
                "ru": "Добавить сайт",
                "en": "Add website"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "6241b6db-f690-4149-b36c-f8c6b7a0e46e",
            "key": "Add folder",
            "translations": {
                "uz": "Jild qo‘shish",
                "ru": "Добавить папку",
                "en": "Add folder"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "e6db3999-0b7f-4959-a6cd-58955e12ef8f",
            "key": "General",
            "translations": {
                "uz": "Umumiy",
                "ru": "Общий",
                "en": "General"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "057ef2e8-da0e-4f79-a799-a5d07fe7f49b",
            "key": "Key",
            "translations": {
                "uz": "Kalit",
                "ru": "Ключ",
                "en": "Key"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "9a094ec1-629f-4428-8f53-9961fc5bbd09",
            "key": "Login Table",
            "translations": {
                "uz": "Kirish jadvali",
                "ru": "Таблица входа",
                "en": "Login Table"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "3329ac03-3761-492a-9d3c-29dbaf0a3ecb",
            "key": "Cache",
            "translations": {
                "uz": "Kesh",
                "ru": "Кэш",
                "en": "Cache"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "62c54733-d976-48b2-ac6f-c195f353d7c6",
            "key": "Soft delete",
            "translations": {
                "uz": "Yengil o‘chirish",
                "ru": "Мягкое удаление",
                "en": "Soft delete"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "9d2f8faf-5cf2-4dca-9308-c0ef43946ca5",
            "key": "Sort",
            "translations": {
                "uz": "Saralash",
                "ru": "Сортировка",
                "en": "Sort"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "a789033d-53e6-4e6d-9548-7072ebc42c10",
            "key": "Attach to table",
            "translations": {
                "uz": "Jadvalga ulash",
                "ru": "Прикрепить к таблице",
                "en": "Attach to table"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "4f513136-c5ad-4448-bb8d-a5578996337f",
            "key": "Attach to microfrontend",
            "translations": {
                "uz": "Mikrofrontendga ulash",
                "ru": "Прикрепить к микрофронтенду",
                "en": "Attach to microfrontend"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "5926ea79-86fb-421a-b968-b7c7daa5ccd4",
            "key": "Website Link",
            "translations": {
                "uz": "Veb-sayt havolasi",
                "ru": "Ссылка на сайт",
                "en": "Website Link"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "b84e991d-2c81-4c69-aedc-7d1050b0ec37",
            "key": "View",
            "translations": {
                "uz": "Ko‘rish",
                "ru": "Просмотр",
                "en": "View"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "227e41ae-c3c3-41d7-ae96-5d83629dfade",
            "key": "Create item",
            "translations": {
                "uz": "Element yaratish",
                "ru": "Создать элемент",
                "en": "Create item"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "86fa6596-a6e4-4f4a-ad73-6bf7fd76613d",
            "key": "Details",
            "translations": {
                "uz": "Tafsilotlar",
                "ru": "Детали",
                "en": "Details"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "f7da6ad7-eafe-4c3f-9655-a776707ed71b",
            "key": "Fields",
            "translations": {
                "uz": "Maydonlar",
                "ru": "Поля",
                "en": "Fields"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "aa8404db-b718-43ba-ac9b-94fda5c21754",
            "key": "Relations",
            "translations": {
                "uz": "Aloqalar",
                "ru": "Связи",
                "en": "Relations"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "1433e1e9-2e0b-41cd-a581-f63252fa5d7e",
            "key": "Actions",
            "translations": {
                "uz": "Amallar",
                "ru": "Действия",
                "en": "Actions"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "b196cd3d-552d-45fb-91af-f435cbc3d2ee",
            "key": "Custom errors",
            "translations": {
                "uz": "Maxsus xatoliklar",
                "ru": "Пользовательские ошибки",
                "en": "Custom errors"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "3275c3c0-7267-46c8-8072-c4f7f0bb45e8",
            "key": "Default",
            "translations": {
                "uz": "Standart",
                "ru": "По умолчанию",
                "en": "Default"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "03019020-90c6-4b93-9e9e-72941f843a75",
            "key": "Modal",
            "translations": {
                "uz": "Modal oynasi",
                "ru": "Модальное окно",
                "en": "Modal"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "dbb522c7-9249-413c-a0da-1cef90298bc3",
            "key": "Remove tabs",
            "translations": {
                "uz": "Tablarni olib tashlash",
                "ru": "Удалить вкладки",
                "en": "Remove tabs"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "9316577c-b4ed-4004-a994-53f12fa78983",
            "key": "Field Label",
            "translations": {
                "uz": "Maydon yorligi",
                "ru": "Метка поля",
                "en": "Field Label"
            },
            "category": "Fields",
            "platform": "Admin"
        },
        {
            "id": "f246cf76-525c-4d18-8b7e-9da5d59cb2cc",
            "key": "Field Type",
            "translations": {
                "uz": "Maydon turi",
                "ru": "Тип поля",
                "en": "Field Type"
            },
            "category": "Fields",
            "platform": "Admin"
        },
        {
            "id": "6086a1a9-faf0-4402-bc7e-ac4dc22d3d9b",
            "key": "Field Slug",
            "translations": {
                "uz": "Maydon slugi",
                "ru": "Слаг поля",
                "en": "Field Slug"
            },
            "category": "Fields",
            "platform": "Admin"
        },
        {
            "id": "f1c3fc33-5b64-4eeb-8416-d2368fe6afbd",
            "key": "Table from",
            "translations": {
                "uz": "Jadvaldan",
                "ru": "Таблица из",
                "en": "Table from"
            },
            "category": "Relation",
            "platform": "Admin"
        },
        {
            "id": "085815fd-2fb9-4141-ba94-37568b20f158",
            "key": "Table to",
            "translations": {
                "uz": "Jadvalga",
                "ru": "Таблица в",
                "en": "Table to"
            },
            "category": "Relation",
            "platform": "Admin"
        },
        {
            "id": "777f62e7-975e-4e9f-9f3d-b8ca577023cd",
            "key": "Relation type",
            "translations": {
                "uz": "Aloqa turi",
                "ru": "Тип связи",
                "en": "Relation type"
            },
            "category": "Relation",
            "platform": "Admin"
        },
        {
            "id": "0938266f-b3a9-47ca-92f3-ef2ea501a15a",
            "key": "Create action",
            "translations": {
                "uz": "Harakat yaratish",
                "ru": "Создать действие",
                "en": "Create action"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "05bc3394-78ff-4c92-b704-e1f877984b9f",
            "key": "Function",
            "translations": {
                "uz": "Funksiya",
                "ru": "Функция",
                "en": "Function"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "d5055756-5e42-4c16-9b93-0bc5a7c44604",
            "key": "Action type",
            "translations": {
                "uz": "Amal turi",
                "ru": "Тип действия",
                "en": "Action type"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "a1879968-4759-4622-b617-d1bbd9c19051",
            "key": "Message",
            "translations": {
                "uz": "Xabar",
                "ru": "Сообщение",
                "en": "Message"
            },
            "category": "Custom error",
            "platform": "Admin"
        },
        {
            "id": "656a80b4-5a59-4c22-80f5-9fea1d8af84c",
            "key": "Languages",
            "translations": {
                "uz": "Tillar",
                "ru": "Языки",
                "en": "Languages"
            },
            "category": "Custom error",
            "platform": "Admin"
        },
        {
            "id": "6ed99794-cf8e-45a9-aba0-d2b1835eb42c",
            "key": "Action type",
            "translations": {
                "uz": "Amal turi",
                "ru": "Тип действия",
                "en": "Action type"
            },
            "category": "Custom error",
            "platform": "Admin"
        },
        {
            "id": "870d87ce-759a-4aa0-8d6c-1bb17d4740b7",
            "key": "Field create",
            "translations": {
                "uz": "Maydon yaratish",
                "ru": "Создать поле",
                "en": "Field create"
            },
            "category": "Fields",
            "platform": "Admin"
        },
        {
            "id": "631ff38f-3e92-4121-93a0-f22b62ea02c6",
            "key": "Default value",
            "translations": {
                "uz": "Standart qiymat",
                "ru": "Значение по умолчанию",
                "en": "Default value"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "451d5d74-0b42-43e3-b469-2973d3d7c13b",
            "key": "Schema",
            "translations": {
                "uz": "Skhema",
                "ru": "Схема",
                "en": "Schema"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "e018d2ff-c6f8-46f0-a3af-a3bc03f049a7",
            "key": "Validation",
            "translations": {
                "uz": "Tekshiruv",
                "ru": "Валидизация",
                "en": "Validation"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "5406aa54-e2ee-4804-8274-777e8f4102ce",
            "key": "Autofill",
            "translations": {
                "uz": "Avto to‘ldirish",
                "ru": "Автозаполнение",
                "en": "Autofill"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "67e39d00-35e2-4bf1-9de6-0c4582047922",
            "key": "Auto filter",
            "translations": {
                "uz": "Avto filtrlash",
                "ru": "Автофильтр",
                "en": "Auto filter"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "f11f6f02-735d-4970-8352-d6f977621fd0",
            "key": "Field hide",
            "translations": {
                "uz": "Maydonni yashirish",
                "ru": "Скрыть поле",
                "en": "Field hide"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "b6af5831-eec8-44d5-b3c5-31302062590b",
            "key": "Error message",
            "translations": {
                "uz": "Xatolik xabari",
                "ru": "Сообщение об ошибке",
                "en": "Error message"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "a1a80ccf-b561-41f2-a410-a676c430e3c2",
            "key": "Disabled",
            "translations": {
                "uz": "O‘chirilgan",
                "ru": "Отключено",
                "en": "Disabled"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "6a9f2788-095c-49ef-b4a9-5ce184a97fb8",
            "key": "Required",
            "translations": {
                "uz": "Majburiy",
                "ru": "Обязательно",
                "en": "Required"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "4881fd92-bb88-4f4a-ba1e-a512d48df105",
            "key": "Duplicate",
            "translations": {
                "uz": "Takrorlash",
                "ru": "Дубликат",
                "en": "Duplicate"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "898697ac-a566-4a37-a04b-5a9ec63962b8",
            "key": "Autofill table",
            "translations": {
                "uz": "Jadvalni avto-to‘ldirish",
                "ru": "Автозаполнение таблицы",
                "en": "Autofill table"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "8cd6593d-2241-42fa-88bf-03ae4b6dbc76",
            "key": "Autofilter field",
            "translations": {
                "uz": "Maydonni avto-filtrlash",
                "ru": "Автофильтр поля",
                "en": "Autofilter field"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "0dbb44ac-1723-43b8-b1e8-d8c3c52042bd",
            "key": "Automatic",
            "translations": {
                "uz": "Avtomatik",
                "ru": "Автоматический",
                "en": "Automatic"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "a23e2e56-19fa-4837-94f5-9290ebf5a8f1",
            "key": "Hide field from",
            "translations": {
                "uz": "Maydonni yashirish",
                "ru": "Скрыть поле от",
                "en": "Hide field from"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "092c4b39-5d26-4a56-a0ea-4dfa873b59e8",
            "key": "Single Line",
            "translations": {
                "uz": "Bir satrli tekst",
                "ru": "Одна строка",
                "en": "Single Line"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "533f1a00-d52e-4cf1-8aee-6421dead3cc3",
            "key": "Multi Line",
            "translations": {
                "uz": "Ko‘p satr",
                "ru": "Множественные строки",
                "en": "Multi Line"
            },
            "category": "Fields",
            "platform": "Admin"
        },
        {
            "id": "0c3d918b-2952-49cc-ae54-a59845e8563e",
            "key": "Date",
            "translations": {
                "uz": "Sana",
                "ru": "Дата",
                "en": "Date"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "be6bd5ae-8189-48e9-b4db-ce558189023d",
            "key": "Date time",
            "translations": {
                "uz": "Sana va vaqt",
                "ru": "Дата и время",
                "en": "Date time"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "0a849331-c3b8-4ff1-9bbd-b6ba99f9cf76",
            "key": "Date time - timezone",
            "translations": {
                "uz": "Sana va vaqt - vaqt mintaqasi",
                "ru": "Дата и время - часовой пояс",
                "en": "Date time - timezone"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "f5549fe3-50b0-4339-9ada-556932298b77",
            "key": "Time",
            "translations": {
                "uz": "Vaqt",
                "ru": "Время",
                "en": "Time"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "2ce302c8-8793-4eb2-9d15-0c31d8d8031b",
            "key": "Number",
            "translations": {
                "uz": "Raqam",
                "ru": "Число",
                "en": "Number"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "c2a87001-eb06-4c78-8b08-7e9c825d9a9d",
            "key": "Float",
            "translations": {
                "uz": "O‘zgaruvchan nuqta soni",
                "ru": "Число с плавающей запятой",
                "en": "Float"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "75ca4b41-3fce-4c71-874e-580058f366bb",
            "key": "Money",
            "translations": {
                "uz": "Pul",
                "ru": "Деньги",
                "en": "Money"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "6a96e8b9-9f3e-4233-8566-885163ef8a35",
            "key": "Checkbox",
            "translations": {
                "uz": "Belgi Qutisi",
                "ru": "Флажок",
                "en": "Checkbox"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "2f494c06-4119-433d-a08b-5429a7148555",
            "key": "Switch",
            "translations": {
                "uz": "O‘tkazgich",
                "ru": "Переключатель",
                "en": "Switch"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "f1a2f26e-0f7d-43c5-9835-faedb9681f35",
            "key": "Select",
            "translations": {
                "uz": "Tanlash",
                "ru": "Выбрать",
                "en": "Select"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "6e5920c3-15d6-444d-bc40-5c851fe5cfb5",
            "key": "Status",
            "translations": {
                "uz": "Holat",
                "ru": "Статус",
                "en": "Status"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "77a10f27-256e-4201-a572-3cef56c40efd",
            "key": "Point",
            "translations": {
                "uz": "Nuqta",
                "ru": "Точка",
                "en": "Point"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "26a90fbd-09fc-435f-8be1-9f65977882a4",
            "key": "Geozone",
            "translations": {
                "uz": "Geozona",
                "ru": "Геозона",
                "en": "Geozone"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "0f967110-6824-4172-95d4-150a4901e8d3",
            "key": "Photo",
            "translations": {
                "uz": "Foto",
                "ru": "Фото",
                "en": "Photo"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "46e0eec6-b613-47ba-b67a-04b5e9ac1331",
            "key": "Multi Image",
            "translations": {
                "uz": "Ko‘p rasmlar",
                "ru": "Множественное изображение",
                "en": "Multi Image"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "38a969c1-9db0-4f50-9d10-fa52e37f47ad",
            "key": "Video",
            "translations": {
                "uz": "Video",
                "ru": "Видео",
                "en": "Video"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "5ed73349-cf8d-46d9-9342-909cb6d9d6de",
            "key": "File",
            "translations": {
                "uz": "Fayl",
                "ru": "Файл",
                "en": "File"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "ecf567a3-12ae-4a22-af6b-2b2d5ea180cb",
            "key": "Formula",
            "translations": {
                "uz": "Formula",
                "ru": "Формула",
                "en": "Formula"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "8b0b1a83-37a2-4fbf-8e5d-21fc9de02e4e",
            "key": "Formula in frontend",
            "translations": {
                "uz": "Frontendda formula",
                "ru": "Формула во фронтенде",
                "en": "Formula in frontend"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "f396a985-45ec-40ca-867b-1ffe86731334",
            "key": "Formula in backend",
            "translations": {
                "uz": "Backendda formula",
                "ru": "Формула в бэкенде",
                "en": "Formula in backend"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "e4b2e8bf-fe3b-4ba9-9877-e3f0ad0a88c2",
            "key": "Text",
            "translations": {
                "uz": "Matn",
                "ru": "Текст",
                "en": "Text"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "f881d23b-29fe-4475-a00e-e0a40e409891",
            "key": "Link",
            "translations": {
                "uz": "Havola",
                "ru": "Ссылка",
                "en": "Link"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "7f4bc109-b34b-4d86-9343-e191b65d95ba",
            "key": "Person",
            "translations": {
                "uz": "Odam",
                "ru": "Человек",
                "en": "Person"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "8e83aa3b-e368-41c3-b8d5-f4d5f4834cef",
            "key": "Button",
            "translations": {
                "uz": "Tugma",
                "ru": "Кнопка",
                "en": "Button"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "c14cd42d-5d89-470f-8fe7-0e6b24804911",
            "key": "Incremenet ID",
            "translations": {
                "uz": "IDni oshirish",
                "ru": "Инкремент ID",
                "en": "Incremenet ID"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "96da4733-a91a-4cda-9560-308f40bbc77c",
            "key": "Internation phone",
            "translations": {
                "uz": "Xalqaro telefon",
                "ru": "Международный телефон",
                "en": "Internation phone"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "dc9ad42c-81af-4621-905e-e79c7ff38c99",
            "key": "Email",
            "translations": {
                "uz": "Pochta",
                "ru": "Почта",
                "en": "Email"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "215026e6-2663-47bb-b7ec-b6843e076614",
            "key": "Icon",
            "translations": {
                "uz": "Belgi",
                "ru": "Значок",
                "en": "Icon"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "57c8fb08-d939-43fe-bde4-62af3384c882",
            "key": "Password",
            "translations": {
                "uz": "Parol",
                "ru": "Пароль",
                "en": "Password"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "d744ed75-781a-491c-aa11-a1e26c8d6114",
            "key": "Color",
            "translations": {
                "uz": "Rang",
                "ru": "Цвет",
                "en": "Color"
            },
            "category": "Field type",
            "platform": "Admin"
        },
        {
            "id": "427a5036-05b1-4b65-b9d5-c964eefba56f",
            "key": "View fields",
            "translations": {
                "uz": "Ko‘rish maydonlari",
                "ru": "Поля просмотра",
                "en": "View fields"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "9836ece3-120c-4f1a-a1ff-f135284d3d82",
            "key": "Disable Edit table",
            "translations": {
                "uz": "Tahrir qilish jadvalini o‘chirib qo‘yish",
                "ru": "Отключить редактирование таблицы",
                "en": "Disable Edit table"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "93a371df-927e-4a46-a1d3-9c13dd0c1544",
            "key": "Enable Multi language",
            "translations": {
                "uz": "Ko‘p tillilikni yoqish",
                "ru": "Включить многоязычность",
                "en": "Enable Multi language"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "c09d6d0c-a505-4069-a3f3-29bce5485010",
            "key": "Additional",
            "translations": {
                "uz": "Qo‘shimcha",
                "ru": "Дополнительный",
                "en": "Additional"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "249dfcca-6481-4405-bd79-ba6ae9a32f34",
            "key": "Default editable",
            "translations": {
                "uz": "Standart tahrirlanadigan",
                "ru": "Редактируемый по умолчанию",
                "en": "Default editable"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "db19e4c6-2ff6-4855-870d-fc34715ad5ed",
            "key": "Creatable",
            "translations": {
                "uz": "Yaratish mumkin bo‘lgan",
                "ru": "Создаваемый",
                "en": "Creatable"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "9653dc0f-59b3-4f4c-9e3d-41dc364e22ea",
            "key": "Relation Buttons",
            "translations": {
                "uz": "Aloqa tugmalari",
                "ru": "Кнопки отношения",
                "en": "Relation Buttons"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "761992c4-0c15-455b-967f-ba3f7929918a",
            "key": "Create relation",
            "translations": {
                "uz": "Aloqa yaratish",
                "ru": "Создать связь",
                "en": "Create relation"
            },
            "category": "Permission",
            "platform": "Admin"
        },
        {
            "id": "c8e21c9a-1ee2-4fab-9cd8-c314e352e6ab",
            "key": "Redirect URL",
            "translations": {
                "uz": "URL ni yoʻnaltirish",
                "ru": "Перенаправить URL",
                "en": "Redirect URL"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "9f560a57-d998-4dd2-ba55-8ce41dd43d03",
            "key": "Type",
            "translations": {
                "uz": "Tur",
                "ru": "Тип",
                "en": "Type"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "0df2b47d-8a9c-41d5-9329-b8fdaabbe411",
            "key": "Table",
            "translations": {
                "uz": "Jadval",
                "ru": "Таблица",
                "en": "Table"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "85f5e41b-348e-4364-b086-cdc2f0bdbc0f",
            "key": "Name",
            "translations": {
                "uz": "Nomi",
                "ru": "Hазвания",
                "en": "Name"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "c3c3ac6d-160f-4cd4-9b9a-976497fa7b75",
            "key": "Value",
            "translations": {
                "uz": "Qiymat",
                "ru": "Значение",
                "en": "Value"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "bb07bf64-d148-4e71-a639-071cf75a2f9b",
            "key": "Create new",
            "translations": {
                "uz": "Yangi Yaratish",
                "ru": "Создать Новый",
                "en": "Create new"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "67eb0144-d8f1-4872-b067-127f2458e864",
            "key": "Method",
            "translations": {
                "uz": "Usul",
                "ru": "Метод",
                "en": "Method"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "6a36e0d8-8bbd-43ac-8120-6698e31502db",
            "key": "Disabled",
            "translations": {
                "uz": "O‘chirilgan",
                "ru": "Отключено",
                "en": "Disabled"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "7ea78670-190b-45d9-bc2e-1ce608996dec",
            "key": "No limit",
            "translations": {
                "uz": "Cheklov yo‘q",
                "ru": "Без ограничений",
                "en": "No limit"
            },
            "category": "Action",
            "platform": "Admin"
        },
        {
            "id": "74c69679-a17b-4391-8366-327ef65a82e1",
            "key": "Create Custom Error Message",
            "translations": {
                "uz": "Maxsus Xato Xabarini Yaratish",
                "ru": "Создать Пользовательское Сообщение Об Ошибке",
                "en": "Create Custom Error Message"
            },
            "category": "Custom error",
            "platform": "Admin"
        },
        {
            "id": "aee91cb6-ff68-4286-8c16-9dcddada59fc",
            "key": "Fields list",
            "translations": {
                "uz": "Maydonlar roʻyxati",
                "ru": "Список полей",
                "en": "Fields list"
            },
            "category": "Custom error",
            "platform": "Admin"
        },
        {
            "id": "0c6a8611-f515-4819-88cd-81c8bacad43e",
            "key": "Code",
            "translations": {
                "uz": "Kod",
                "ru": "Код",
                "en": "Code"
            },
            "category": "Custom error",
            "platform": "Admin"
        },
        {
            "id": "74846168-eaf8-417d-a1b6-43800f466a90",
            "key": "Error id",
            "translations": {
                "uz": "Xato ID",
                "ru": "ID ошибки",
                "en": "Error id"
            },
            "category": "Custom error",
            "platform": "Admin"
        },
        {
            "id": "c6e3be3f-e029-41ae-b90c-a26b94e3eb1c",
            "key": "Form fields",
            "translations": {
                "uz": "Shakl maydonlari",
                "ru": "Поля формы",
                "en": "Form fields"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "83ad84e8-66d8-40cf-95df-f3ca50edd45a",
            "key": "Relation tabs",
            "translations": {
                "uz": "Aloqa yorliqlari",
                "ru": "Вкладки отношений",
                "en": "Relation tabs"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "06c8095a-6fee-4fdb-8550-968a60341064",
            "key": "Relation table",
            "translations": {
                "uz": "Aloqa jadvali",
                "ru": "Таблица отношений",
                "en": "Relation table"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "3ccaa928-2c5a-4bab-8231-cd7c1fefed62",
            "key": "View options",
            "translations": {
                "uz": "Ko‘rish parametrlari",
                "ru": "Параметры отображения",
                "en": "View options"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "0fc1ecad-5723-41b7-b2f5-d71736f6462e",
            "key": "Columns",
            "translations": {
                "uz": "Ustunlar",
                "ru": "Столбцы",
                "en": "Columns"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "643e7e6b-75a3-4324-9ee7-380bae6c8395",
            "key": "Tab group",
            "translations": {
                "uz": "Yorliq guruhi",
                "ru": "Группа вкладок",
                "en": "Tab group"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "44a2e928-4c65-4e9c-9452-0fe834e2ea97",
            "key": "Export",
            "translations": {
                "uz": "Eksport",
                "ru": "Экспорт",
                "en": "Export"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "aa79c870-aada-4df8-98e6-ba6da0e3c484",
            "key": "Import",
            "translations": {
                "uz": "Import",
                "ru": "Импорт",
                "en": "Import"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "8f1b7b41-9486-472b-bd13-c805866854ea",
            "key": "Delete",
            "translations": {
                "uz": "O‘chirish",
                "ru": "Удалить",
                "en": "Delete"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "e53aaf6e-532a-4c2f-809b-befbb01c20be",
            "key": "Docs",
            "translations": {
                "uz": "Hujjatlar",
                "ru": "Документы",
                "en": "Docs"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "eefe0664-396b-429d-bc66-45e34e3f27f9",
            "key": "Visible columns",
            "translations": {
                "uz": "Ko‘rinadigan ustunlar",
                "ru": "Видимые столбцы",
                "en": "Visible columns"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "66b69e8a-2f16-4105-a15f-7ddab2088c29",
            "key": "Seaarch by filled name",
            "translations": {
                "uz": "To‘ldirilgan nom bo‘yicha qidirish",
                "ru": "Поиск по заполненному имени",
                "en": "Search by filled name"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "6bb8e7d4-a105-461a-bf39-852635fecd58",
            "key": "Group columns",
            "translations": {
                "uz": "Ustunlarni guruhlash",
                "ru": "Группировка столбцов",
                "en": "Group columns"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "6ed5e6c4-7d01-4d6e-ad33-72d290260b41",
            "key": "Tab group columns",
            "translations": {
                "uz": "Yorliq guruhining ustunlari",
                "ru": "Столбцы группы вкладок",
                "en": "Tab group columns"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "586c0691-73fa-462a-8382-bd2eab7caffb",
            "key": "Upload file",
            "translations": {
                "uz": "Fayl yuklash",
                "ru": "Загрузить файл",
                "en": "Upload file"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "0c12aa15-4ba2-4ede-9794-77db727b5d6d",
            "key": "Confirmation",
            "translations": {
                "uz": "Tasdiqlash",
                "ru": "Подтверждение",
                "en": "Confirmation"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "ae8b565b-ff90-42c4-b858-7da53b87e9cf",
            "key": "Drag and drop files here",
            "translations": {
                "uz": "Fayllarni bu yerga olib kelib qo‘ying",
                "ru": "Перетащите файлы сюда",
                "en": "Drag and drop files here"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "c6629011-958a-4137-896a-5e64c18182a3",
            "key": "Browse",
            "translations": {
                "uz": "Ko‘rish",
                "ru": "Обзор",
                "en": "Browse"
            },
            "category": "Calendar view",
            "platform": "Admin"
        },
        {
            "id": "ae1d6fb7-d7c0-42c4-b850-1711a07a0a20",
            "key": "Today",
            "translations": {
                "uz": "Bugun",
                "ru": "Сегодня",
                "en": "Today"
            },
            "category": "Calendar view",
            "platform": "Admin"
        },
        {
            "id": "94d09817-a0c7-4e11-8371-cbc380ea3e8f",
            "key": "Day",
            "translations": {
                "uz": "Kun",
                "ru": "День",
                "en": "Day"
            },
            "category": "Calendar view",
            "platform": "Admin"
        },
        {
            "id": "0a6b7a42-c448-44d9-8a2b-94d4f46bc88c",
            "key": "Calendar settings",
            "translations": {
                "uz": "Taqvim sozlamalari",
                "ru": "Настройки календаря",
                "en": "Calendar settings"
            },
            "category": "Calendar view",
            "platform": "Admin"
        },
        {
            "id": "4bef545f-cdc0-4316-84e7-c6f4ba63c46e",
            "key": "Time from",
            "translations": {
                "uz": "Vaqtdan boshlab",
                "ru": "Время с",
                "en": "Time from"
            },
            "category": "Calendar view",
            "platform": "Admin"
        },
        {
            "id": "1c0b8769-5aad-40a2-8ad0-9bcbc97d7383",
            "key": "Time to",
            "translations": {
                "uz": "Vaqtga qadar",
                "ru": "Время до",
                "en": "Time to"
            },
            "category": "Calendar view",
            "platform": "Admin"
        },
        {
            "id": "5fc0448a-5207-4a0a-a5a6-03bc8ce3be5d",
            "key": "Edit field",
            "translations": {
                "uz": "Maydonni tahrirlash",
                "ru": "Редактировать поле",
                "en": "Edit field"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "6aeb88f4-5687-403e-93a3-a1ad165f257c",
            "key": "Sort A -> Z",
            "translations": {
                "uz": "Saralash A -> Z",
                "ru": "Сортировать A -> Z",
                "en": "Sort A -> Z"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "eea8bbbb-76ca-4c48-86d7-70f889fde139",
            "key": "Add Summary",
            "translations": {
                "uz": "Xulosa qo‘shish",
                "ru": "Добавить итог",
                "en": "Add Summary"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "a7195535-9b53-4dd7-8f74-026759fabde9",
            "key": "Fix columns",
            "translations": {
                "uz": "Ustunni mustahkamlash",
                "ru": "Закрепить столбец",
                "en": "Fix columns"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "7673e1df-cf36-4583-9511-47ec08eb0e88",
            "key": "Hide field",
            "translations": {
                "uz": "Maydonni yashirish",
                "ru": "Скрыть поле",
                "en": "Hide field"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "529521d9-48a2-4df0-8a98-8e1c8d68530b",
            "key": "Delete field",
            "translations": {
                "uz": "Maydonni o‘chirish",
                "ru": "Удалить поле",
                "en": "Delete field"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "b7cfc094-89c1-4b3e-81cd-e449366afcf3",
            "key": "Log out of your account",
            "translations": {
                "uz": "Hisobingizdan chiqish",
                "ru": "Выйти из аккаунта",
                "en": "Log out of your account"
            },
            "category": "Profile Setting",
            "platform": "Admin"
        },
        {
            "id": "f883589b-3862-445e-b6fc-0716e80d3d3d",
            "key": "You will need to log back in to access your workspace.",
            "translations": {
                "uz": "Ish maydoningizga kirish uchun qaytadan tizimga kirishingiz kerak bo‘ladi.",
                "ru": "Вам нужно будет снова войти, чтобы получить доступ к рабочему пространству.",
                "en": "You will need to log back in to access your workspace."
            },
            "category": "Profile Setting",
            "platform": "Admin"
        },
        {
            "id": "ddbc305d-34ac-482f-a824-3215a0f45f1e",
            "key": "Log out",
            "translations": {
                "uz": "Chiqish",
                "ru": "Выйти",
                "en": "Log out"
            },
            "category": "Profile Setting",
            "platform": "Admin"
        },
        {
            "id": "ab28c1c9-bd81-445e-940f-faa484d83869",
            "key": "Cancel",
            "translations": {
                "uz": "Bekor qilish",
                "ru": "Отменить",
                "en": "Cancel"
            },
            "category": "Profile Setting",
            "platform": "Admin"
        },
        {
            "id": "4c0ba85b-84da-4861-b32a-16f5ac82b901",
            "key": "Edit tables",
            "translations": {
                "uz": "Jadvallarni tahrirlash",
                "ru": "Редактировать таблицы",
                "en": "Edit tables"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "5fd1482e-9142-448a-8afe-e2ff7cdf0a69",
            "key": "Add",
            "translations": {
                "uz": "Qo‘shish",
                "ru": "Добавить",
                "en": "Add"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "ecd08e7b-740b-49d3-9289-7459215b2457",
            "key": "Custom endpoint",
            "translations": {
                "uz": "Maxsus endpoint",
                "ru": "Пользовательская конечная точка",
                "en": "Custom endpoint"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "9ee12f88-dffc-451e-a144-4bd641c5f795",
            "key": "Create Folder",
            "translations": {
                "uz": "Papka yaratish",
                "ru": "Создать папку",
                "en": "Create Folder"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "2ad9f872-bd86-4851-ac8a-f17977d89344",
            "key": "Default page link",
            "translations": {
                "uz": "Standart sahifa havolasi",
                "ru": "Ссылка на страницу по умолчанию",
                "en": "Default page link"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "d41697f1-0b50-47cc-8ce1-04ef476f7df8",
            "key": "Main table slug",
            "translations": {
                "uz": "Asosiy jadval slagi",
                "ru": "Основной слаг таблицы",
                "en": "Main table slug"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "e434e68d-0507-4e15-b1c5-b9e2d98e3c85",
            "key": "Field slug",
            "translations": {
                "uz": "Maydon slag",
                "ru": "Слаг поля",
                "en": "Field slug"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "4d18ae21-4f24-443d-897c-c3e234af0030",
            "key": "Create connection",
            "translations": {
                "uz": "Ulanishni yaratish",
                "ru": "Создать соединение",
                "en": "Create cfonnection"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "cd58993c-e5d0-4ba0-9559-6b10b934cdb2",
            "key": "Edit connection",
            "translations": {
                "uz": "Ulanishni tahrirlash",
                "ru": "Редактировать соединение",
                "en": "Edit connection"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "c2c4db12-e813-4b75-9de3-a63d803c008d",
            "key": "Type",
            "translations": {
                "uz": "Turi",
                "ru": "Тип",
                "en": "Type"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "13b52aeb-0be7-4951-b1c8-aceef4ae4d10",
            "key": "Reconnect",
            "translations": {
                "uz": "Qayta ulanish",
                "ru": "Переподключиться",
                "en": "Reconnect"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "7d52f900-63d2-4de8-98cd-2922b02b3052",
            "key": "All users",
            "translations": {
                "uz": "Barcha foydalanuvchilar",
                "ru": "Все пользователи",
                "en": "All users"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "c841d9c2-18f8-4e5c-984d-641cd58f9b59",
            "key": "Gitlab username",
            "translations": {
                "uz": "Gitlab foydalanuvchi nomi",
                "ru": "Имя пользователя Gitlab",
                "en": "Gitlab username"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "74bfb762-69d0-43ea-8283-aaf1323f300e",
            "key": "Token",
            "translations": {
                "uz": "Token",
                "ru": "Токен",
                "en": "Token"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "d12cdb72-a268-48ba-8d98-4259bb20aaf0",
            "key": "Resource name",
            "translations": {
                "uz": "Resurs nomi",
                "ru": "Название ресурса",
                "en": "Resource name"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "f163ef1a-bf2b-4267-b099-628234d779b0",
            "key": "Save",
            "translations": {
                "uz": "Saqlash",
                "ru": "Сохранить",
                "en": "Save"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "5a3a4609-ab46-4a91-a8d9-d4111ff37eb9",
            "key": "Password",
            "translations": {
                "uz": "Parol",
                "ru": "Пароль",
                "en": "Password"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "1528594c-aa15-4217-8501-48b6bfa73854",
            "key": "Originator",
            "translations": {
                "uz": "Yaratuvchi",
                "ru": "Создатель",
                "en": "Originator"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "4d76dc40-6bd5-420f-830a-0306fb826c37",
            "key": "Number of Otp",
            "translations": {
                "uz": "OTP soni",
                "ru": "Количество OTP",
                "en": "Number of OTP"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "a492bdbf-276f-4e25-814a-eebdd6e48803",
            "key": "Used count",
            "translations": {
                "uz": "Foydalanilgan soni",
                "ru": "Количество использований",
                "en": "Used count"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "d096c64e-a1aa-47fc-93f4-b3cc8c005359",
            "key": "RPS limit",
            "translations": {
                "uz": "RPS cheklovi",
                "ru": "Лимит RPS",
                "en": "RPS limit"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "3dd3e559-177f-4e9d-a505-8cef1798e2ec",
            "key": "Monthly limit",
            "translations": {
                "uz": "Oylik cheklov",
                "ru": "Месячный лимит",
                "en": "Monthly limit"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "de905e97-6a8e-4bd0-8942-2290c786495e",
            "key": "Platform name",
            "translations": {
                "uz": "Platforma nomi",
                "ru": "Название платформы",
                "en": "Platform name"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "38116f95-9ec5-4d6f-8884-2ecfb16e5524",
            "key": "Client ID",
            "translations": {
                "uz": "Mijoz ID",
                "ru": "ID клиента",
                "en": "Client ID"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "78a0ba0c-8e4e-4c78-955a-6cf2212a12a0",
            "key": "Download Api documentation",
            "translations": {
                "uz": "API hujjatlarini yuklab olish",
                "ru": "Скачать документацию API",
                "en": "Download Api documentation"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "d2af3e0d-b776-4c7e-88f1-b05f35082d4b",
            "key": "Api keys",
            "translations": {
                "uz": "API kalitlari",
                "ru": "API ключи",
                "en": "Api keys"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "948c57a9-acb9-4907-b86b-1e05dcc9fd07",
            "key": "Host",
            "translations": {
                "uz": "Xost",
                "ru": "Хост",
                "en": "Host"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "9634010b-6405-42b1-82a8-1a981d377d5d",
            "key": "Port",
            "translations": {
                "uz": "Port",
                "ru": "Порт",
                "en": "Port"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "3f3eed7a-d9a9-4027-9bbb-5a594f205c3a",
            "key": "Username",
            "translations": {
                "uz": "Foydalanuvchi nomi",
                "ru": "Имя пользователя",
                "en": "Username"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "4b64f914-3b19-49da-b505-f680f0ea0f77",
            "key": "Default otp",
            "translations": {
                "uz": "Standart OTP",
                "ru": "OTP по умолчанию",
                "en": "Default OTP"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "5e55c10f-2fa1-4ece-92bd-6f16632d0038",
            "key": "Number of otp",
            "translations": {
                "uz": "OTP soni",
                "ru": "Количество OTP",
                "en": "Number of OTP"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "0d8ccece-e90a-42ab-9510-8319946dce1a",
            "key": "Function type",
            "translations": {
                "uz": "Funksiya turi",
                "ru": "Тип функции",
                "en": "Function type"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "ae1e04ee-3f5d-41de-ad00-38d8db571249",
            "key": "Link",
            "translations": {
                "uz": "Havola",
                "ru": "Ссылка",
                "en": "Link"
            },
            "category": "Setting",
            "platform": "Admin"
        },
        {
            "id": "22bf09a5-c8d8-44f0-a396-427f9becd113",
            "key": "Details",
            "translations": {
                "uz": "Tafsilotlar",
                "ru": "Детали",
                "en": "Details"
            },
            "category": "Functions",
            "platform": "Admin"
        },
        {
            "id": "ed709823-b28b-4f70-8808-e666d197ec31",
            "key": "Logs",
            "translations": {
                "uz": "Jurnallar",
                "ru": "Логи",
                "en": "Logs"
            },
            "category": "Functions",
            "platform": "Admin"
        },
        {
            "id": "a0e5e030-899d-43a0-8f32-05ad4b384efd",
            "key": "Repository",
            "translations": {
                "uz": "Repository",
                "ru": "Репозиторий",
                "en": "Repository"
            },
            "category": "Functions",
            "platform": "Admin"
        },
        {
            "id": "b37f6899-430b-4482-ac9b-0f0e93280721",
            "key": "Branch",
            "translations": {
                "uz": "Filial",
                "ru": "Ветка",
                "en": "Branch"
            },
            "category": "Functions",
            "platform": "Admin"
        },
        {
            "id": "5979452f-d165-4e0a-baba-4333a6c34e5f",
            "key": "Name",
            "translations": {
                "uz": "Nomi",
                "ru": "Название",
                "en": "Name"
            },
            "category": "Functions",
            "platform": "Admin"
        },
        {
            "id": "896581f3-51a8-49be-aa2b-e5383a481cf6",
            "key": "Description",
            "translations": {
                "uz": "Tavsif",
                "ru": "Описание",
                "en": "Description"
            },
            "category": "Functions",
            "platform": "Admin"
        },
        {
            "id": "14d47047-053c-464b-b52c-962207723568",
            "key": "Name",
            "translations": {
                "uz": "Nomi",
                "ru": "Название",
                "en": "Name"
            },
            "category": "Microfrontend",
            "platform": "Admin"
        },
        {
            "id": "f6167b56-3241-408d-9a17-0e2037703957",
            "key": "Status",
            "translations": {
                "uz": "Holati",
                "ru": "Статус",
                "en": "Status"
            },
            "category": "Microfrontend",
            "platform": "Admin"
        },
        {
            "id": "a2e2f017-53d5-4da4-b47f-736143f3a845",
            "key": "Description",
            "translations": {
                "uz": "Tavsif",
                "ru": "Описание",
                "en": "Description"
            },
            "category": "Microfrontend",
            "platform": "Admin"
        },
        {
            "id": "56b19fe6-4b5b-447a-b108-3c97ba164283",
            "key": "Link",
            "translations": {
                "uz": "Havola",
                "ru": "Ссылка",
                "en": "Link"
            },
            "category": "Microfrontend",
            "platform": "Admin"
        },
        {
            "id": "3a31f50e-1089-43b7-ab55-5edd4030cf26",
            "key": "Activity Logs",
            "translations": {
                "uz": "Faoliyat jurnallari",
                "ru": "Журналы активности",
                "en": "Activity Logs"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "003a38b0-1abb-4165-84bd-24cbb71d7722",
            "key": "items",
            "translations": {
                "uz": "Elementlar",
                "ru": "Элементы",
                "en": "Items"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "6ec3a21c-977e-486f-8484-00a644e61503",
            "key": "Count",
            "translations": {
                "uz": "Soni",
                "ru": "Количество",
                "en": "Count"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "dddb1c41-c7f7-4149-ac47-22e4ce6f7197",
            "key": "Save",
            "translations": {
                "uz": "Saqlash",
                "ru": "Сохранить",
                "en": "Save"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "f35186ab-4a89-4c2e-9a1f-901728f26662",
            "key": "Role",
            "translations": {
                "uz": "Roli",
                "ru": "Роль",
                "en": "Role"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "273e4acd-fe29-4f7f-bfad-d80a5d8326c2",
            "key": "Edit User",
            "translations": {
                "uz": "Foydalanuvchini tahrirlash",
                "ru": "Редактировать пользователя",
                "en": "Edit User"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "f17ea24f-2c0a-4df9-9853-2fd81e1e3ba4",
            "key": "Sessions",
            "translations": {
                "uz": "Sessiyalar",
                "ru": "Сессии",
                "en": "Sessions"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "aacb5064-ae09-438e-b082-e2e58571802d",
            "key": "Created time",
            "translations": {
                "uz": "Yaratilgan vaqt",
                "ru": "Время создания",
                "en": "Created time"
            },
            "category": "Activity Logs",
            "platform": "Admin"
        },
        {
            "id": "de42f441-3084-4ea1-be99-f576dbe4f5d6",
            "key": "Search",
            "translations": {
                "uz": "Qidiruv",
                "ru": "Поиск",
                "en": "Search"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "f89f0072-f83d-4da5-80fc-f45e6d8f9988",
            "key": "Layouts",
            "translations": {
                "uz": "Tuzilishi",
                "ru": "Макет",
                "en": "Layouts"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "fe885bec-df7b-4fa1-8563-73fee5753256",
            "key": "Tab Group",
            "translations": {
                "uz": "Tab guruh",
                "ru": "Группа вкладок",
                "en": "Tab Group"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "04110d0a-e41e-4146-8680-2820b5318a6b",
            "key": "Group",
            "translations": {
                "uz": "Guruhlash",
                "ru": "Группировать",
                "en": "Group"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "563dd23d-e873-4dc9-9171-8d4eef9acd3b",
            "key": "Fixed",
            "translations": {
                "uz": "Qattiq belgilangan",
                "ru": "Закреплено",
                "en": "Fixed"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "1161b0d2-6ee9-4065-b2a5-affee0b4e42b",
            "key": "Group Columns",
            "translations": {
                "uz": "Ustunlarni guruhlash",
                "ru": "Группировка колонок",
                "en": "Group Columns"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "8b196853-9161-4376-8f92-d9f762e4dc23",
            "key": "Table Settings",
            "translations": {
                "uz": "Jadval sozlamalari",
                "ru": "Настройки таблицы",
                "en": "Table Settings"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "0da48328-0859-42e3-bd9a-fff740e0b0e0",
            "key": "rows",
            "translations": {
                "uz": "qatorlar",
                "ru": "строки",
                "en": "rows"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "051083f7-5a83-4bec-adca-a5a33106c80d",
            "key": "out of",
            "translations": {
                "uz": "dan",
                "ru": "из",
                "en": "out of"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "de55fe7c-3c5f-4765-a1b5-5eb15eaf8b18",
            "key": "Objects",
            "translations": {
                "uz": "Obyektlar",
                "ru": "Объекты",
                "en": "Objects"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "bda13d7a-df44-41c3-a277-8a5aef4fae6b",
            "key": "CREATE NEW FIELD",
            "translations": {
                "uz": "YANGI USTUN YARATISH",
                "ru": "СОЗДАТЬ НОВОЕ ПОЛЕ",
                "en": "CREATE NEW FIELD"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "c43402ce-f00a-404c-98ef-3e36d6d8d860",
            "key": "Label",
            "translations": {
                "uz": "Nomi",
                "ru": "Названия",
                "en": "Label"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "d02c0a6e-0ce2-4ef1-8744-7f074c29af39",
            "key": "Type",
            "translations": {
                "uz": "Tur",
                "ru": "Тип",
                "en": "Type"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "3649799e-dcc9-4e12-a7a0-b0fcdecb9fc2",
            "key": "Format",
            "translations": {
                "uz": "Format",
                "ru": "Формат",
                "en": "Format"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "e48a054d-7dba-4ee9-b253-1fbdcf6e6a7d",
            "key": "Close",
            "translations": {
                "uz": "Yopish",
                "ru": "Закрыть",
                "en": "Close"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "8da4a2ab-ac8f-4de8-a153-6b407b4679f2",
            "key": "Table",
            "translations": {
                "uz": "Jadval",
                "ru": "Таблица",
                "en": "Table"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "244e4ba2-ffa6-4629-89b6-78541da2684f",
            "key": "Table view content",
            "translations": {
                "uz": "Vazifalaringizni Jadval ko‘rinishi yordamida oson boshqaring, yangilang va tartibga soling.",
                "ru": "Легко управляйте, обновляйте и организуйте свои задачи с помощью представления таблицы.",
                "en": "Easily manage, update, and organize your tasks with Table view."
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "d4e5f807-aad6-4091-a962-fbdaf4e0d154",
            "key": "Create view TABLE",
            "translations": {
                "uz": "Ko‘rinish yaratish:  Jadval",
                "ru": "Создать вид таблица",
                "en": "Create view TABLE"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "ffc84c82-39a9-4fae-a565-3de2d59b532c",
            "key": "CALENDAR",
            "translations": {
                "uz": "KALENDAR",
                "ru": "КАЛЕНДАРЬ",
                "en": "CALENDAR"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "4a0ce496-425d-438f-a8d9-a1aebe738bf1",
            "key": "Calendar view content",
            "translations": {
                "uz": "Kalendar ko‘rinishi - bu rejalashtirish, jadval tuzish va resurslarni boshqarish uchun joy.",
                "ru": "Календарный вид – это место для планирования, составления расписаний и управления ресурсами.",
                "en": "Calendar view is your place for planning, scheduling, and resource management."
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "a2ea70f8-e80f-4a81-819a-e0c7551f2d7c",
            "key": "Create View CALENDAR",
            "translations": {
                "uz": "Ko‘rinish yaratish: taqvim",
                "ru": "Создать вид календарь",
                "en": "Create View CALENDAR"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "e083245e-1ce1-43b5-b6ae-2a9c0e5a0e61",
            "key": "TIMELINE",
            "translations": {
                "uz": "Vaqt chizig‘i",
                "ru": "Временная шкала",
                "en": "TIMELINE"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "deed0d45-9ebb-4e93-a234-00ae139c1d7d",
            "key": "Create View TIMELINE",
            "translations": {
                "uz": "Ko‘rinish yaratish: vaqt chizig‘i",
                "ru": "Создать вид временная шкала",
                "en": "Create View TIMELINE"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "d2db86de-40a0-4d88-abf4-0fb615aa1813",
            "key": "BOARD",
            "translations": {
                "uz": "Doska",
                "ru": "Доска",
                "en": "BOARD"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "3386ff14-a9bc-4c55-bb2a-a069dd8ae9b3",
            "key": "WEBSITE",
            "translations": {
                "uz": "Veb-sayt",
                "ru": "Веб-сайт",
                "en": "WEBSITE"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "0ccb64b6-1051-4aeb-8a66-99629c3db07c",
            "key": "Website View Content",
            "translations": {
                "uz": "Veb-sayt ko‘rinishi tashqi kontentni namoyish qilish uchun o‘z havolangizni joylashtirib, har qanday veb-saytni ko‘rsatishga imkon beradi.",
                "ru": "Вид веб-сайта позволяет отображать любой сайт, просто вставив свою ссылку для показа внешнего контента.",
                "en": "Website view allows you to display any website by simply placing your own link to showcase external content."
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "b60ffd27-1472-41e8-8ffd-2384a7734e6b",
            "key": "Create View WEBSITE",
            "translations": {
                "uz": "Ko‘rinish yaratish: veb-sayt",
                "ru": "Создать вид веб-сайт",
                "en": "Create View WEBSITE"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "33610358-f0fd-4f12-aec6-aab69795cde6",
            "key": "Yes",
            "translations": {
                "uz": "Ha",
                "ru": "Да",
                "en": "Yes"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "ce3300d1-c767-4862-a11c-b33b92ea7a9d",
            "key": "Import pop-up content",
            "translations": {
                "uz": "Fayllarni shu yerga tortib tashlang",
                "ru": "Перетащите файлы сюда",
                "en": "Drag and drop files here"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "19ac96be-6bed-40ee-900a-a4bcc7d9f3f4",
            "key": "Browse",
            "translations": {
                "uz": "Ko‘rib chiqish",
                "ru": "Обзор",
                "en": "Browse"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "29c22a7f-071b-4de9-b94d-9efcedb3bc5f",
            "key": "Export to PDF",
            "translations": {
                "uz": "PDF formatiga eksport qilish",
                "ru": "Экспорт в PDF",
                "en": "Export to PDF"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "5832b4e8-b59b-4534-9285-d958fd3eb380",
            "key": "User Type",
            "translations": {
                "uz": "Foydalanuvchi turi",
                "ru": "Тип пользователя",
                "en": "User Type"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "fde10ef9-538c-4293-a061-d6d50ba91d04",
            "key": "Login",
            "translations": {
                "uz": "Kirish",
                "ru": "Войти",
                "en": "Login"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "f195daca-c19a-4351-9072-901a2026d6da",
            "key": "Password",
            "translations": {
                "uz": "Parol",
                "ru": "Пароль",
                "en": "Password"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "64842b47-f1e1-4e64-a059-6f4f4115896f",
            "key": "Email",
            "translations": {
                "uz": "Elektron Pochta",
                "ru": "Электронная Почта",
                "en": "Email"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "3300ad8a-bdf7-42c1-afde-6dc36aff8f7d",
            "key": "Phone",
            "translations": {
                "uz": "Telefon",
                "ru": "Телефон",
                "en": "Phone"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "e79d8594-1778-4e9e-bce8-03ac17f146d0",
            "key": "Login strategy",
            "translations": {
                "uz": "Kirish Strategiyasi",
                "ru": "Стратегия Входа",
                "en": "Login strategy"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "106a0c8d-9579-47f4-8785-3feffffaa9f1",
            "key": "Add",
            "translations": {
                "uz": "Qo‘shish",
                "ru": "Добавить",
                "en": "Add"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "e9406877-79be-4f21-b2c5-445c76e93671",
            "key": "Edit field",
            "translations": {
                "uz": "Maydonni Tahrirlash",
                "ru": "Редактировать Поле",
                "en": "Edit field"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "046b72ec-b3ad-430e-abe6-1ac98ed08755",
            "key": "Name",
            "translations": {
                "uz": "Nomi",
                "ru": "Названия",
                "en": "Name"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "d163bced-8ffa-4c83-b46a-b4249c25e573",
            "key": "Login",
            "translations": {
                "uz": "Kirish",
                "ru": "Войти",
                "en": "Login"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "61e0479c-42e9-4f6c-9e46-8ce85ff2f71c",
            "key": "Role",
            "translations": {
                "uz": "Rol",
                "ru": "Роль",
                "en": "Role"
            },
            "category": "UserInvite",
            "platform": "Admin"
        },
        {
            "id": "b9e3528f-e3b9-47e3-aed6-c2c5494119e4",
            "key": "key",
            "translations": {
                "uz": "Kalit",
                "ru": "Ключ",
                "en": "Key"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "2eb28f68-c782-4509-ac24-bc0cda650de8",
            "key": "Value",
            "translations": {
                "uz": "Qiymat",
                "ru": "Значение",
                "en": "Value"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "22d6686e-b5b0-46a9-9ef6-00e48dc60f7c",
            "key": "Save",
            "translations": {
                "uz": "Saqlash",
                "ru": "Сохранить",
                "en": "Save"
            },
            "category": "Field settings",
            "platform": "Admin"
        },
        {
            "id": "4e84c080-33ef-4170-8740-7743c45bad50",
            "key": "Paper",
            "translations": {
                "uz": "Qog'oz",
                "ru": "Лист",
                "en": "Paper"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "330fff4f-3894-4c8b-9407-f8557d223912",
            "key": "Format document",
            "translations": {
                "uz": "Hujjat formati",
                "ru": "Формат документа",
                "en": "Format document"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "197fa1d5-dbfa-4e0d-ad34-5c70ec317023",
            "key": "Cash receipt",
            "translations": {
                "uz": "Naqd pul qabulnomasi",
                "ru": "Кассовый чек",
                "en": "Cash receipt"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "b6164500-3570-4290-8301-381b42833541",
            "key": "Detailed",
            "translations": {
                "uz": "Batafsil",
                "ru": "Подробный",
                "en": "Detailed"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "e76d7219-7057-42f5-89e8-3aa94f81d9ed",
            "key": "Info",
            "translations": {
                "uz": "Ma'lumot",
                "ru": "Информация",
                "en": "Info"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "10d0cd81-1ea3-48ae-b61d-4850c5c41eeb",
            "key": "Tab",
            "translations": {
                "uz": "Tab",
                "ru": "Таб",
                "en": "Tab"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "88d647d3-4521-4816-a86f-8716ebbb6f04",
            "key": "Main info",
            "translations": {
                "uz": "Asosiy ma'lumot",
                "ru": "Основная информация",
                "en": "Main info"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "d2729c0c-9d49-41df-84ff-5ff54a961d21",
            "key": "Enter name",
            "translations": {
                "uz": "Ismni kiriting",
                "ru": "Введите имя",
                "en": "Enter name"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "2ad68c21-0a1a-4df8-8a81-8e815c8b31e3",
            "key": "Enter email",
            "translations": {
                "uz": "Elektron pochta kiriting",
                "ru": "Введите email",
                "en": "Enter email"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "b49065ad-187f-4494-9e67-ada22eff8750",
            "key": "Enter phone",
            "translations": {
                "uz": "Telefon kiriting",
                "ru": "Введите телефон",
                "en": "Enter phone"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "871c20bd-976d-49ea-a3b8-d51b16880c36",
            "key": "Enter login",
            "translations": {
                "uz": "Login kiriting",
                "ru": "Введите логин",
                "en": "Enter login"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "ec99e75d-0cbf-4fe7-9e63-9aad3f60f09d",
            "key": "Old Password",
            "translations": {
                "uz": "Eski parol",
                "ru": "Старый пароль",
                "en": "Old Password"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "711a3ab4-a97d-4c6e-bc9f-7db715fc8820",
            "key": "Enter old password",
            "translations": {
                "uz": "Eski parolni kiriting",
                "ru": "Введите старый пароль",
                "en": "Enter old password"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "5269c011-640b-414c-b936-35a45cc4b9b9",
            "key": "New password",
            "translations": {
                "uz": "Yangi parol",
                "ru": "Новый пароль",
                "en": "New password"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "243cbd61-b48c-428f-8c55-fab72fa3a89b",
            "key": "Enter new password",
            "translations": {
                "uz": "Yangi parolni kiriting",
                "ru": "Введите новый пароль",
                "en": "Enter new password"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "0a497957-0a82-4510-8f9d-2690b99b470c",
            "key": "Confirm password",
            "translations": {
                "uz": "Parolni tasdiqlang",
                "ru": "Подтвердите пароль",
                "en": "Confirm password"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "de50683b-40c0-4150-9763-1c1e26cd8e29",
            "key": "Enter confirm password",
            "translations": {
                "uz": "Parolni qayta kiriting",
                "ru": "Введите подтверждение пароля",
                "en": "Enter confirm password"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "a4408e0a-b1e5-47ff-ae4c-d2470dcdb652",
            "key": "Set variables",
            "translations": {
                "uz": "O'zgaruvchilarni sozlash",
                "ru": "Установить переменные",
                "en": "Set variables"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "07cfd1a0-3de8-4bdc-a22c-fb52ed3a5a28",
            "key": "Enter",
            "translations": {
                "uz": "Kiriting",
                "ru": "Введите",
                "en": "Enter"
            },
            "category": "Manu",
            "platform": "Admin"
        },
        {
            "id": "113d2b82-9b2a-47a9-800d-996237113069",
            "key": "Save",
            "translations": {
                "uz": "Saqlash",
                "ru": "Сохранить",
                "en": "Save"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "406d437c-203e-4b2b-bab1-47e8a57d52d1",
            "key": "Add column",
            "translations": {
                "uz": "Ustun qo'shish",
                "ru": "Добавить столбец",
                "en": "Add column"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "d6f76d35-f0f5-493b-8587-53939f4d2587",
            "key": "Cancel",
            "translations": {
                "uz": "Bekor qilish",
                "ru": "Отменить",
                "en": "Cancel"
            },
            "category": "Menu",
            "platform": "Admin"
        },
        {
            "id": "0963bbbf-5727-400d-bd5c-d2367cf597be",
            "key": "Cancel",
            "translations": {
                "uz": "Bekor qilish",
                "ru": "Отменить",
                "en": "Cancel"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "1996a467-4663-4ec7-91a3-b61406423788",
            "key": "Cancel",
            "translations": {
                "uz": "Bekor qilish",
                "ru": "Отменить",
                "en": "Cancel"
            },
            "category": "Layout",
            "platform": "Admin"
        },
        {
            "id": "6f2dc744-85e9-4217-94de-4d401122314b",
            "key": "Templates",
            "translations": {
                "uz": "Andozalar",
                "ru": "Шаблоны",
                "en": "Templates"
            },
            "category": "Table",
            "platform": "Admin"
        },
        {
            "id": "7200ab15-1fbd-4656-9560-2b978d37ef19",
            "key": "Variable",
            "translations": {
                "uz": "O'zgaruvchi",
                "ru": "Переменная",
                "en": "Variable"
            },
            "category": "Table",
            "platform": "Admin"
        }
    ]

    return languages;
}

module.exports = createLanguage;