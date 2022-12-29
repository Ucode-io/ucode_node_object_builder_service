async function createSection() {
  let section = [{
    "id": "dae3b1e4-a272-42b2-8a53-24740f490c61",
    "order": 1,
    "column": "SINGLE",
    "label": "Детали",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "c5962e1c-2687-46a5-b2dd-d46d41a038c1",
        "column": 0,
        "order": 1,
        "field_name": "Разрешение на просмотр",
        "relation_type": ""
      },
      {
        "id": "076c519a-5503-4bff-99f1-c741ed7d47b8",
        "column": 0,
        "order": 2,
        "field_name": "Ид свяьза",
        "relation_type": ""
      },
      {
        "id": "d8127cf2-2d60-474e-94ba-317d3b1ba18a",
        "column": 0,
        "order": 3,
        "field_name": "Название таблица",
        "relation_type": ""
      },
      {
        "id": "role#158213ef-f38d-4c0d-b9ec-815e4d27db7e",
        "column": 0,
        "order": 4,
        "field_name": "Роли",
        "relation_type": "Many2One"
      }
    ],
    "is_summary_section": false,
    "table_id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "6c8eabc5-4de2-4eb5-b98a-768f0d340819",
    "order": 2,
    "column": "SINGLE",
    "label": "Summary",
    "icon": "",
    "fields": [],
    "is_summary_section": true,
    "table_id": "074fcb3b-038d-483d-b390-ca69490fc4c3",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "0819a8b6-f821-4e54-9098-beab8cef352c",
    "order": 1,
    "column": "SINGLE",
    "label": "Инфо",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "546320ae-8d9f-43cb-afde-3df5701e4b49",
        "column": 0,
        "order": 1,
        "field_name": "Icon",
        "relation_type": ""
      },
      {
        "id": "9d53673d-4df3-4679-91be-8a787bdff724",
        "column": 0,
        "order": 2,
        "field_name": "Table Slug",
        "relation_type": ""
      },
      {
        "id": "b73c268c-9b91-47e4-9cb8-4f1d4ad14605",
        "column": 0,
        "order": 3,
        "field_name": "View label",
        "relation_type": ""
      },
      {
        "id": "a9767595-8863-414e-9220-f6499def0276",
        "column": 0,
        "order": 4,
        "field_name": "View Slug",
        "relation_type": ""
      },
      {
        "id": "71a33f28-002e-42a9-95fe-934a1f04b789",
        "column": 0,
        "order": 5,
        "field_name": "Тип",
        "relation_type": ""
      },
      {
        "id": "c71928df-22d1-408c-8d63-7784cbec4a1d",
        "column": 0,
        "order": 6,
        "field_name": "Название",
        "relation_type": ""
      },
      {
        "id": "client_type#65a2d42f-5479-422f-84db-1a98547dfa04",
        "column": 0,
        "order": 7,
        "field_name": "Тип клиентов",
        "relation_type": "Many2One"
      }
    ],
    "table_id": "0ade55f8-c84d-42b7-867f-6418e1314e28",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "5934a317-94f1-4ad6-b93a-bec839a9140c",
    "order": 1,
    "column": "SINGLE",
    "label": "Инфо",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "c12adfef-2991-4c6a-9dff-b4ab8810f0df",
        "column": 0,
        "order": 1,
        "field_name": "Название роли",
        "relation_type": ""
      },
      {
        "id": "client_type#8ab28259-800d-4079-8572-a0f033d70e35",
        "column": 0,
        "order": 2,
        "field_name": "Тип клиентов",
        "relation_type": "Many2One"
      },
      {
        "id": "client_platform#ca008469-cfe2-4227-86db-efdf69680310",
        "column": 0,
        "order": 3,
        "field_name": "Клиент платформа",
        "relation_type": "Many2One"
      },
      {
        "id": "project#a56d0ad8-4645-42d8-9fbb-77e22526bd17",
        "column": 0,
        "order": 4,
        "field_name": "Проект",
        "relation_type": "Many2One"
      }
    ],
    "table_id": "1ab7fadc-1f2b-4934-879d-4e99772526ad",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "b8f29626-81d4-494c-9c62-fb523bfcca65",
    "order": 2,
    "column": "SINGLE",
    "label": "Summary",
    "icon": "",
    "fields": [],
    "is_summary_section": true,
    "table_id": "2546e042-af2f-4cef-be7c-834e6bde951c",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "13f969c2-d7b2-46a5-a436-0c263f31af8b",
    "order": 1,
    "column": "SINGLE",
    "label": "Инфо",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "36bc2274-0c0d-47af-8aeb-7a799c0a8d0b",
        "column": 0,
        "order": 1,
        "field_name": "Номер телефона",
        "relation_type": ""
      },
      {
        "id": "ad070af0-aca3-41ff-9f6a-a5e8b52f8f5a",
        "column": 0,
        "order": 2,
        "field_name": "Фамиля",
        "relation_type": ""
      },
      {
        "id": "17e7dc4e-cf14-4663-829a-d43d528c06e0",
        "column": 0,
        "order": 3,
        "field_name": "Место работа",
        "relation_type": ""
      },
      {
        "id": "ba3ff08e-3cd3-4a14-9319-289ec730d285",
        "column": 0,
        "order": 4,
        "field_name": "Пасспорт номер",
        "relation_type": ""
      },
      {
        "id": "afe9d898-e620-4832-aec3-34d13496b70a",
        "column": 0,
        "order": 5,
        "field_name": "Пасспорт серия",
        "relation_type": ""
      },
      {
        "id": "49d8e248-902b-43cf-904a-e465a0d4c420",
        "column": 0,
        "order": 6,
        "field_name": "Зарплата",
        "relation_type": ""
      },
      {
        "id": "client_type#8f123dec-dfe4-4b89-956c-f607c84a84bd",
        "column": 0,
        "order": 7,
        "field_name": "Тип клиентов",
        "relation_type": "Many2One"
      },
      {
        "id": "client_platform#e03071ed-a3e1-417d-a654-c0998a7c74bc",
        "column": 0,
        "order": 8,
        "field_name": "Клиент платформа",
        "relation_type": "Many2One"
      },
      {
        "id": "project#6d2f94cb-0de4-455e-8dfc-97800eac7579",
        "column": 0,
        "order": 9,
        "field_name": "Проект",
        "relation_type": "Many2One"
      },
      {
        "id": "role#63b54109-5476-43c1-bf26-24e2266a33f0",
        "column": 0,
        "order": 10,
        "field_name": "Роли",
        "relation_type": "Many2One"
      },
      {
        "id": "d99e474a-d13e-42d4-b848-b86bc1808cf8",
        "column": 0,
        "order": 11,
        "field_name": "Проверен",
        "relation_type": ""
      },
      {
        "id": "539363ad-4d5a-4570-944c-fb1e0d00f4bf",
        "column": 0,
        "order": 12,
        "field_name": "Email",
        "relation_type": ""
      },
      {
        "id": "22144ff4-7c1c-4102-9697-80f3ccaf3941",
        "column": 0,
        "order": 13,
        "field_name": "Имя",
        "relation_type": ""
      },
      {
        "id": "d1a2df97-d21f-47d3-b5d2-90cba03926da",
        "column": 0,
        "order": 14,
        "field_name": "Фото",
        "relation_type": ""
      },
      {
        "id": "978e1507-3965-4f21-a522-041072e261cd",
        "column": 0,
        "order": 15,
        "field_name": "Логин",
        "relation_type": ""
      },
      {
        "id": "87ddadf0-689b-4285-9fc7-5cb76bdd4a7c",
        "column": 0,
        "order": 16,
        "field_name": "Срок годности",
        "relation_type": ""
      },
      {
        "id": "3228884d-e937-4428-b940-52e5fae10c63",
        "column": 0,
        "order": 17,
        "field_name": "Пароль",
        "relation_type": ""
      },
      {
        "id": "645d85b8-67e0-4594-96c7-540b63d6b018",
        "column": 0,
        "order": 18,
        "field_name": "Актив",
        "relation_type": ""
      }
    ],
    "is_summary_section": false,
    "table_id": "2546e042-af2f-4cef-be7c-834e6bde951c",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "1d9bc74b-7f9c-47da-b257-071010b6f28f",
    "order": 1,
    "column": "SINGLE",
    "label": "Инфо",
    "icon": "info.svg",
    "fields": [
      {
        "id": "role#82e93baf-2e02-432a-942b-2c93cbe26b89",
        "column": 0,
        "order": 1,
        "field_name": "Роли",
        "relation_type": "Many2One"
      },
      {
        "id": "9bdbb8eb-334b-4515-87dc-20abd0da129a",
        "column": 0,
        "order": 2,
        "field_name": "Название таблица",
        "relation_type": ""
      },
      {
        "id": "27355d70-1c11-4fb9-9192-a1fffd93d9db",
        "column": 0,
        "order": 3,
        "field_name": "Чтение",
        "relation_type": ""
      },
      {
        "id": "f932bf71-9049-462b-9342-8347bca7598d",
        "column": 0,
        "order": 4,
        "field_name": "Изменение",
        "relation_type": ""
      },
      {
        "id": "1e71486b-1438-4170-8883-50b505b8bb14",
        "column": 0,
        "order": 5,
        "field_name": "Написать",
        "relation_type": ""
      },
      {
        "id": "d95c1242-63ab-45c1-bd23-86f23ee72971",
        "column": 0,
        "order": 6,
        "field_name": "Удаление",
        "relation_type": ""
      },
      {
        "id": "5f099f9f-8217-4790-a8ee-954ec165b8d8",
        "column": 0,
        "order": 7,
        "field_name": "Есть условия",
        "relation_type": ""
      }
    ],
    "is_summary_section": false,
    "table_id": "25698624-5491-4c39-99ec-aed2eaf07b97",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "85ba2dfb-2e53-47d1-897b-b38fb5fb96a2",
    "order": 1,
    "column": "SINGLE",
    "label": "Info",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "37137f5f-ef9b-4710-a6df-fb920750fdfb",
        "column": 0,
        "order": 0,
        "field_name": "Название"
      },
      {
        "id": "dfbf6a89-9c78-4922-9a00-0e1555c23ece",
        "column": 0,
        "order": 0,
        "field_name": "Домен проекта"
      }
    ],
    "table_id": "373e9aae-315b-456f-8ec3-0851cad46fbf",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "92e97876-37e5-4c26-9ffd-757ef6f27b3d",
    "order": 1,
    "column": "SINGLE",
    "label": "Инфо",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "8368fc76-0e80-409c-b64e-2275304411d8",
        "column": 0,
        "order": 1,
        "field_name": "Название таблица",
        "relation_type": ""
      },
      {
        "id": "957ffe32-714a-41d2-9bd8-e6b6b30fef67",
        "column": 0,
        "order": 2,
        "field_name": "Полья объекты",
        "relation_type": ""
      },
      {
        "id": "6d5d18cd-255d-49fd-a08e-5a6b0f1b093f",
        "column": 0,
        "order": 3,
        "field_name": "Пользавательские полья",
        "relation_type": ""
      },
      {
        "id": "role#697fbd16-97d8-4233-ab21-4ce12dd6c5c6",
        "column": 0,
        "order": 4,
        "field_name": "Роли",
        "relation_type": "Many2One"
      }
    ],
    "table_id": "4c1f5c95-1528-4462-8d8c-cd377c23f7f7",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "0c4e79e7-45d8-4048-b81d-8b18f7bf783e",
    "order": 1,
    "column": "SINGLE",
    "label": "Info",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "c818bc89-c2e9-4181-9db4-06fdf837d6e2",
        "column": 0,
        "order": 1,
        "field_name": "Название платформы",
        "relation_type": ""
      },
      {
        "id": "948500db-538e-412b-ba36-09f5e9f0eccc",
        "column": 0,
        "order": 2,
        "field_name": "Субдомен платформы",
        "relation_type": ""
      },
      {
        "id": "project#c1492b03-8e76-4a09-9961-f61d413dbe68",
        "column": 0,
        "order": 3,
        "field_name": "Проект",
        "relation_type": "Many2One"
      }
    ],
    "is_summary_section": false,
    "table_id": "53edfff0-2a31-4c73-b230-06a134afa50b",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "9b849f45-561f-477f-a1d6-e7cbf6fe41a6",
    "order": 2,
    "column": "SINGLE",
    "label": "Summary",
    "icon": "",
    "fields": [],
    "is_summary_section": true,
    "table_id": "5af2bfb2-6880-42ad-80c8-690e24a2523e",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "1481e534-b6a2-44d8-8e78-e2e75083fb88",
    "order": 1,
    "column": "SINGLE",
    "label": "Детали",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "34abee63-37ad-48c1-95d2-f4a032c373a1",
        "column": 0,
        "order": 1,
        "field_name": "Название таблица",
        "relation_type": ""
      },
      {
        "id": "1e39a65d-9709-4c5a-99e4-dde67191d95a",
        "column": 0,
        "order": 2,
        "field_name": "Ид действия",
        "relation_type": ""
      },
      {
        "id": "role#d522a2ac-7fb4-413d-b5bb-8d1d34b65b98",
        "column": 0,
        "order": 3,
        "field_name": "Роли",
        "relation_type": "Many2One"
      },
      {
        "id": "b84f052c-c407-48c5-a4bf-6bd54869fbd7",
        "column": 0,
        "order": 4,
        "field_name": "Разрешение",
        "relation_type": ""
      }
    ],
    "is_summary_section": false,
    "table_id": "5af2bfb2-6880-42ad-80c8-690e24a2523e",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "1ef2a483-2135-448d-b3b6-c4a496425573",
    "order": 1,
    "column": "SINGLE",
    "label": "Инфо",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "f5486957-e804-4050-a3c5-cfdcdaca0a16",
        "column": 0,
        "order": 1,
        "field_name": "Table Slug",
        "relation_type": ""
      },
      {
        "id": "5591515f-8212-4bd5-b13b-fffd9751e9ce",
        "column": 0,
        "order": 2,
        "field_name": "Login label",
        "relation_type": ""
      },
      {
        "id": "fbc9b3e9-0507-48f5-9772-d42febfb4d30",
        "column": 0,
        "order": 3,
        "field_name": "Login view",
        "relation_type": ""
      },
      {
        "id": "35ddf13d-d724-42ab-a1bb-f3961c7db9d6",
        "column": 0,
        "order": 4,
        "field_name": "Password view",
        "relation_type": ""
      },
      {
        "id": "276c0e0c-2b79-472a-bcdf-ac0eed115ebe",
        "column": 0,
        "order": 5,
        "field_name": "Password label",
        "relation_type": ""
      },
      {
        "id": "d02ddb83-ad98-47f5-bc0a-6ee7586d9a8e",
        "column": 0,
        "order": 6,
        "field_name": "Login strategy",
        "relation_type": ""
      },
      {
        "id": "7ab42774-6ca9-4e10-a71b-77871009e0a2",
        "column": 0,
        "order": 7,
        "field_name": "Ид обьеткта",
        "relation_type": ""
      },
      {
        "id": "client_type#79bdd075-eef0-48d1-b763-db8dfd819043",
        "column": 0,
        "order": 8,
        "field_name": "Тип клиентов",
        "relation_type": "Many2One"
      }
    ],
    "table_id": "5db33db7-4524-4414-b65a-b6b8e5bba345",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "5d356993-be07-48af-b719-e4eecc5e6b5f",
    "order": 1,
    "column": "SINGLE",
    "label": "Детали",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "00787831-04b4-4a08-b74d-14f80a219b86",
        "column": 0,
        "order": 1,
        "field_name": "Разрешение на просмотр",
        "relation_type": ""
      },
      {
        "id": "9ae553a2-edca-41f7-ba8a-557dc24cb74a",
        "column": 0,
        "order": 2,
        "field_name": "Изменить разрешение",
        "relation_type": ""
      },
      {
        "id": "27634c7a-1de8-4d54-9f57-5ff7c77d0af9",
        "column": 0,
        "order": 3,
        "field_name": "Название таблица",
        "relation_type": ""
      },
      {
        "id": "7587ed1d-a8b9-4aa8-b845-56dbb9333e25",
        "column": 0,
        "order": 4,
        "field_name": "Ид поля",
        "relation_type": ""
      },
      {
        "id": "285ceb40-6267-4f5e-9327-f75fe79e8bfe",
        "column": 0,
        "order": 5,
        "field_name": "Название поля",
        "relation_type": ""
      },
      {
        "id": "role#8283449e-7978-4e75-83d6-1b6f3a194683",
        "column": 0,
        "order": 6,
        "field_name": "Роли",
        "relation_type": "Many2One"
      }
    ],
    "table_id": "961a3201-65a4-452a-a8e1-7c7ba137789c",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "c9453c53-ca78-4d55-91f7-4f3dfe271e36",
    "order": 1,
    "column": "SINGLE",
    "label": "Инфо",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "04d0889a-b9ba-4f5c-8473-c8447aab350d",
        "column": 0,
        "order": 1,
        "field_name": "Название типа",
        "relation_type": ""
      },
      {
        "id": "d99ac785-1d1a-49d8-af23-4d92774d15b6",
        "column": 0,
        "order": 2,
        "field_name": "Подтверждено",
        "relation_type": ""
      },
      {
        "id": "d37e08d6-f7d0-441e-b7af-6034e5c2a77f",
        "column": 0,
        "order": 3,
        "field_name": "Самовосстановление",
        "relation_type": ""
      },
      {
        "id": "763a0625-59d7-4fd1-ad4b-7ef303c3aadf",
        "column": 0,
        "order": 4,
        "field_name": "Саморегистрация",
        "relation_type": ""
      },
      {
        "id": "client_platform#426a0cd6-958d-4317-bf23-3b4ea4720e53",
        "column": 0,
        "order": 5,
        "field_name": "Клиент платформа",
        "relation_type": "Many2Many"
      },
      {
        "id": "project#094c33df-5556-45f3-a74c-7f589412bcc8",
        "column": 0,
        "order": 6,
        "field_name": "Проект",
        "relation_type": "Many2One"
      }
    ],
    "is_summary_section": false,
    "table_id": "ed3bf0d9-40a3-4b79-beb4-52506aa0b5ea",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }, {
    "id": "71441c9d-0d95-4124-98e2-341260df93d6",
    "order": 1,
    "column": "SINGLE",
    "label": "Детали",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "5dda58a1-84ac-4c50-8993-02e2cefcb29a",
        "column": 0,
        "order": 1,
        "field_name": "Размер",
        "relation_type": ""
      },
      {
        "id": "98279b02-10c0-409e-8303-14224fd76ec6",
        "column": 0,
        "order": 2,
        "field_name": "HTML",
        "relation_type": ""
      },
      {
        "id": "9772b679-33ec-4004-b527-317a1165575e",
        "column": 0,
        "order": 3,
        "field_name": "Название",
        "relation_type": ""
      },
      {
        "id": "834df8ef-edb7-4170-996c-9bd5431d9a62",
        "column": 0,
        "order": 4,
        "field_name": "Таблица",
        "relation_type": ""
      },
      {
        "id": "doctors#cfb1a7df-3d05-44ce-9de1-12c1c4f99b34",
        "column": 0,
        "order": 5,
        "field_name": "Специалисты",
        "relation_type": "Many2One"
      }
    ],
    "is_summary_section": false,
    "table_id": "08972256-30fb-4d75-b8cf-940d8c4fc8ac",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  },
  {
    "id": "9db609be-0c53-42fe-b063-cdbc64bc4e76",
    "order": 2,
    "column": "SINGLE",
    "label": "Summary",
    "icon": "",
    "fields": [],
    "is_summary_section": true,
    "table_id": "08972256-30fb-4d75-b8cf-940d8c4fc8ac",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  },
  {
    "id": "43d78c83-1924-47a0-a51a-21be8c1e9352",
    "order": 1,
    "column": "SINGLE",
    "label": "Детали",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "branches#32e05007-f0d1-4f62-a17f-276502116d42",
        "column": 0,
        "order": 1,
        "field_name": "Филиалы",
        "relation_type": "Many2One"
      },
      {
        "id": "categories#ae355887-5bb3-4e67-bd76-c0f51bc4c881",
        "column": 0,
        "order": 2,
        "field_name": "Отделение",
        "relation_type": "Many2Many"
      },
      {
        "id": "specialities#3598b204-74ec-45ff-8831-1a0d7cfcf162",
        "column": 0,
        "order": 3,
        "field_name": "Направление",
        "relation_type": "Many2Many"
      },
      {
        "id": "9212144e-e0ce-4267-a013-96c24bdf43db",
        "column": 0,
        "order": 4,
        "field_name": "Показать на сайте на главном странице",
        "relation_type": ""
      },
      {
        "id": "9876f21c-ac10-4500-ac60-49925f959c22",
        "column": 0,
        "order": 5,
        "field_name": "Зарубежная врачь",
        "relation_type": ""
      },
      {
        "id": "10381db4-2229-45c6-b829-114c83c324c4",
        "column": 0,
        "order": 6,
        "field_name": "учёная степень",
        "relation_type": ""
      },
      {
        "id": "0c1cd74e-f2b5-4722-8182-95bb9e823c5b",
        "column": 0,
        "order": 7,
        "field_name": "Телемедицина",
        "relation_type": ""
      },
      {
        "id": "594a42b4-afab-40ea-bb2b-76afb3d4541b",
        "column": 0,
        "order": 8,
        "field_name": "Фамилия",
        "relation_type": ""
      },
      {
        "id": "4ea88c51-404f-485a-9b39-0fc04b917455",
        "column": 0,
        "order": 9,
        "field_name": "Имя",
        "relation_type": ""
      },
      {
        "id": "e38e938c-946a-4117-b91d-d7dcd6a88f8b",
        "column": 0,
        "order": 10,
        "field_name": "Отчество",
        "relation_type": ""
      },
      {
        "id": "5e3eb754-afea-4ed0-87e0-0045d9d6b29c",
        "column": 0,
        "order": 11,
        "field_name": "Дата рождение",
        "relation_type": ""
      },
      {
        "id": "2c6d1713-52a1-478f-8b6b-269f88872b4c",
        "column": 0,
        "order": 12,
        "field_name": "Статус",
        "relation_type": ""
      },
      {
        "id": "921e385d-14c3-419d-b208-3d64ec872c28",
        "column": 0,
        "order": 13,
        "field_name": "Пол",
        "relation_type": ""
      },
      {
        "id": "d2374b19-224e-4de6-9cb6-b2415d0c8a08",
        "column": 0,
        "order": 14,
        "field_name": "Тип пациентов по возрасту",
        "relation_type": ""
      }
    ],
    "is_summary_section": false,
    "table_id": "6b99e876-b4d8-440c-b2e2-a961530690f8",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  },
  {
    "id": "fa9bb2f8-de14-4d43-b0a0-741326ea17a8",
    "order": 2,
    "column": "SINGLE",
    "label": "Контакты",
    "icon": "square-phone.svg",
    "fields": [
      {
        "id": "3d1104d1-955c-4eb7-90d9-a474166b3302",
        "column": 0,
        "order": 1,
        "field_name": "Телефон",
        "relation_type": ""
      },
      {
        "id": "b3a50c0f-f1ee-4044-bbdf-a197f6ea8f90",
        "column": 0,
        "order": 2,
        "field_name": "Email",
        "relation_type": ""
      }
    ],
    "is_summary_section": false,
    "table_id": "6b99e876-b4d8-440c-b2e2-a961530690f8",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  },
  {
    "id": "ee5f297c-deae-46cf-9358-7f994120d193",
    "order": 3,
    "column": "SINGLE",
    "label": "Пасспортние данные",
    "icon": "passport.svg",
    "fields": [
      {
        "id": "4328279e-1bad-4d69-87a0-c10e32089e26",
        "column": 0,
        "order": 1,
        "field_name": "Фото пасспорта",
        "relation_type": ""
      },
      {
        "id": "d4c55b2b-864f-42e3-9c1c-c2bce11df4c4",
        "column": 0,
        "order": 2,
        "field_name": "ПИНФЛ",
        "relation_type": ""
      },
      {
        "id": "ed1e123a-c845-494b-8346-d7bda3bbcb15",
        "column": 0,
        "order": 3,
        "field_name": "Серия и номер пасспорта",
        "relation_type": ""
      }
    ],
    "is_summary_section": false,
    "table_id": "6b99e876-b4d8-440c-b2e2-a961530690f8",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  },
  {
    "id": "68a54d6d-0e8d-41d2-ae47-2b9d3694eb65",
    "order": 4,
    "column": "SINGLE",
    "label": "Информация о докторе",
    "icon": "address-book.svg",
    "fields": [
      {
        "id": "e6c42a89-62c6-4246-a557-94e4ebf4bd44",
        "column": 0,
        "order": 1,
        "field_name": "Опыт работы",
        "relation_type": ""
      },
      {
        "id": "9c83c2de-1189-4449-98ab-b1687c8ab149",
        "column": 0,
        "order": 2,
        "field_name": "Образование:",
        "relation_type": ""
      },
      {
        "id": "ff91ee92-07e1-41b3-8d24-b3a270ee02bf",
        "column": 0,
        "order": 3,
        "field_name": "Спецификация:",
        "relation_type": ""
      },
      {
        "id": "5f5e4a0b-0b48-48aa-a786-aab5e46cac06",
        "column": 0,
        "order": 4,
        "field_name": "Профессиональные награды:",
        "relation_type": ""
      },
      {
        "id": "7265e91c-2cc0-40d5-89d9-f9d7031839e9",
        "column": 0,
        "order": 5,
        "field_name": "Начало врачебной практики",
        "relation_type": ""
      },
      {
        "id": "a0404df4-fcd8-42d3-b5ac-a6c64fa8a658",
        "column": 0,
        "order": 6,
        "field_name": "Довольных пациентов",
        "relation_type": ""
      }
    ],
    "is_summary_section": false,
    "table_id": "6b99e876-b4d8-440c-b2e2-a961530690f8",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  },
  {
    "id": "3e45c852-5a3c-4353-ad3f-eb1cba49e5a8",
    "order": 5,
    "column": "SINGLE",
    "label": "Summary",
    "icon": "",
    "fields": [],
    "is_summary_section": true,
    "table_id": "6b99e876-b4d8-440c-b2e2-a961530690f8",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  },
  {
    "id": "180c2a0c-29fa-43aa-851f-36ac3f3fe382",
    "order": 1,
    "column": "SINGLE",
    "label": "Детали",
    "icon": "circle-info.svg",
    "fields": [
      {
        "id": "61870278-3195-4874-9c0c-28104bbfb19a",
        "column": 0,
        "order": 1,
        "field_name": "Тип файла",
        "relation_type": ""
      },
      {
        "id": "5c0efd79-60f4-455b-b1df-e51e3b56b140",
        "column": 0,
        "order": 2,
        "field_name": "Линк фвйла",
        "relation_type": ""
      },
      {
        "id": "afb99f72-106d-4939-b831-9e4b025afb9f",
        "column": 0,
        "order": 3,
        "field_name": "Название",
        "relation_type": ""
      },
      {
        "id": "b7e00be4-70f2-4a57-bf77-91d3834d0520",
        "column": 0,
        "order": 4,
        "field_name": "Размер",
        "relation_type": ""
      },
      {
        "id": "a99106a9-32dc-446b-9850-8713d687804a",
        "column": 0,
        "order": 5,
        "field_name": "Время создание",
        "relation_type": ""
      },
      {
        "id": "b1bb10c9-d399-4baa-98d1-0a04171ff5d1",
        "column": 0,
        "order": 6,
        "field_name": "Теги",
        "relation_type": ""
      }
    ],
    "is_summary_section": false,
    "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  },
  {
    "id": "d8799d30-d7f1-4558-9efe-700627aff734",
    "order": 2,
    "column": "SINGLE",
    "label": "Summary",
    "icon": "",
    "fields": [],
    "is_summary_section": true,
    "table_id": "b1896ed7-ba00-46ae-ae53-b424d2233589",
    "created_at": new Date(),
    "updated_at": new Date(),
    "__v": 0
  }]

  return section
}

module.exports = createSection