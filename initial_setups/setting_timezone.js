async function createSettingTimezone() {
    let timezones = [
        {
            id: '792eff35-b256-4e08-a916-88d4810fb9ec',
            name: 'Pacific/Niue',
            text: '(GMT-11:00) Niue'
          } ,
          {
            id: '2193d9a2-3f8d-4d5b-9d17-86c6e1a5be37',
            name: 'Pacific/Pago_Pago',
            text: '(GMT-11:00) Pago Pago'
          } ,
          {
            id: '03a8d672-d9b1-4b82-a66c-44921a2f6e17',
            name: 'Pacific/Honolulu',
            text: '(GMT-10:00) Hawaii Time'
          } ,
          {
            id: '71c0a1c9-be0f-40ef-b4f8-9d234e1902c6',
            name: 'Pacific/Rarotonga',
            text: '(GMT-10:00) Rarotonga'
          } ,
          {
            id: '6ac8daf1-dd6c-4af7-9a19-4b4762abba01',
            name: 'Pacific/Tahiti',
            text: '(GMT-10:00) Tahiti'
          } ,
          {
            id: 'acc57eea-54bb-4639-90ed-7aceca945dc6',
            name: 'Pacific/Marquesas',
            text: '(GMT-09:30) Marquesas'
          } ,
          {
            id: 'd3c0dd36-197a-471c-8c30-4623c7589459',
            name: 'America/Anchorage',
            text: '(GMT-09:00) Alaska Time'
          } ,
          {
            id: '9ae85ace-a897-4a17-bec3-7aee1e7e0ddf',
            name: 'Pacific/Gambier',
            text: '(GMT-09:00) Gambier'
          } ,
          {
            id: 'd9aacada-61fe-4666-be0b-477196286361',
            name: 'America/Los_Angeles',
            text: '(GMT-08:00) Pacific Time'
          } ,
          {
            id: '6d70b210-5c4f-49af-82a5-5d610c06d73b',
            name: 'America/Tijuana',
            text: '(GMT-08:00) Pacific Time - Tijuana'
          } ,
          {
            id: 'e43501ec-2452-46c6-8a71-abd4a2f0246c',
            name: 'America/Vancouver',
            text: '(GMT-08:00) Pacific Time - Vancouver'
          } ,
          {
            id: '3ccebcd9-22e5-4aa5-ad1c-38242d252704',
            name: 'America/Whitehorse',
            text: '(GMT-08:00) Pacific Time - Whitehorse'
          } ,
          {
            id: '7699a3ab-0449-4095-b1dc-8904aaed42b8',
            name: 'Pacific/Pitcairn',
            text: '(GMT-08:00) Pitcairn'
          } ,
          {
            id: 'd0d38e2e-ee10-46e7-b9e1-52eeec38ba2e',
            name: 'America/Dawson_Creek',
            text: '(GMT-07:00) Mountain Time - Dawson Creek'
          } ,
          {
            id: 'c2af5f9d-c352-40d3-ab76-79eef75ecdd2',
            name: 'America/Denver',
            text: '(GMT-07:00) Mountain Time'
          } ,
          {
            id: '8eb3925f-e263-4490-893c-367f819e751b',
            name: 'America/Edmonton',
            text: '(GMT-07:00) Mountain Time - Edmonton'
          } ,
          {
            id: 'a7e235f6-5e38-41a6-b222-576e81e4badb',
            name: 'America/Hermosillo',
            text: '(GMT-07:00) Mountain Time - Hermosillo'
          } ,
          {
            id: 'abbd9fb7-4839-4fd0-b8a2-57a9232fcb32',
            name: 'America/Mazatlan',
            text: '(GMT-07:00) Mountain Time - Chihuahua, Mazatlan'
          } ,
          {
            id: '14cc4d34-e275-4ccb-93ae-eda05811fe44',
            name: 'America/Phoenix',
            text: '(GMT-07:00) Mountain Time - Arizona'
          } ,
          {
            id: '4d7b3af0-dc67-4b84-889d-f5af54be1ae0',
            name: 'America/Yellowknife',
            text: '(GMT-07:00) Mountain Time - Yellowknife'
          } ,
          {
            id: 'f174b871-b2eb-4be2-8b41-bfdd3b9909e9',
            name: 'America/Belize',
            text: '(GMT-06:00) Belize'
          } ,
          {
            id: 'ad108882-401a-4a6f-bf18-7285e991bf7d',
            name: 'America/Chicago',
            text: '(GMT-06:00) Central Time'
          } ,
          {
            id: 'c54f9367-4701-48da-ae39-756d8d51d658',
            name: 'America/Costa_Rica',
            text: '(GMT-06:00) Costa Rica'
          } ,
          {
            id: 'ec48da90-5fb7-4c66-a230-1e439df7247a',
            name: 'America/El_Salvador',
            text: '(GMT-06:00) El Salvador'
          } ,
          {
            id: 'c1250f68-42d7-4fbe-80bc-6359dd4cfd8a',
            name: 'America/Guatemala',
            text: '(GMT-06:00) Guatemala'
          } ,
          {
            id: 'fdb4867e-cd93-4fae-a058-3c7214d6529b',
            name: 'America/Managua',
            text: '(GMT-06:00) Managua'
          } ,
          {
            id: '84ca5e0d-0771-4c91-b7ba-de8db8887ec7',
            name: 'America/Mexico_City',
            text: '(GMT-06:00) Central Time - Mexico City'
          } ,
          {
            id: '369b9a03-c64e-4180-b9a7-b805fd5986a3',
            name: 'America/Regina',
            text: '(GMT-06:00) Central Time - Regina'
          } ,
          {
            id: '3194bf3a-fa7f-480c-aa53-baa1558597cf',
            name: 'America/Tegucigalpa',
            text: '(GMT-06:00) Central Time - Tegucigalpa'
          } ,
          {
            id: 'c0056116-5b4f-4410-9762-f4b8413a9c95',
            name: 'America/Winnipeg',
            text: '(GMT-06:00) Central Time - Winnipeg'
          } ,
          {
            id: 'e9eee88e-0c39-4c05-a33c-129bbb87af56',
            name: 'Pacific/Galapagos',
            text: '(GMT-06:00) Galapagos'
          } ,
          {
            id: '30210a46-94c4-4b19-b311-7183d1fe130b',
            name: 'America/Bogota',
            text: '(GMT-05:00) Bogota'
          } ,
          {
            id: '15ab33a3-03e6-4e15-8211-a3b02a94538f',
            name: 'America/Cancun',
            text: '(GMT-05:00) America Cancun'
          } ,
          {
            id: 'a90f572a-b2c7-4c98-bb51-7e8c000e739d',
            name: 'America/Cayman',
            text: '(GMT-05:00) Cayman'
          } ,
          {
            id: 'bf3ad0ee-f19c-4d68-a157-e955b46f196a',
            name: 'America/Guayaquil',
            text: '(GMT-05:00) Guayaquil'
          } ,
          {
            id: 'a54d8148-9c4a-4d77-9bc4-69eb0bfbf2ed',
            name: 'America/Havana',
            text: '(GMT-05:00) Havana'
          } ,
          {
            id: 'a7d541ed-b005-408b-8b06-358fddbe6e7c',
            name: 'America/Iqaluit',
            text: '(GMT-05:00) Eastern Time - Iqaluit'
          } ,
          {
            id: '12eba055-9b86-4d79-b00b-37f675812761',
            name: 'America/Jamaica',
            text: '(GMT-05:00) Jamaica'
          } ,
          {
            id: 'f33259af-d569-432a-a0b8-45e0aaf39043',
            name: 'America/Lima',
            text: '(GMT-05:00) Lima'
          } ,
          {
            id: '68a00b94-e6b5-4403-a339-0e9f266562b6',
            name: 'America/Nassau',
            text: '(GMT-05:00) Nassau'
          } ,
          {
            id: '2124e7b1-4779-4e0a-a5b2-a0e1eb00011b',
            name: 'America/New_York',
            text: '(GMT-05:00) Eastern Time'
          } ,
          {
            id: '8885d9dc-c027-4ce8-8bb8-a2b1425eb4ca',
            name: 'America/Panama',
            text: '(GMT-05:00) Panama'
          } ,
          {
            id: '2c5deb36-9199-460c-b907-354bd6bd03ed',
            name: 'America/Port-au-Prince',
            text: '(GMT-05:00) Port-au-Prince'
          } ,
          {
            id: 'c6074dfd-e6fc-4191-9b02-573edc9390ea',
            name: 'America/Rio_Branco',
            text: '(GMT-05:00) Rio Branco'
          } ,
          {
            id: 'd73ede56-9b89-469b-b96c-ab1a107b4a60',
            name: 'America/Toronto',
            text: '(GMT-05:00) Eastern Time - Toronto'
          } ,
          {
            id: 'f176ebec-51dc-4bc9-9cda-4fc35f2238ac',
            name: 'Pacific/Easter',
            text: '(GMT-05:00) Easter Island'
          } ,
          {
            id: '20ba70c1-19f5-4c14-9fd1-eb90867e12b7',
            name: 'America/Caracas',
            text: '(GMT-04:30) Caracas'
          } ,
          {
            id: 'd4ef241c-a46a-4272-85f0-5ae3056b6da9',
            name: 'America/Asuncion',
            text: '(GMT-03:00) Asuncion'
          } ,
          {
            id: '159154d8-51fa-477f-a52f-0d520d4655f6',
            name: 'America/Barbados',
            text: '(GMT-04:00) Barbados'
          } ,
          {
            id: '32dc43d5-d66a-49f5-932b-1990de8f1858',
            name: 'America/Boa_Vista',
            text: '(GMT-04:00) Boa Vista'
          } ,
          {
            id: '8ebbf3b6-e25c-48e0-9817-be1f7b998bad',
            name: 'America/Campo_Grande',
            text: '(GMT-03:00) Campo Grande'
          } ,
          {
            id: '9212299c-9431-4ead-a905-7e1a9ac109b8',
            name: 'America/Cuiaba',
            text: '(GMT-03:00) Cuiaba'
          } ,
          {
            id: 'd8a30e3d-0c8e-46eb-a833-5497e91fe242',
            name: 'America/Curacao',
            text: '(GMT-04:00) Curacao'
          } ,
          {
            id: 'a42b865a-b9bc-4ddb-ac34-70c555a97b25',
            name: 'America/Grand_Turk',
            text: '(GMT-04:00) Grand Turk'
          } ,
          {
            id: '2cf98ac0-d74a-4307-b995-e8f42c058f1a',
            name: 'America/Guyana',
            text: '(GMT-04:00) Guyana'
          } ,
          {
            id: 'fdd60ade-a4f4-4fa2-95e5-7e52df105648',
            name: 'America/Halifax',
            text: '(GMT-04:00) Atlantic Time - Halifax'
          } ,
          {
            id: 'ca9e817c-58f1-40d3-a734-925185bcc5c2',
            name: 'America/La_Paz',
            text: '(GMT-04:00) La Paz'
          } ,
          {
            id: '324da037-0673-4a14-87ed-bcea3da793f0',
            name: 'America/Manaus',
            text: '(GMT-04:00) Manaus'
          } ,
          {
            id: 'eb3908cf-ed51-48c5-8a00-3c310b091eeb',
            name: 'America/Martinique',
            text: '(GMT-04:00) Martinique'
          } ,
          {
            id: '1d1f7524-00de-45a6-bd7f-6e24028634c2',
            name: 'America/Port_of_Spain',
            text: '(GMT-04:00) Port of Spain'
          } ,
          {
            id: '208ac657-9249-480c-8e53-ca9834cb2439',
            name: 'America/Porto_Velho',
            text: '(GMT-04:00) Porto Velho'
          } ,
          {
            id: '24d35c4d-346b-4e40-99c3-a36c0cf5a212',
            name: 'America/Puerto_Rico',
            text: '(GMT-04:00) Puerto Rico'
          } ,
          {
            id: '6e9c429f-4b91-470c-8594-491264376638',
            name: 'America/Santo_Domingo',
            text: '(GMT-04:00) Santo Domingo'
          } ,
          {
            id: '64d8a6b0-06bf-47bd-9ba8-cdc1b186beea',
            name: 'America/Thule',
            text: '(GMT-04:00) Thule'
          } ,
          {
            id: '30737c59-7bcb-4e59-8151-e2f388e86809',
            name: 'Atlantic/Bermuda',
            text: '(GMT-04:00) Bermuda'
          } ,
          {
            id: '9706993f-d009-4963-b81a-4934502ab7c2',
            name: 'America/St_Johns',
            text: '(GMT-03:30) Newfoundland Time - St. Johns'
          } ,
          {
            id: '14c18c82-93db-4848-b1b4-6e2f69a0fc91',
            name: 'America/Araguaina',
            text: '(GMT-03:00) Araguaina'
          } ,
          {
            id: '8c46c4cd-6b85-4b62-9bdd-781a11f898eb',
            name: 'America/Argentina/Buenos_Aires',
            text: '(GMT-03:00) Buenos Aires'
          } ,
          {
            id: 'c9812f51-38bd-4d1f-833a-3932cda6c6e0',
            name: 'America/Bahia',
            text: '(GMT-03:00) Salvador'
          } ,
          {
            id: '6d88d6dd-a20a-48e3-9693-956310b980c8',
            name: 'America/Belem',
            text: '(GMT-03:00) Belem'
          } ,
          {
            id: '375afe9d-724b-498c-9231-55117ed383c8',
            name: 'America/Cayenne',
            text: '(GMT-03:00) Cayenne'
          } ,
          {
            id: '5c3e6391-a7a9-4fd9-915c-ed7b5785c04e',
            name: 'America/Fortaleza',
            text: '(GMT-03:00) Fortaleza'
          } ,
          {
            id: '67becf6e-c9df-4f3f-bfe1-0635bd224f2f',
            name: 'America/Godthab',
            text: '(GMT-03:00) Godthab'
          } ,
          {
            id: '2873fd13-61c6-4fa8-bad9-6816a7fdfc7d',
            name: 'America/Maceio',
            text: '(GMT-03:00) Maceio'
          } ,
          {
            id: '5a69977e-2eaa-42b2-8cd0-0b157f9b0382',
            name: 'America/Miquelon',
            text: '(GMT-03:00) Miquelon'
          } ,
          {
            id: 'b88efd48-3528-4f98-a697-0def980fa424',
            name: 'America/Montevideo',
            text: '(GMT-03:00) Montevideo'
          } ,
          {
            id: 'fc2efc3a-d3bf-4603-a351-b309baabf622',
            name: 'America/Paramaribo',
            text: '(GMT-03:00) Paramaribo'
          } ,
          {
            id: '187ab535-e48e-4722-a9b0-1102b42f9364',
            name: 'America/Recife',
            text: '(GMT-03:00) Recife'
          } ,
          {
            id: 'fe1f9b1b-2fef-4191-a68e-7d46604dc420',
            name: 'America/Santiago',
            text: '(GMT-03:00) Santiago'
          } ,
          {
            id: '990a7fde-e32c-42e8-ae32-03f3b5d1c644',
            name: 'America/Sao_Paulo',
            text: '(GMT-02:00) Sao Paulo'
          } ,
          {
            id: '8c402ef7-d2f8-42d8-aca7-eb37ff4ab402',
            name: 'Antarctica/Palmer',
            text: '(GMT-03:00) Palmer'
          } ,
          {
            id: '11c26644-9e11-44bf-8e0c-63cdd96a1ddb',
            name: 'Antarctica/Rothera',
            text: '(GMT-03:00) Rothera'
          } ,
          {
            id: '33a30c23-cca8-495f-a100-bb4afbe79cb7',
            name: 'Atlantic/Stanley',
            text: '(GMT-03:00) Stanley'
          } ,
          {
            id: 'a94f6a72-fc86-4d97-a853-8777272fa90d',
            name: 'America/Noronha',
            text: '(GMT-02:00) Noronha'
          } ,
          {
            id: '9ebeebbf-06ed-4749-88cc-7d3e5c4da771',
            name: 'Atlantic/South_Georgia',
            text: '(GMT-02:00) South Georgia'
          } ,
          {
            id: '6707e84b-fb28-4404-857e-60909357ee6e',
            name: 'America/Scoresbysund',
            text: '(GMT-01:00) Scoresbysund'
          } ,
          {
            id: 'd2b43287-5d3b-463b-a98a-1b561b0fc7ad',
            name: 'Atlantic/Azores',
            text: '(GMT-01:00) Azores'
          } ,
          {
            id: 'b0cd7ae2-762f-4008-8f0c-29de5a22b0fc',
            name: 'Atlantic/Cape_Verde',
            text: '(GMT-01:00) Cape Verde'
          } ,
          {
            id: '90cb8009-b0fd-4a1e-974a-52e00120bc39',
            name: 'Africa/Abidjan',
            text: '(GMT+00:00) Abidjan'
          } ,
          {
            id: '52a1a06e-7172-421d-bf44-eda0d1c10fc2',
            name: 'Africa/Accra',
            text: '(GMT+00:00) Accra'
          } ,
          {
            id: '3d1990eb-37d5-4b09-bdf4-cab9acbb4c40',
            name: 'Africa/Bissau',
            text: '(GMT+00:00) Bissau'
          } ,
          {
            id: '3c4dd7a9-cc9b-4b2f-9e5a-3d557515f19b',
            name: 'Africa/Casablanca',
            text: '(GMT+00:00) Casablanca'
          } ,
          {
            id: '9ec6d48c-b71e-4670-81eb-314deeab7b6e',
            name: 'Africa/El_Aaiun',
            text: '(GMT+00:00) El Aaiun'
          } ,
          {
            id: 'e94fb021-80c0-4ab5-8b0e-57032cc62a53',
            name: 'Africa/Monrovia',
            text: '(GMT+00:00) Monrovia'
          } ,
          {
            id: '98180640-084d-4930-b594-645f16683cea',
            name: 'America/Danmarkshavn',
            text: '(GMT+00:00) Danmarkshavn'
          } ,
          {
            id: '90351396-7730-4ccf-9f39-cf1c18f7601f',
            name: 'Atlantic/Canary',
            text: '(GMT+00:00) Canary Islands'
          } ,
          {
            id: 'dcdeba09-bbc8-48b3-9e6d-e955f75367a1',
            name: 'Atlantic/Faroe',
            text: '(GMT+00:00) Faeroe'
          } ,
          {
            id: 'cd6332ce-354c-4cd5-8d11-5b9b2c33e878',
            name: 'Atlantic/Reykjavik',
            text: '(GMT+00:00) Reykjavik'
          } ,
          {
            id: 'fc878f7c-a768-416a-974f-58c2f8dfa8e1',
            name: 'Etc/GMT',
            text: '(GMT+00:00) GMT (no daylight saving)'
          } ,
          {
            id: '95e4a3c2-4d97-4275-8c52-aa055187d10c',
            name: 'Europe/Dublin',
            text: '(GMT+00:00) Dublin'
          } ,
          {
            id: '1f16296d-7fc8-4499-808e-9a9c192f953c',
            name: 'Europe/Lisbon',
            text: '(GMT+00:00) Lisbon'
          } ,
          {
            id: 'a86f8998-a8f9-4e92-844a-8f2410ce31d4',
            name: 'Europe/London',
            text: '(GMT+00:00) London'
          } ,
          {
            id: '38779c3f-5787-483e-8451-38db4bf58933',
            name: 'Africa/Algiers',
            text: '(GMT+01:00) Algiers'
          } ,
          {
            id: 'ce8b9dd4-e6cd-4b51-b146-a0fdadf2ed59',
            name: 'Africa/Ceuta',
            text: '(GMT+01:00) Ceuta'
          } ,
          {
            id: 'c987c68d-9ce6-4d62-9f71-4e57f1147fa5',
            name: 'Africa/Lagos',
            text: '(GMT+01:00) Lagos'
          } ,
          {
            id: 'a9a8671c-2a52-4d0a-88d9-b8cc14a15fab',
            name: 'Africa/Ndjamena',
            text: '(GMT+01:00) Ndjamena'
          } ,
          {
            id: '6e64f895-57a1-4b92-9e63-2367ae71e439',
            name: 'Africa/Tunis',
            text: '(GMT+01:00) Tunis'
          } ,
          {
            id: 'b1baf582-345f-4b87-8150-6e690be187b3',
            name: 'Africa/Windhoek',
            text: '(GMT+02:00) Windhoek'
          } ,
          {
            id: '46add71c-91bf-49c8-9725-a136c4fc6d92',
            name: 'Europe/Amsterdam',
            text: '(GMT+01:00) Amsterdam'
          } ,
          {
            id: '3f4c4e33-8125-4d7f-b9e6-02c938ce337e',
            name: 'Europe/Andorra',
            text: '(GMT+01:00) Andorra'
          } ,
          {
            id: '0a5a01cd-5ff2-4806-9fd9-862e4fd46c79',
            name: 'Europe/Belgrade',
            text: '(GMT+01:00) Central European Time - Belgrade'
          } ,
          {
            id: 'ff2599e4-75a0-412a-ab59-f12d9299f0c6',
            name: 'Europe/Berlin',
            text: '(GMT+01:00) Berlin'
          } ,
          {
            id: '83d84dfd-94f5-43f8-b55c-bf37588ab025',
            name: 'Europe/Brussels',
            text: '(GMT+01:00) Brussels'
          } ,
          {
            id: '29d54e14-fddd-468a-84c9-0d631565f131',
            name: 'Europe/Budapest',
            text: '(GMT+01:00) Budapest'
          } ,
          {
            id: '4bf1a1e0-4c31-4a8a-8fd7-387d5b0c9eb2',
            name: 'Europe/Copenhagen',
            text: '(GMT+01:00) Copenhagen'
          } ,
          {
            id: '61701666-22ce-4760-9b49-1338590d95d0',
            name: 'Europe/Gibraltar',
            text: '(GMT+01:00) Gibraltar'
          } ,
          {
            id: 'c2ae5abd-be9e-4f75-801f-792a741c49a1',
            name: 'Europe/Luxembourg',
            text: '(GMT+01:00) Luxembourg'
          } ,
          {
            id: '1eba7017-9d71-4528-9a6e-f805dd6cc0a5',
            name: 'Europe/Madrid',
            text: '(GMT+01:00) Madrid'
          } ,
          {
            id: 'b4fa0aba-a1d6-4e35-9e87-2ae31fbcfa1a',
            name: 'Europe/Malta',
            text: '(GMT+01:00) Malta'
          } ,
          {
            id: 'b4534fa1-9035-4ec1-8074-f3b398d950c3',
            name: 'Europe/Monaco',
            text: '(GMT+01:00) Monaco'
          } ,
          {
            id: 'bb7c3d95-555e-4095-a832-5620083c68d9',
            name: 'Europe/Oslo',
            text: '(GMT+01:00) Oslo'
          } ,
          {
            id: '6579acfe-3be6-41eb-8a88-4b5677a34326',
            name: 'Europe/Paris',
            text: '(GMT+01:00) Paris'
          } ,
          {
            id: '84a75596-b804-47a0-b76d-ab09e7abfc68',
            name: 'Europe/Prague',
            text: '(GMT+01:00) Central European Time - Prague'
          } ,
          {
            id: 'e99f4008-80f1-449d-9b4c-d83e76b10ce6',
            name: 'Europe/Rome',
            text: '(GMT+01:00) Rome'
          } ,
          {
            id: '6e90e78c-26f1-4dde-81a2-5a2983986112',
            name: 'Europe/Stockholm',
            text: '(GMT+01:00) Stockholm'
          } ,
          {
            id: '139d67a2-d518-4bca-9548-01202cfbce31',
            name: 'Europe/Tirane',
            text: '(GMT+01:00) Tirane'
          } ,
          {
            id: 'a3ae343f-a614-4538-826e-ce3c39686b72',
            name: 'Europe/Vienna',
            text: '(GMT+01:00) Vienna'
          } ,
          {
            id: '0fd3346d-9b4e-493d-8aa1-2fbe95e6953e',
            name: 'Europe/Warsaw',
            text: '(GMT+01:00) Warsaw'
          } ,
          {
            id: '3fa5e874-5b3f-4f10-a2bb-bc5ca6b20f50',
            name: 'Europe/Zurich',
            text: '(GMT+01:00) Zurich'
          } ,
          {
            id: '439f7b19-8ddc-401f-a133-679288ff55b1',
            name: 'Africa/Cairo',
            text: '(GMT+02:00) Cairo'
          } ,
          {
            id: '9117b646-1b17-4817-903a-a75f4cc55a99',
            name: 'Africa/Johannesburg',
            text: '(GMT+02:00) Johannesburg'
          } ,
          {
            id: '6890f710-122c-4a4f-b41c-65405e86c4a2',
            name: 'Africa/Maputo',
            text: '(GMT+02:00) Maputo'
          } ,
          {
            id: 'af0898a9-d63c-4768-a505-495d8883475e',
            name: 'Africa/Tripoli',
            text: '(GMT+02:00) Tripoli'
          } ,
          {
            id: '62f03068-46e1-4ef9-8e6c-4f49d9e1318f',
            name: 'Asia/Amman',
            text: '(GMT+02:00) Amman'
          } ,
          {
            id: '036141a1-f816-412c-a680-b579f60de9ed',
            name: 'Asia/Beirut',
            text: '(GMT+02:00) Beirut'
          } ,
          {
            id: '3edf4a8c-8393-44f7-986b-566707933158',
            name: 'Asia/Damascus',
            text: '(GMT+02:00) Damascus'
          } ,
          {
            id: 'f36437e5-ba57-4c21-b2a1-13057ff24321',
            name: 'Asia/Gaza',
            text: '(GMT+02:00) Gaza'
          } ,
          {
            id: '37da3a30-266e-4e65-9acc-bfc99d2d2cbe',
            name: 'Asia/Jerusalem',
            text: '(GMT+02:00) Jerusalem'
          } ,
          {
            id: '5ce25efe-07da-4668-aef5-926a4faeffe8',
            name: 'Asia/Nicosia',
            text: '(GMT+02:00) Nicosia'
          } ,
          {
            id: 'f6bb3441-0095-4362-b0ea-3330dd7f248d',
            name: 'Europe/Athens',
            text: '(GMT+02:00) Athens'
          } ,
          {
            id: 'e8cc760e-ab57-4075-93c8-83e0c8cac111',
            name: 'Europe/Bucharest',
            text: '(GMT+02:00) Bucharest'
          } ,
          {
            id: '600ac775-29bb-44d7-8c46-e3d71c9105e0',
            name: 'Europe/Chisinau',
            text: '(GMT+02:00) Chisinau'
          } ,
          {
            id: '561496f8-4956-4722-8cf3-a0ce24314ac3',
            name: 'Europe/Helsinki',
            text: '(GMT+02:00) Helsinki'
          } ,
          {
            id: '9a353d64-1cc1-41cc-83de-0839170bdf7f',
            name: 'Europe/Istanbul',
            text: '(GMT+02:00) Istanbul'
          } ,
          {
            id: '843b58b6-70ec-4f7a-a12b-46f09465cbf2',
            name: 'Europe/Kaliningrad',
            text: '(GMT+02:00) Moscow-01 - Kaliningrad'
          } ,
          {
            id: '119b98e1-d6c0-42bc-a0c7-37047c407b7f',
            name: 'Europe/Kiev',
            text: '(GMT+02:00) Kiev'
          } ,
          {
            id: 'e6eccdd5-9501-4a39-8e28-3d45443c9d0f',
            name: 'Europe/Riga',
            text: '(GMT+02:00) Riga'
          } ,
          {
            id: '392e2bec-20bb-4dad-a983-312e1d1ddaea',
            name: 'Europe/Sofia',
            text: '(GMT+02:00) Sofia'
          } ,
          {
            id: 'fe225ce0-920a-4d13-9bb8-16c32a971107',
            name: 'Europe/Tallinn',
            text: '(GMT+02:00) Tallinn'
          } ,
          {
            id: '2f04f959-71a7-4f58-8ea8-1e8a45ec1591',
            name: 'Europe/Vilnius',
            text: '(GMT+02:00) Vilnius'
          } ,
          {
            id: 'c94d06f0-198e-4a69-bd99-9727a11147d6',
            name: 'Africa/Khartoum',
            text: '(GMT+03:00) Khartoum'
          } ,
          {
            id: 'f7cc105d-5dd9-4fd1-a120-04700ab71131',
            name: 'Africa/Nairobi',
            text: '(GMT+03:00) Nairobi'
          } ,
          {
            id: 'b7c9d97a-1073-4ef2-aa05-49732861b885',
            name: 'Antarctica/Syowa',
            text: '(GMT+03:00) Syowa'
          } ,
          {
            id: 'a90e7cc1-3c03-457a-bd48-68a604fb4281',
            name: 'Asia/Baghdad',
            text: '(GMT+03:00) Baghdad'
          } ,
          {
            id: '99de56b9-49a0-4667-af37-6de42d4332f2',
            name: 'Asia/Qatar',
            text: '(GMT+03:00) Qatar'
          } ,
          {
            id: '5e744cf6-cb29-4862-9217-96de5b3741e6',
            name: 'Asia/Riyadh',
            text: '(GMT+03:00) Riyadh'
          } ,
          {
            id: '455275c6-9855-45a2-9e66-2cc10baff634',
            name: 'Europe/Minsk',
            text: '(GMT+03:00) Minsk'
          } ,
          {
            id: '245eb652-ebc3-49c6-8481-fca5ea5f6b8e',
            name: 'Europe/Moscow',
            text: '(GMT+03:00) Moscow+00 - Moscow'
          } ,
          {
            id: '3e798252-6730-4df3-95b9-509162fb04de',
            name: 'Asia/Tehran',
            text: '(GMT+03:30) Tehran'
          } ,
          {
            id: '19c6a44d-969e-4b9f-b8a2-87a14feb26a4',
            name: 'Asia/Baku',
            text: '(GMT+04:00) Baku'
          } ,
          {
            id: 'e7b645e4-8867-49b2-8e2b-2f4b4dad073d',
            name: 'Asia/Dubai',
            text: '(GMT+04:00) Dubai'
          } ,
          {
            id: 'f04e2b20-9d6b-4007-b83b-481d876f8ab1',
            name: 'Asia/Tbilisi',
            text: '(GMT+04:00) Tbilisi'
          } ,
          {
            id: 'fab34abc-8ae3-4212-96d3-fe4928471d6a',
            name: 'Asia/Yerevan',
            text: '(GMT+04:00) Yerevan'
          } ,
          {
            id: '69f302f9-0176-46ee-9c0a-939226133f50',
            name: 'Europe/Samara',
            text: '(GMT+04:00) Moscow+01 - Samara'
          } ,
          {
            id: 'e8957a77-6526-4686-bbd7-a02d96f13e0c',
            name: 'Indian/Mahe',
            text: '(GMT+04:00) Mahe'
          } ,
          {
            id: 'd8105650-f0a1-46ce-b4d1-7e2e421df887',
            name: 'Indian/Mauritius',
            text: '(GMT+04:00) Mauritius'
          } ,
          {
            id: '93a9d99a-253e-4a16-bf99-b948e19fa81a',
            name: 'Indian/Reunion',
            text: '(GMT+04:00) Reunion'
          } ,
          {
            id: '218cd6c5-919b-4406-bdb2-aeff16ece167',
            name: 'Asia/Kabul',
            text: '(GMT+04:30) Kabul'
          } ,
          {
            id: 'ac1eef05-9136-43a9-ad38-c1459499fda0',
            name: 'Antarctica/Mawson',
            text: '(GMT+05:00) Mawson'
          } ,
          {
            id: '40aa2196-d883-4843-9ec5-4be91e19f9a6',
            name: 'Asia/Aqtau',
            text: '(GMT+05:00) Aqtau'
          } ,
          {
            id: 'f923089e-56bc-4890-95a0-fba6496f7161',
            name: 'Asia/Aqtobe',
            text: '(GMT+05:00) Aqtobe'
          } ,
          {
            id: '02def96d-73f3-4aa3-8a24-91e1ba5c9030',
            name: 'Asia/Ashgabat',
            text: '(GMT+05:00) Ashgabat'
          } ,
          {
            id: '6a212acb-7664-4878-a467-8a6230e3da19',
            name: 'Asia/Dushanbe',
            text: '(GMT+05:00) Dushanbe'
          } ,
          {
            id: '4b211d16-6234-4339-bb52-cc32b6be91e5',
            name: 'Asia/Karachi',
            text: '(GMT+05:00) Karachi'
          } ,
          {
            id: 'deb33fd5-ea9a-4c7c-b7d0-82fead92112f',
            name: 'Asia/Tashkent',
            text: '(GMT+05:00) Tashkent'
          } ,
          {
            id: '2ca8dbdd-58a0-41c0-a9a9-c287ec9f9aa6',
            name: 'Asia/Yekaterinburg',
            text: '(GMT+05:00) Moscow+02 - Yekaterinburg'
          } ,
          {
            id: '3a575e34-f8cd-4f7f-8bbe-d111a4e75b58',
            name: 'Indian/Kerguelen',
            text: '(GMT+05:00) Kerguelen'
          } ,
          {
            id: 'a13c919f-7115-405e-ba07-73a61238a460',
            name: 'Indian/Maldives',
            text: '(GMT+05:00) Maldives'
          } ,
          {
            id: '10190f5a-d28f-4f46-89a1-fd6c2d427c07',
            name: 'Asia/Calcutta',
            text: '(GMT+05:30) India Standard Time'
          } ,
          {
            id: '36c87bc8-cfea-401d-bb0a-4d01bd19a186',
            name: 'Asia/Colombo',
            text: '(GMT+05:30) Colombo'
          } ,
          {
            id: '89144287-00b5-481f-99bb-deec3ea343d3',
            name: 'Asia/Katmandu',
            text: '(GMT+05:45) Katmandu'
          } ,
          {
            id: 'd9156331-1324-4c71-ad68-0492f977f949',
            name: 'Antarctica/Vostok',
            text: '(GMT+06:00) Vostok'
          } ,
          {
            id: 'c9b39366-5a83-4c68-a7ff-ec37229c3dcb',
            name: 'Asia/Almaty',
            text: '(GMT+06:00) Almaty'
          } ,
          {
            id: '56abbe6d-f879-46a4-b371-2f1145e50579',
            name: 'Asia/Bishkek',
            text: '(GMT+06:00) Bishkek'
          } ,
          {
            id: 'a6430295-c495-4356-a409-4009e621b3bd',
            name: 'Asia/Dhaka',
            text: '(GMT+06:00) Dhaka'
          } ,
          {
            id: 'b73c79cd-50e3-42f1-a914-94a4ef4c8b02',
            name: 'Asia/Omsk',
            text: '(GMT+06:00) Moscow+03 - Omsk, Novosibirsk'
          } ,
          {
            id: 'fe586b05-3fdf-4cd3-95e2-5d1ba4aa3c03',
            name: 'Asia/Thimphu',
            text: '(GMT+06:00) Thimphu'
          } ,
          {
            id: 'd2095b87-e479-4918-b1c7-f14320a8e4f3',
            name: 'Indian/Chagos',
            text: '(GMT+06:00) Chagos'
          } ,
          {
            id: '908ea1fd-edeb-4e90-9533-0fd61a4ed611',
            name: 'Asia/Rangoon',
            text: '(GMT+06:30) Rangoon'
          } ,
          {
            id: '2b3870b6-1367-4249-95ed-9d5719c51e81',
            name: 'Indian/Cocos',
            text: '(GMT+06:30) Cocos'
          } ,
          {
            id: 'e7fc19ca-24ab-4711-9fd3-c8b135005a54',
            name: 'Antarctica/Davis',
            text: '(GMT+07:00) Davis'
          } ,
          {
            id: 'd57590b2-8d5f-4c28-aea7-28a91fd50bbf',
            name: 'Asia/Bangkok',
            text: '(GMT+07:00) Bangkok'
          } ,
          {
            id: 'e20bee17-10b0-4182-a97e-f31ea5a6b9d3',
            name: 'Asia/Hovd',
            text: '(GMT+07:00) Hovd'
          } ,
          {
            id: '5e23cc3a-862f-4f5c-8898-e0c5bb8d841a',
            name: 'Asia/Jakarta',
            text: '(GMT+07:00) Jakarta'
          } ,
          {
            id: 'e3fe2d64-b968-4682-a554-ba294daa2a07',
            name: 'Asia/Krasnoyarsk',
            text: '(GMT+07:00) Moscow+04 - Krasnoyarsk'
          } ,
          {
            id: '6c48df50-cb58-48bf-9013-513438aa407e',
            name: 'Asia/Saigon',
            text: '(GMT+07:00) Hanoi'
          } ,
          {
            id: 'c64bcb21-7c25-49f8-8486-6532eac345eb',
            name: 'Asia/Ho_Chi_Minh',
            text: '(GMT+07:00) Ho Chi Minh'
          } ,
          {
            id: '7f75abdf-454b-4f00-9979-fee6f86f797e',
            name: 'Indian/Christmas',
            text: '(GMT+07:00) Christmas'
          } ,
          {
            id: 'bc23ad6a-447f-4363-a020-8e6f9c643f47',
            name: 'Antarctica/Casey',
            text: '(GMT+08:00) Casey'
          } ,
          {
            id: 'd92da0ff-069e-4f68-a4f9-2fec84dcf714',
            name: 'Asia/Brunei',
            text: '(GMT+08:00) Brunei'
          } ,
          {
            id: 'ca070692-3628-4c6a-9f52-dd381ea0dad8',
            name: 'Asia/Choibalsan',
            text: '(GMT+08:00) Choibalsan'
          } ,
          {
            id: 'c690bb52-a07e-4aab-9674-e941698c8cea',
            name: 'Asia/Hong_Kong',
            text: '(GMT+08:00) Hong Kong'
          } ,
          {
            id: '9bd4862d-cc91-4955-be88-e20911416f3d',
            name: 'Asia/Irkutsk',
            text: '(GMT+08:00) Moscow+05 - Irkutsk'
          } ,
          {
            id: '24e7dec5-cbfe-4e3e-9d9a-bed7fb3902da',
            name: 'Asia/Kuala_Lumpur',
            text: '(GMT+08:00) Kuala Lumpur'
          } ,
          {
            id: '1c91e212-39b6-48ef-8dc8-aa822716fb26',
            name: 'Asia/Macau',
            text: '(GMT+08:00) Macau'
          } ,
          {
            id: '578ee144-4732-4363-b9bd-f25f554fbd03',
            name: 'Asia/Makassar',
            text: '(GMT+08:00) Makassar'
          } ,
          {
            id: '46d77e47-dd47-48b0-96f5-03ca67bbfea3',
            name: 'Asia/Manila',
            text: '(GMT+08:00) Manila'
          } ,
          {
            id: 'a197a45e-23b5-43ea-a374-e7e4b927d291',
            name: 'Asia/Shanghai',
            text: '(GMT+08:00) China Time - Beijing'
          } ,
          {
            id: '2b97fd43-1055-4cfd-bea1-a6e943e6845e',
            name: 'Asia/Singapore',
            text: '(GMT+08:00) Singapore'
          } ,
          {
            id: 'fea77f80-57ab-4072-afb5-b8495cce95bf',
            name: 'Asia/Taipei',
            text: '(GMT+08:00) Taipei'
          } ,
          {
            id: '6c72709b-844a-4645-8689-05421694b95f',
            name: 'Asia/Ulaanbaatar',
            text: '(GMT+08:00) Ulaanbaatar'
          } ,
          {
            id: 'f6a1a0f3-2ab0-4c71-aff3-1215be13c65a',
            name: 'Australia/Perth',
            text: '(GMT+08:00) Western Time - Perth'
          } ,
          {
            id: 'e5081302-5ea6-4ec6-8530-b543d00aa6cf',
            name: 'Asia/Pyongyang',
            text: '(GMT+08:30) Pyongyang'
          } ,
          {
            id: '5ea4caa8-8511-4dc2-8bca-89f84956b427',
            name: 'Asia/Dili',
            text: '(GMT+09:00) Dili'
          } ,
          {
            id: '956647f2-2535-4269-8567-5ab7019eb732',
            name: 'Asia/Jayapura',
            text: '(GMT+09:00) Jayapura'
          } ,
          {
            id: '27863cdf-1b20-49f5-99f2-dd500c713e85',
            name: 'Asia/Seoul',
            text: '(GMT+09:00) Seoul'
          } ,
          {
            id: '4be67d6e-ba2f-4e2c-b963-6cd0c266fb8f',
            name: 'Asia/Tokyo',
            text: '(GMT+09:00) Tokyo'
          } ,
          {
            id: '326e1fce-2c6e-45a0-ba5f-77d5007c46eb',
            name: 'Asia/Yakutsk',
            text: '(GMT+09:00) Moscow+06 - Yakutsk'
          } ,
          {
            id: '8eb68642-8d63-447c-a984-caa0f69b119e',
            name: 'Pacific/Palau',
            text: '(GMT+09:00) Palau'
          } ,
          {
            id: 'b85fe5ce-a4b0-4153-b202-d496c3997176',
            name: 'Australia/Adelaide',
            text: '(GMT+10:30) Central Time - Adelaide'
          } ,
          {
            id: 'a73f6179-3b09-4329-baf9-541b46151f2d',
            name: 'Australia/Darwin',
            text: '(GMT+09:30) Central Time - Darwin'
          } ,
          {
            id: '03710333-3f6a-463f-b979-171e3a26e32d',
            name: 'Antarctica/DumontDUrville',
            text: "(GMT+10:00) Dumont D'Urville"
          } ,
          {
            id: '4286ae58-9986-44bf-b2f8-febff19fc5ea',
            name: 'Asia/Magadan',
            text: '(GMT+10:00) Moscow+07 - Magadan'
          } ,
          {
            id: '3ff2123c-817d-4b23-9f1b-a7fdfc974a2b',
            name: 'Asia/Vladivostok',
            text: '(GMT+10:00) Moscow+07 - Yuzhno-Sakhalinsk'
          } ,
          {
            id: '352048a0-7194-48a0-83b8-a283b8aeca25',
            name: 'Australia/Brisbane',
            text: '(GMT+10:00) Eastern Time - Brisbane'
          } ,
          {
            id: 'c55404f6-2111-4442-b540-9e6b927789dd',
            name: 'Australia/Hobart',
            text: '(GMT+11:00) Eastern Time - Hobart'
          } ,
          {
            id: 'ae9a7647-a1b6-4094-bfea-d5a6a3c1675c',
            name: 'Australia/Sydney',
            text: '(GMT+11:00) Eastern Time - Melbourne, Sydney'
          } ,
          {
            id: 'df9f8e9e-d187-451c-bbf1-9890256b20c5',
            name: 'Pacific/Chuuk',
            text: '(GMT+10:00) Truk'
          } ,
          {
            id: '7a6192b7-48b8-450d-a7f9-96b6cccf3bd2',
            name: 'Pacific/Guam',
            text: '(GMT+10:00) Guam'
          } ,
          {
            id: '7cb2c2b2-90fe-4ec9-b1c2-ef5d52cde1d1',
            name: 'Pacific/Port_Moresby',
            text: '(GMT+10:00) Port Moresby'
          } ,
          {
            id: '8cd2880a-7d1d-4b1d-9a0f-b28da15d26de',
            name: 'Pacific/Efate',
            text: '(GMT+11:00) Efate'
          } ,
          {
            id: '965c227e-d010-43dd-a6de-2d5eded89a7d',
            name: 'Pacific/Guadalcanal',
            text: '(GMT+11:00) Guadalcanal'
          } ,
          {
            id: '04c7e632-52a4-4870-9e12-3ee49f4b108b',
            name: 'Pacific/Kosrae',
            text: '(GMT+11:00) Kosrae'
          } ,
          {
            id: 'e6febd6a-9d76-47b7-9a47-a869dadbc766',
            name: 'Pacific/Norfolk',
            text: '(GMT+11:00) Norfolk'
          } ,
          {
            id: '54cf6bb3-0209-4013-b5dd-207009414726',
            name: 'Pacific/Noumea',
            text: '(GMT+11:00) Noumea'
          } ,
          {
            id: '2c7e8262-5c58-4fe2-9ef4-a7d838707ce8',
            name: 'Pacific/Pohnpei',
            text: '(GMT+11:00) Ponape'
          } ,
          {
            id: '6a464091-324c-486d-b359-1dd29b872a9c',
            name: 'Asia/Kamchatka',
            text: '(GMT+12:00) Moscow+09 - Petropavlovsk-Kamchatskiy'
          } ,
          {
            id: '67262540-c269-40e0-a024-3ecabfd447b1',
            name: 'Pacific/Auckland',
            text: '(GMT+13:00) Auckland'
          } ,
          {
            id: 'f4c359e3-8305-446a-8981-21463a29a0a9',
            name: 'Pacific/Fiji',
            text: '(GMT+13:00) Fiji'
          } ,
          {
            id: '506d10a0-7493-46e8-acac-14ad794d774d',
            name: 'Pacific/Funafuti',
            text: '(GMT+12:00) Funafuti'
          } ,
          {
            id: 'a8bcee9c-28d2-45ff-8faf-6037d907841d',
            name: 'Pacific/Kwajalein',
            text: '(GMT+12:00) Kwajalein'
          } ,
          {
            id: 'ea825f30-468e-4977-98b8-32b085585e8a',
            name: 'Pacific/Majuro',
            text: '(GMT+12:00) Majuro'
          } ,
          {
            id: '6c5c077a-c40f-46aa-bc4b-604b008aadb2',
            name: 'Pacific/Nauru',
            text: '(GMT+12:00) Nauru'
          } ,
          {
            id: '195777ef-c500-4f78-802f-ddc48e1dbb0b',
            name: 'Pacific/Tarawa',
            text: '(GMT+12:00) Tarawa'
          } ,
          {
            id: 'b74e37e4-d0b3-4eae-a655-5901c3e590c6',
            name: 'Pacific/Wake',
            text: '(GMT+12:00) Wake'
          } ,
          {
            id: '8546eb28-47ab-410b-9d63-90c182f6e75c',
            name: 'Pacific/Wallis',
            text: '(GMT+12:00) Wallis'
          } ,
          {
            id: 'ee402ae8-e143-4de4-a23b-6a4c1a5f2752',
            name: 'Pacific/Apia',
            text: '(GMT+14:00) Apia'
          } ,
          {
            id: '98a82c88-7443-4172-8123-1ca008cd2144',
            name: 'Pacific/Enderbury',
            text: '(GMT+13:00) Enderbury'
          } ,
          {
            id: '8a0dd8d6-12f8-4e49-94a7-96dc687c61ac',
            name: 'Pacific/Fakaofo',
            text: '(GMT+13:00) Fakaofo'
          } ,
          {
            id: 'c5b72238-200c-4e94-a7e2-12d08a651261',
            name: 'Pacific/Tongatapu',
            text: '(GMT+13:00) Tongatapu'
          } ,
          {
            id: '649e80c1-e81e-4bbd-b778-8b2f0f6106f3',
            name: 'Pacific/Kiritimati',
            text: '(GMT+14:00) Kiritimati'
          } ,
    ]

    return timezones
}

module.exports = createSettingTimezone;