const { v4 } = require("uuid");
async function createSettingLanguage() {
    let languages = [
        {
            id: '2ba854c6-ad01-4507-80d4-38ae35ad6d3a',
            name: 'Abkhaz',
            short_name: 'ab',
            native_name: 'аҧсуа'
          } ,
          {
            id: '60b7883c-966e-409b-b313-dc6f2dbc5e7c',
            name: 'Afar',
            short_name: 'aa',
            native_name: 'Afaraf'
          } ,
          {
            id: '9675893e-6c25-4623-8a33-7bd89104f973',
            name: 'Afrikaans',
            short_name: 'af',
            native_name: 'Afrikaans'
          } ,
          {
            id: 'ba85044c-84b0-403c-bde5-2fd7e5f3347a',
            name: 'Akan',
            short_name: 'ak',
            native_name: 'Akan'
          } ,
          {
            id: '32f912bc-823a-43ad-8a3a-d3268a0f97ec',
            name: 'Albanian',
            short_name: 'sq',
            native_name: 'Shqip'
          } ,
          {
            id: '47ec09d1-4b1f-4aa2-9d39-4764f9e6068f',
            name: 'Arabic',
            short_name: 'ar',
            native_name: 'العربية'
          } ,
          {
            id: 'de58869a-68e8-4c39-a318-b33cead9230d',
            name: 'Aragonese',
            short_name: 'an',
            native_name: 'Aragonés'
          } ,
          {
            id: '990e52fc-66cb-4695-b6c4-463e69d4fa93',
            name: 'Armenian',
            short_name: 'hy',
            native_name: 'Հայերեն'
          } ,
          {
            id: '6a590d95-bfa3-463f-a808-b8f65fccd7d1',
            name: 'Amharic',
            short_name: 'am',
            native_name: 'አማርኛ'
          } ,
          {
            id: '79f7860d-80be-4971-9d44-d0dc7aab9582',
            name: 'Assamese',
            short_name: 'as',
            native_name: 'অসমীয়া'
          } ,
          {
            id: '70814bef-3c55-4e2d-92d5-d573450ed0e9',
            name: 'Avaric',
            short_name: 'av',
            native_name: 'авар мацӀ, магӀарул мацӀ'
          } ,
          {
            id: '51942206-e532-4513-b645-a1fbeb769295',
            name: 'Avestan',
            short_name: 'ae',
            native_name: 'avesta'
          } ,
          {
            id: '618bfce9-c8c4-46e9-94b7-16532e37263f',
            name: 'Aymara',
            short_name: 'ay',
            native_name: 'aymar aru'
          } ,
          {
            id: '1716461d-42e2-40b4-992e-3af613c0715c',
            name: 'Azerbaijani',
            short_name: 'az',
            native_name: 'azərbaycan dili'
          } ,
          {
            id: '8b6032b0-9d19-484c-ad64-3e25706d8029',
            name: 'Bambara',
            short_name: 'bm',
            native_name: 'bamanankan'
          } ,
          {
            id: '74856026-90b7-4bf0-ad8f-d11573d58e95',
            name: 'Bashkir',
            short_name: 'ba',
            native_name: 'башҡорт теле'
          } ,
          {
            id: 'e1cdee2a-6295-4a5e-a7df-0f55e0575fcd',
            name: 'Basque',
            short_name: 'eu',
            native_name: 'euskara, euskera'
          } ,
          {
            id: '21396cb2-80d9-4535-8852-08384128c510',
            name: 'Belarusian',
            short_name: 'be',
            native_name: 'Беларуская'
          } ,
          {
            id: '1e9d1a4d-224f-41bf-953e-88b92a8accb1',
            name: 'Bengali',
            short_name: 'bn',
            native_name: 'বাংলা'
          } ,
          {
            id: '6534bac9-ff4c-4fee-b94f-9529552b317f',
            name: 'Bihari',
            short_name: 'bh',
            native_name: 'भोजपुरी'
          } ,
          {
            id: '13b16683-d2a0-4d75-9594-a3bbb52fb7be',
            name: 'Bislama',
            short_name: 'bi',
            native_name: 'Bislama'
          } ,
          {
            id: '8622f72e-8144-43d6-a5df-53a882d1c650',
            name: 'Bosnian',
            short_name: 'bs',
            native_name: 'bosanski jezik'
          } ,
          {
            id: 'd6e5ef87-030f-4009-b5fe-7392a10f2166',
            name: 'Breton',
            short_name: 'br',
            native_name: 'brezhoneg'
          } ,
          {
            id: 'b0f614ca-1176-4d93-bdd6-f82e40971431',
            name: 'Bulgarian',
            short_name: 'bg',
            native_name: 'български език'
          } ,
          {
            id: 'c56efffc-181e-4e9f-9494-601ad7e179f2',
            name: 'Burmese',
            short_name: 'my',
            native_name: 'ဗမာစာ'
          } ,
          {
            id: 'a9be4d24-79cd-4c3a-84e8-117fd2cca4f3',
            name: 'Catalan; Valencian',
            short_name: 'ca',
            native_name: 'Català'
          } ,
          {
            id: '94bff7c3-85cb-4d81-b551-ef06dcc86bf1',
            name: 'Chamorro',
            short_name: 'ch',
            native_name: 'Chamoru'
          } ,
          {
            id: '53bbfe97-095e-42f3-9dea-0458078ef851',
            name: 'Chechen',
            short_name: 'ce',
            native_name: 'нохчийн мотт'
          } ,
          {
            id: '93a25b97-96b1-433d-b0b5-58c74f6b5895',
            name: 'Chichewa; Chewa; Nyanja',
            short_name: 'ny',
            native_name: 'chiCheŵa, chinyanja'
          } ,
          {
            id: '9f9d96ee-22f7-4c80-8c20-759a41dfb6d9',
            name: 'Chinese',
            short_name: 'zh',
            native_name: '中文 (Zhōngwén), 汉语, 漢語'
          } ,
          {
            id: '5cc55d15-b2c9-4cbc-a99a-2be6ccd08cb1',
            name: 'Chuvash',
            short_name: 'cv',
            native_name: 'чӑваш чӗлхи'
          } ,
          {
            id: 'afddbb9d-7a1f-48f3-9447-2ea4bf186d8a',
            name: 'Cornish',
            short_name: 'kw',
            native_name: 'Kernewek'
          } ,
          {
            id: '0ef56f91-3c94-4ef2-944a-ba16c6b10057',
            name: 'Cree',
            short_name: 'cr',
            native_name: 'ᓀᐦᐃᔭᐍᐏᐣ'
          } ,
          {
            id: '1bc1e6b4-085b-4c05-bdd2-f3a80fc6e686',
            name: 'Croatian',
            short_name: 'hr',
            native_name: 'hrvatski'
          } ,
          {
            id: '17821001-798b-4283-bba6-e405d607a635',
            name: 'Czech',
            short_name: 'cs',
            native_name: 'česky, čeština'
          } ,
          {
            id: '433baa0d-2188-4552-a14b-848d0ad4d269',
            name: 'Danish',
            short_name: 'da',
            native_name: 'dansk'
          } ,
          {
            id: '07a18d17-0c16-4f02-acfa-f0063f42ae05',
            name: 'Divehi; Dhivehi; Maldivian;',
            short_name: 'dv',
            native_name: 'ދިވެހި'
          } ,
          {
            id: '34124044-b7e7-454b-9a4f-13693bbd8dc4',
            name: 'Dutch',
            short_name: 'nl',
            native_name: 'Nederlands, Vlaams'
          } ,
          {
            id: '88bab3bc-43fe-4d74-a47a-fbc5b892d418',
            name: 'English',
            short_name: 'en',
            native_name: 'English'
          } ,
          {
            id: '092ea660-863b-4dd8-b104-8094d7f21ea4',
            name: 'Esperanto',
            short_name: 'eo',
            native_name: 'Esperanto'
          } ,
          {
            id: '8826d7bc-fa8c-41ac-9218-28b3d5de0b98',
            name: 'Estonian',
            short_name: 'et',
            native_name: 'eesti, eesti keel'
          } ,
          {
            id: '92ce8af8-5c2c-4374-a382-f6a7d7dff796',
            name: 'Ewe',
            short_name: 'ee',
            native_name: 'Eʋegbe'
          } ,
          {
            id: 'e0dd006b-a4ff-45bc-a7b1-215af8c63e31',
            name: 'Faroese',
            short_name: 'fo',
            native_name: 'føroyskt'
          } ,
          {
            id: 'a598d587-e204-4f5f-9d75-d907d3d16098',
            name: 'Fijian',
            short_name: 'fj',
            native_name: 'vosa Vakaviti'
          } ,
          {
            id: 'ac6efd5e-3683-45af-98cd-058e48d6cdf2',
            name: 'Finnish',
            short_name: 'fi',
            native_name: 'suomi, suomen kieli'
          } ,
          {
            id: '7d0a2de5-3708-4aee-bfb7-8ecadb62767c',
            name: 'French',
            short_name: 'fr',
            native_name: 'français, langue française'
          } ,
          {
            id: '54b706ec-3f74-4c32-bacf-c6627ca1b6e7',
            name: 'Fula; Fulah; Pulaar; Pular',
            short_name: 'ff',
            native_name: 'Fulfulde, Pulaar, Pular'
          } ,
          {
            id: '297b59de-1fa3-4d99-a6b1-8a33c4b243bc',
            name: 'Galician',
            short_name: 'gl',
            native_name: 'Galego'
          } ,
          {
            id: '8c1a0be0-ff7b-4564-925c-c71030c54a76',
            name: 'Georgian',
            short_name: 'ka',
            native_name: 'ქართული'
          } ,
          {
            id: '9d2dcf50-1e1f-414a-a863-aea4335a6ee2',
            name: 'German',
            short_name: 'de',
            native_name: 'Deutsch'
          } ,
          {
            id: '44e5de06-84ac-44dd-8b99-adfe049dc915',
            name: 'Greek, Modern',
            short_name: 'el',
            native_name: 'Ελληνικά'
          } ,
          {
            id: '767fa22b-560c-44c6-a711-3f95b2b4db15',
            name: 'Guaraní',
            short_name: 'gn',
            native_name: 'Avañeẽ'
          } ,
          {
            id: '559a74ff-2bd2-4bba-92d2-b746611d7345',
            name: 'Gujarati',
            short_name: 'gu',
            native_name: 'ગુજરાતી'
          } ,
          {
            id: '518231bd-c833-4b40-939c-933f280e16df',
            name: 'Haitian; Haitian Creole',
            short_name: 'ht',
            native_name: 'Kreyòl ayisyen'
          } ,
          {
            id: '924bce04-c7d1-46e9-b068-501dca6619fc',
            name: 'Hausa',
            short_name: 'ha',
            native_name: 'Hausa, هَوُسَ'
          } ,
          {
            id: '872f0540-c16a-4fec-a1ea-fd86c3213133',
            name: 'Hebrew',
            short_name: 'he',
            native_name: 'עברית'
          } ,
          {
            id: '132c5552-09fb-429c-8632-3fc6668ff2fb',
            name: 'Hebrew',
            short_name: 'iw',
            native_name: 'עברית'
          } ,
          {
            id: '7345a31d-63ef-4330-9c5b-c8e165ba0911',
            name: 'Herero',
            short_name: 'hz',
            native_name: 'Otjiherero'
          } ,
          {
            id: '10502f98-d733-4567-af77-54db62f58594',
            name: 'Hindi',
            short_name: 'hi',
            native_name: 'हिन्दी, हिंदी'
          } ,
          {
            id: '6c5010cd-13bc-4024-8f28-0c63cec3c452',
            name: 'Hiri Motu',
            short_name: 'ho',
            native_name: 'Hiri Motu'
          } ,
          {
            id: 'ddc42a21-da3b-46d8-940a-455adc4d2468',
            name: 'Hungarian',
            short_name: 'hu',
            native_name: 'Magyar'
          } ,
          {
            id: 'c51d43c8-af1a-4ae3-8e74-e5087a90fe14',
            name: 'Interlingua',
            short_name: 'ia',
            native_name: 'Interlingua'
          } ,
          {
            id: 'e0195d4f-5155-4cc5-ac98-cbb7f7fffebe',
            name: 'Indonesian',
            short_name: 'id',
            native_name: 'Bahasa Indonesia'
          } ,
          {
            id: '90dfb00f-d720-48a0-aaa1-bf143686b603',
            name: 'Interlingue',
            short_name: 'ie',
            native_name: 'Originally called Occidental; then Interlingue after WWII'
          } ,
          {
            id: 'bc3abcd7-3895-4e69-9404-80c298b2f82f',
            name: 'Irish',
            short_name: 'ga',
            native_name: 'Gaeilge'
          } ,
          {
            id: '863dc802-4e2a-4c69-8f3a-7edcc0c30cad',
            name: 'Igbo',
            short_name: 'ig',
            native_name: 'Asụsụ Igbo'
          } ,
          {
            id: 'be24aeb6-5464-4e80-956e-5bc2ce5316d0',
            name: 'Inupiaq',
            short_name: 'ik',
            native_name: 'Iñupiaq, Iñupiatun'
          } ,
          {
            id: 'b3d0d2c0-3668-45e1-84f0-cc806c663cea',
            name: 'Ido',
            short_name: 'io',
            native_name: 'Ido'
          } ,
          {
            id: '1c0b5253-3746-4601-a86e-760c8af5e968',
            name: 'Icelandic',
            short_name: 'is',
            native_name: 'Íslenska'
          } ,
          {
            id: '58e650aa-3ef2-4de1-9006-5c29b658e186',
            name: 'Italian',
            short_name: 'it',
            native_name: 'Italiano'
          } ,
          {
            id: 'eb0f418f-e65b-4f4f-8848-0b8d6e030f78',
            name: 'Inuktitut',
            short_name: 'iu',
            native_name: 'ᐃᓄᒃᑎᑐᑦ'
          } ,
          {
            id: 'efa3c68d-0153-4125-9187-78e3e2308f85',
            name: 'Japanese',
            short_name: 'ja',
            native_name: '日本語 (にほんご／にっぽんご)'
          } ,
          {
            id: 'a2f15e07-41dd-4cc4-b4d4-4b0b9b9111f3',
            name: 'Javanese',
            short_name: 'jv',
            native_name: 'basa Jawa'
          } ,
          {
            id: 'bd57f453-42ab-4293-9a41-3e28af3d6ef1',
            name: 'Kalaallisut, Greenlandic',
            short_name: 'kl',
            native_name: 'kalaallisut, kalaallit oqaasii'
          } ,
          {
            id: '52cae904-2905-4687-a3d4-4647f4f2ee98',
            name: 'Kannada',
            short_name: 'kn',
            native_name: 'ಕನ್ನಡ'
          } ,
          {
            id: '71384874-4366-45b7-b91c-5fe3d1ab534c',
            name: 'Kanuri',
            short_name: 'kr',
            native_name: 'Kanuri'
          } ,
          {
            id: 'a969242a-096a-4129-b5a1-785f2e77b205',
            name: 'Kashmiri',
            short_name: 'ks',
            native_name: 'कश्मीरी, كشميري‎'
          } ,
          {
            id: '50e48783-5a8f-4115-a1db-302627494f36',
            name: 'Kazakh',
            short_name: 'kk',
            native_name: 'Қазақ тілі'
          } ,
          {
            id: 'ad5f47f1-ea5e-4a49-9ea8-b077fca87d19',
            name: 'Khmer',
            short_name: 'km',
            native_name: 'ភាសាខ្មែរ'
          } ,
          {
            id: '1853489f-0f00-42d4-a22a-1c42a86b1edc',
            name: 'Kikuyu, Gikuyu',
            short_name: 'ki',
            native_name: 'Gĩkũyũ'
          } ,
          {
            id: 'bb5fc47e-b7b8-4605-aded-e3e61740163e',
            name: 'Kinyarwanda',
            short_name: 'rw',
            native_name: 'Ikinyarwanda'
          } ,
          {
            id: 'f3b65c27-ed88-48c2-9ec6-9ebbde079447',
            name: 'Kirghiz, Kyrgyz',
            short_name: 'ky',
            native_name: 'кыргыз тили'
          } ,
          {
            id: '68a04770-4705-4570-9038-fbdce6346b9c',
            name: 'Komi',
            short_name: 'kv',
            native_name: 'коми кыв'
          } ,
          {
            id: '7f13b75b-12e1-4d62-810f-57ce7fd0b2bb',
            name: 'Kongo',
            short_name: 'kg',
            native_name: 'KiKongo'
          } ,
          {
            id: '39d0afec-8a87-42ac-a7ba-25ed62a60d8e',
            name: 'Korean',
            short_name: 'ko',
            native_name: '한국어 (韓國語), 조선말 (朝鮮語)'
          } ,
          {
            id: 'f8f01cdd-6cea-4376-9a4c-6a0d063c6d32',
            name: 'Kurdish',
            short_name: 'ku',
            native_name: 'Kurdî, كوردی‎'
          } ,
          {
            id: 'fd533dee-3f86-4255-8b67-00add7d489e1',
            name: 'Kwanyama, Kuanyama',
            short_name: 'kj',
            native_name: 'Kuanyama'
          } ,
          {
            id: '59d954c2-a0db-4e4f-87d1-38544e980c59',
            name: 'Latin',
            short_name: 'la',
            native_name: 'latine, lingua latina'
          } ,
          {
            id: '55c03fce-1ae4-48a9-9118-9be83aa240a3',
            name: 'Luxembourgish, Letzeburgesch',
            short_name: 'lb',
            native_name: 'Lëtzebuergesch'
          } ,
          {
            id: 'b846dbf9-c1b6-40f1-a711-5234999dd58e',
            name: 'Luganda',
            short_name: 'lg',
            native_name: 'Luganda'
          } ,
          {
            id: '0ca2be33-2de8-453e-90f1-efe51fecc310',
            name: 'Limburgish, Limburgan, Limburger',
            short_name: 'li',
            native_name: 'Limburgs'
          } ,
          {
            id: '434cdf83-9d8c-4611-be0a-83292673629f',
            name: 'Lingala',
            short_name: 'ln',
            native_name: 'Lingála'
          } ,
          {
            id: '04392195-1fe2-4da0-9887-84531db295dd',
            name: 'Lao',
            short_name: 'lo',
            native_name: 'ພາສາລາວ'
          } ,
          {
            id: '53271104-dd10-4039-92f8-a0c7f919d046',
            name: 'Lithuanian',
            short_name: 'lt',
            native_name: 'lietuvių kalba'
          } ,
          {
            id: 'bc1c5bd2-602e-4d0f-ac9b-7bedc8160b9f',
            name: 'Luba-Katanga',
            short_name: 'lu',
            native_name: ''
          } ,
          {
            id: '02e36386-2dbd-4ea2-9fb7-436fcf0918f2',
            name: 'Latvian',
            short_name: 'lv',
            native_name: 'latviešu valoda'
          } ,
          {
            id: 'cc875b71-75ab-4d6d-aa63-7c1cad268e2b',
            name: 'Manx',
            short_name: 'gv',
            native_name: 'Gaelg, Gailck'
          } ,
          {
            id: '5b520d5b-6f96-4623-bdbc-9610f1591ac6',
            name: 'Macedonian',
            short_name: 'mk',
            native_name: 'македонски јазик'
          } ,
          {
            id: 'c8f70d69-08c3-47b4-896b-718d3a468c27',
            name: 'Malagasy',
            short_name: 'mg',
            native_name: 'Malagasy fiteny'
          } ,
          {
            id: 'cdcd1470-b950-4da6-85fa-52d9c8e87df8',
            name: 'Malay',
            short_name: 'ms',
            native_name: 'bahasa Melayu, بهاس ملايو‎'
          } ,
          {
            id: 'd76416ac-2345-4cbd-978c-2d19f098ecc4',
            name: 'Malayalam',
            short_name: 'ml',
            native_name: 'മലയാളം'
          } ,
          {
            id: 'f54f3855-a595-413d-a016-07b75db2eb83',
            name: 'Maltese',
            short_name: 'mt',
            native_name: 'Malti'
          } ,
          {
            id: 'e1b2fbd2-e5d2-4c15-8339-673d508ea395',
            name: 'Māori',
            short_name: 'mi',
            native_name: 'te reo Māori'
          } ,
          {
            id: 'e48d6f70-c715-4fb9-9f4f-057cd98b9502',
            name: 'Marathi (Marāṭhī)',
            short_name: 'mr',
            native_name: 'मराठी'
          } ,
          {
            id: '9909e3eb-6fef-4c12-81a6-8e45e9bcb97b',
            name: 'Marshallese',
            short_name: 'mh',
            native_name: 'Kajin M̧ajeļ'
          } ,
          {
            id: '6753969e-8bfa-4c0c-ac38-6428521350dc',
            name: 'Mongolian',
            short_name: 'mn',
            native_name: 'монгол'
          } ,
          {
            id: '53bee23c-1c66-488e-afd6-c0c1b9def76e',
            name: 'Nauru',
            short_name: 'na',
            native_name: 'Ekakairũ Naoero'
          } ,
          {
            id: '4fe6f04b-ac5f-44ac-8213-a80f267d03a7',
            name: 'Navajo, Navaho',
            short_name: 'nv',
            native_name: 'Diné bizaad, Dinékʼehǰí'
          } ,
          {
            id: 'c562dc40-a9e8-4e52-9fe8-fa0b30a1f1e7',
            name: 'Norwegian Bokmål',
            short_name: 'nb',
            native_name: 'Norsk bokmål'
          } ,
          {
            id: 'bde6e552-39ce-458b-abaf-8c1a30e5b8f4',
            name: 'North Ndebele',
            short_name: 'nd',
            native_name: 'isiNdebele'
          } ,
          {
            id: '3c0c9e4b-be31-4e32-896c-695e36687b8e',
            name: 'Nepali',
            short_name: 'ne',
            native_name: 'नेपाली'
          } ,
          {
            id: 'b4a802d6-9f5d-4c5a-a47f-b6b5b92cbb44',
            name: 'Ndonga',
            short_name: 'ng',
            native_name: 'Owambo'
          } ,
          {
            id: '1ab8e870-0185-4007-99e9-34f160298f64',
            name: 'Norwegian Nynorsk',
            short_name: 'nn',
            native_name: 'Norsk nynorsk'
          } ,
          {
            id: '42263f0c-d792-4ea5-a810-036ea876e908',
            name: 'Norwegian',
            short_name: 'no',
            native_name: 'Norsk'
          } ,
          {
            id: 'f3910b41-d0af-4b9e-8e42-1519c446013f',
            name: 'Nuosu',
            short_name: 'ii',
            native_name: 'ꆈꌠ꒿ Nuosuhxop'
          } ,
          {
            id: '4ade1684-3206-46d6-ae10-0c61bbb40b94',
            name: 'South Ndebele',
            short_name: 'nr',
            native_name: 'isiNdebele'
          } ,
          {
            id: 'b8b77fae-d9da-4c96-9324-877d589a3dc2',
            name: 'Occitan',
            short_name: 'oc',
            native_name: 'Occitan'
          } ,
          {
            id: 'f3b6dc77-f24d-4626-aa51-f8bc05874098',
            name: 'Ojibwe, Ojibwa',
            short_name: 'oj',
            native_name: 'ᐊᓂᔑᓈᐯᒧᐎᓐ'
          } ,
          {
            id: 'e8a2a22a-8052-478f-bfca-045d10b8ab01',
            name: 'Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic',
            short_name: 'cu',
            native_name: 'ѩзыкъ словѣньскъ'
          } ,
          {
            id: '61695c97-e737-48e2-9de1-880bd5d8ea6b',
            name: 'Oromo',
            short_name: 'om',
            native_name: 'Afaan Oromoo'
          } ,
          {
            id: '2b3cbc51-ec07-420c-af73-863d1d44d4a9',
            name: 'Oriya',
            short_name: 'or',
            native_name: 'ଓଡ଼ିଆ'
          } ,
          {
            id: '52e63285-1045-4563-a6c4-c0a46b3b476b',
            name: 'Ossetian, Ossetic',
            short_name: 'os',
            native_name: 'ирон æвзаг'
          } ,
          {
            id: '29f47277-e70e-4e09-a453-823c2d898db1',
            name: 'Panjabi, Punjabi',
            short_name: 'pa',
            native_name: 'ਪੰਜਾਬੀ, پنجابی‎'
          } ,
          {
            id: 'd1963d89-5bf5-48be-a7a2-2483d900f37d',
            name: 'Pāli',
            short_name: 'pi',
            native_name: 'पाऴि'
          } ,
          {
            id: '6cf886d6-7409-4ffd-991c-f2a6f8e9cd1c',
            name: 'Persian',
            short_name: 'fa',
            native_name: 'فارسی'
          } ,
          {
            id: '5fb266c9-0771-4e10-ba76-9ef7f983f7e2',
            name: 'Polish',
            short_name: 'pl',
            native_name: 'polski'
          } ,
          {
            id: '30636636-76fe-476d-a9b9-1368bea43697',
            name: 'Pashto, Pushto',
            short_name: 'ps',
            native_name: 'پښتو'
          } ,
          {
            id: 'dff5fed3-c0f3-4771-bcdb-019b3858c55d',
            name: 'Portuguese',
            short_name: 'pt',
            native_name: 'Português'
          } ,
          {
            id: '183a79bf-d9f8-42e9-bc95-4c8e5e88d4b6',
            name: 'Quechua',
            short_name: 'qu',
            native_name: 'Runa Simi, Kichwa'
          } ,
          {
            id: '8c570f25-a11c-4d33-ad13-2b3391bd769e',
            name: 'Romansh',
            short_name: 'rm',
            native_name: 'rumantsch grischun'
          } ,
          {
            id: 'a78c067e-a8ce-4e55-a20e-d68fb15876ca',
            name: 'Kirundi',
            short_name: 'rn',
            native_name: 'kiRundi'
          } ,
          {
            id: '2f94e4f8-fa06-4bc0-93b9-4868147fd916',
            name: 'Romanian, Moldavian, Moldovan',
            short_name: 'ro',
            native_name: 'română'
          } ,
          {
            id: '200d727d-af34-468a-8a8c-75e67be6c80b',
            name: 'Russian',
            short_name: 'ru',
            native_name: 'русский язык'
          } ,
          {
            id: '1aa0b95b-6c05-4df9-8618-1143ce994d7b',
            name: 'Sanskrit (Saṁskṛta)',
            short_name: 'sa',
            native_name: 'संस्कृतम्'
          } ,
          {
            id: '07919363-4aa9-44c5-98d7-5157e2977551',
            name: 'Sardinian',
            short_name: 'sc',
            native_name: 'sardu'
          } ,
          {
            id: 'b590fe68-7a10-461d-a95f-662904c1fac2',
            name: 'Sindhi',
            short_name: 'sd',
            native_name: 'सिन्धी, سنڌي، سندھی‎'
          } ,
          {
            id: '9ce88f93-3b69-4f53-a321-389bd9231288',
            name: 'Northern Sami',
            short_name: 'se',
            native_name: 'Davvisámegiella'
          } ,
          {
            id: '363ad47d-3be0-45f8-bad5-5cf19f045db4',
            name: 'Samoan',
            short_name: 'sm',
            native_name: 'gagana faa Samoa'
          } ,
          {
            id: '10a54c3e-3918-4d71-84fb-e5cee3b1d79b',
            name: 'Sango',
            short_name: 'sg',
            native_name: 'yângâ tî sängö'
          } ,
          {
            id: '0368f895-7b92-4c3d-8970-2dad8ab54f03',
            name: 'Serbian',
            short_name: 'sr',
            native_name: 'српски језик'
          } ,
          {
            id: '0a5f85d6-1d2f-4fb6-a665-b99cb419fcaa',
            name: 'Scottish Gaelic; Gaelic',
            short_name: 'gd',
            native_name: 'Gàidhlig'
          } ,
          {
            id: '8bfb41ba-7ae6-44a3-a197-21083c74cd43',
            name: 'Shona',
            short_name: 'sn',
            native_name: 'chiShona'
          } ,
          {
            id: '41e083f0-ec6d-4d5f-8a92-95d78bd718a1',
            name: 'Sinhala, Sinhalese',
            short_name: 'si',
            native_name: 'සිංහල'
          } ,
          {
            id: 'cbbaacfc-4d17-491f-9ccc-98b8ffc45e29',
            name: 'Slovak',
            short_name: 'sk',
            native_name: 'slovenčina'
          } ,
          {
            id: '8ea2cb50-e3f9-4b29-ad5c-e2e36b808538',
            name: 'Slovene',
            short_name: 'sl',
            native_name: 'slovenščina'
          } ,
          {
            id: '8016767c-bf97-4f21-b863-bb7958ad7b65',
            name: 'Somali',
            short_name: 'so',
            native_name: 'Soomaaliga, af Soomaali'
          } ,
          {
            id: '4861d552-873a-4f93-8fe1-2f170cd96a3f',
            name: 'Southern Sotho',
            short_name: 'st',
            native_name: 'Sesotho'
          } ,
          {
            id: '91b02606-3710-4b89-91e6-40722bbaa370',
            name: 'Spanish; Castilian',
            short_name: 'es',
            native_name: 'español, castellano'
          } ,
          {
            id: '8edf3529-228c-4857-ac05-7d5da85ecf2b',
            name: 'Sundanese',
            short_name: 'su',
            native_name: 'Basa Sunda'
          } ,
          {
            id: 'b6230a93-a0fc-45af-9818-419519fde74b',
            name: 'Swahili',
            short_name: 'sw',
            native_name: 'Kiswahili'
          } ,
          {
            id: '88e4ada5-fb86-4e87-9aa2-7d7283b98d56',
            name: 'Swati',
            short_name: 'ss',
            native_name: 'SiSwati'
          } ,
          {
            id: 'b444d61f-e7c8-4a77-88e9-b7f868c01106',
            name: 'Swedish',
            short_name: 'sv',
            native_name: 'svenska'
          } ,
          {
            id: '82ee7055-d8da-4d48-af47-5afc5eccabef',
            name: 'Tamil',
            short_name: 'ta',
            native_name: 'தமிழ்'
          } ,
          {
            id: '3d78e0f5-d2d6-4d2f-b7e5-5f37a19c6f5a',
            name: 'Telugu',
            short_name: 'te',
            native_name: 'తెలుగు'
          } ,
          {
            id: 'e093462b-2c2f-498a-87a9-a5ca5ef3abe6',
            name: 'Tajik',
            short_name: 'tg',
            native_name: 'тоҷикӣ, toğikī, تاجیکی‎'
          } ,
          {
            id: 'b00da4d5-4964-4a5d-b791-5792661d2efe',
            name: 'Thai',
            short_name: 'th',
            native_name: 'ไทย'
          } ,
          {
            id: '2c64e043-3b88-47d3-9b0b-1d686201975d',
            name: 'Tigrinya',
            short_name: 'ti',
            native_name: 'ትግርኛ'
          } ,
          {
            id: 'd4fec86f-6094-46f1-9700-420fe3d23402',
            name: 'Tibetan Standard, Tibetan, Central',
            short_name: 'bo',
            native_name: 'བོད་ཡིག'
          } ,
          {
            id: '6241bff9-654b-4b6e-992e-dce9d19c598e',
            name: 'Turkmen',
            short_name: 'tk',
            native_name: 'Türkmen, Түркмен'
          } ,
          {
            id: '6d48038c-8b49-4cff-9302-6f13f5a9b192',
            name: 'Tagalog',
            short_name: 'tl',
            native_name: 'Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔'
          } ,
          {
            id: '08d88ced-0ae9-475d-9404-951b2bb6bf6b',
            name: 'Tswana',
            short_name: 'tn',
            native_name: 'Setswana'
          } ,
          {
            id: 'f927e7f8-af69-496e-99a4-dd5d8046fe51',
            name: 'Tonga (Tonga Islands)',
            short_name: 'to',
            native_name: 'faka Tonga'
          } ,
          {
            id: '1171844b-b362-486d-849e-a4d3e4c62977',
            name: 'Turkish',
            short_name: 'tr',
            native_name: 'Türkçe'
          } ,
          {
            id: 'aacb14d0-a40c-487e-916a-6ac5c1a72ed3',
            name: 'Tsonga',
            short_name: 'ts',
            native_name: 'Xitsonga'
          } ,
          {
            id: '541b3806-92ae-4d19-8c5f-60a3a7c56cd6',
            name: 'Tatar',
            short_name: 'tt',
            native_name: 'татарча, tatarça, تاتارچا‎'
          } ,
          {
            id: 'f15f4baf-47cb-4879-99f9-6b9a9b089d64',
            name: 'Twi',
            short_name: 'tw',
            native_name: 'Twi'
          } ,
          {
            id: '43ba0dca-597c-4c0e-bfc1-5413f9711b7b',
            name: 'Tahitian',
            short_name: 'ty',
            native_name: 'Reo Tahiti'
          } ,
          {
            id: '37423f50-517e-4cc0-b8f2-70472b50387e',
            name: 'Uighur, Uyghur',
            short_name: 'ug',
            native_name: 'Uyƣurqə, ئۇيغۇرچە‎'
          } ,
          {
            id: 'fc7eb094-6b25-4b8f-a37b-173185e2de06',
            name: 'Ukrainian',
            short_name: 'uk',
            native_name: 'українська'
          } ,
          {
            id: '0d643d90-6f88-429c-b180-7c81ca316abf',
            name: 'Urdu',
            short_name: 'ur',
            native_name: 'اردو'
          } ,
          {
            id: '8f937dd2-cc55-4175-837e-a833c5e1cbb3',
            name: 'Uzbek',
            short_name: 'uz',
            native_name: 'zbek, Ўзбек, أۇزبېك‎'
          } ,
          {
            id: 'f48161bd-68f3-4383-abf7-9545d1efa85e',
            name: 'Venda',
            short_name: 've',
            native_name: 'Tshivenḓa'
          } ,
          {
            id: '24c1fbd4-7da7-4741-9f25-0e2e258b0cf7',
            name: 'Vietnamese',
            short_name: 'vi',
            native_name: 'Tiếng Việt'
          } ,
          {
            id: 'af8eb0ab-abe5-40e6-8654-f0c38dd6b514',
            name: 'Volapük',
            short_name: 'vo',
            native_name: 'Volapük'
          } ,
          {
            id: 'cdded777-1076-47dc-8236-63dc165e4bb5',
            name: 'Walloon',
            short_name: 'wa',
            native_name: 'Walon'
          } ,
          {
            id: '5d7c162c-cc2a-4cd3-ad33-a3186bfa88bb',
            name: 'Welsh',
            short_name: 'cy',
            native_name: 'Cymraeg'
          } ,
          {
            id: 'e0d362d1-7f20-44ff-83b6-56bf43a96120',
            name: 'Wolof',
            short_name: 'wo',
            native_name: 'Wollof'
          } ,
          {
            id: 'c7b096e0-1e50-4d82-aa67-fd4823ec6653',
            name: 'Western Frisian',
            short_name: 'fy',
            native_name: 'Frysk'
          } ,
          {
            id: 'a0c443ae-f3a5-45a2-bf18-299655cce2b2',
            name: 'Xhosa',
            short_name: 'xh',
            native_name: 'isiXhosa'
          } ,
          {
            id: 'e6042ed7-a7f0-4d20-ada8-a9c96f4e5030',
            name: 'Yiddish',
            short_name: 'yi',
            native_name: 'ייִדיש'
          } ,
          {
            id: 'de061b55-71d1-4604-af93-dc5ad3d4d3f5',
            name: 'Corsican',
            short_name: 'co',
            native_name: 'corsu, lingua corsa'
          } ,
          {
            id: '95b846a9-e4b8-459a-8fd6-6c580bf6ddf2',
            name: 'Yoruba',
            short_name: 'yo',
            native_name: 'Yorùbá'
          } ,
          {
            id: '0091683f-fbdf-4a44-a940-1cc173b6f940',
            name: 'Zhuang, Chuang',
            short_name: 'za',
            native_name: 'Saɯ cueŋƅ, Saw cuengh'
          } ,   
    ]
    
    return languages
}

module.exports = createSettingLanguage;