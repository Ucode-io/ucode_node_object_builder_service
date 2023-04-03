async function createSettingCurrency() {
    let currencies = [
        {
            id: '88c816a3-24e8-4994-ab70-9bc826bb9dc3',
            symbol: '$',
            name: 'US Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'USD',
            name_plural: 'US dollars'
          } ,
          {
            id: 'bbd9dbfa-d832-41fd-9567-2ac30e173991',
            symbol: 'CA$',
            name: 'Canadian Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'CAD',
            name_plural: 'Canadian dollars'
          } ,
          {
            id: '61b72b4f-b8a3-44c5-a102-27e1d885a9b8',
            symbol: '€',
            name: 'Euro',
            symbol_native: '€',
            decimal_digits: 2,
            rounding: 0,
            code: 'EUR',
            name_plural: 'euros'
          } ,
          {
            id: '7da96a66-cf7f-436e-a7b7-6667cd5225d8',
            symbol: 'AED',
            name: 'United Arab Emirates Dirham',
            symbol_native: 'د.إ.‏',
            decimal_digits: 2,
            rounding: 0,
            code: 'AED',
            name_plural: 'UAE dirhams'
          } ,
          {
            id: '6723ca18-b3e5-4e84-b237-c7616a12438d',
            symbol: 'Af',
            name: 'Afghan Afghani',
            symbol_native: '؋',
            decimal_digits: 0,
            rounding: 0,
            code: 'AFN',
            name_plural: 'Afghan Afghanis'
          } ,
          {
            id: 'bbbb0e44-a20c-4642-b2a9-88f2094ef83c',
            symbol: 'ALL',
            name: 'Albanian Lek',
            symbol_native: 'Lek',
            decimal_digits: 0,
            rounding: 0,
            code: 'ALL',
            name_plural: 'Albanian lekë'
          } ,
          {
            id: '3b36956d-e91b-4154-99e8-c12b387934cb',
            symbol: 'AMD',
            name: 'Armenian Dram',
            symbol_native: 'դր.',
            decimal_digits: 0,
            rounding: 0,
            code: 'AMD',
            name_plural: 'Armenian drams'
          } ,
          {
            id: 'f8d3b54b-b517-45e2-affe-b6db88e44014',
            symbol: 'AR$',
            name: 'Argentine Peso',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'ARS',
            name_plural: 'Argentine pesos'
          } ,
          {
            id: '619eef58-114b-4a7a-b61b-3b8964df7078',
            symbol: 'AU$',
            name: 'Australian Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'AUD',
            name_plural: 'Australian dollars'
          } ,
          {
            id: '3a3f05c6-73fe-4c22-8833-a20f582afe74',
            symbol: 'man.',
            name: 'Azerbaijani Manat',
            symbol_native: 'ман.',
            decimal_digits: 2,
            rounding: 0,
            code: 'AZN',
            name_plural: 'Azerbaijani manats'
          } ,
          {
            id: 'b1531617-42ff-4a2c-a187-b0f86bd9cb7e',
            symbol: 'KM',
            name: 'Bosnia-Herzegovina Convertible Mark',
            symbol_native: 'KM',
            decimal_digits: 2,
            rounding: 0,
            code: 'BAM',
            name_plural: 'Bosnia-Herzegovina convertible marks'
          } ,
          {
            id: '06b9d4cf-eeef-41d7-b02a-8a8742a41fe4',
            symbol: 'Tk',
            name: 'Bangladeshi Taka',
            symbol_native: '৳',
            decimal_digits: 2,
            rounding: 0,
            code: 'BDT',
            name_plural: 'Bangladeshi takas'
          } ,
          {
            id: '43c1ebff-c612-4934-8a29-f88c4e45b47e',
            symbol: 'BGN',
            name: 'Bulgarian Lev',
            symbol_native: 'лв.',
            decimal_digits: 2,
            rounding: 0,
            code: 'BGN',
            name_plural: 'Bulgarian leva'
          } ,
          {
            id: 'c1e3cad3-ae22-4c14-96f9-0056dbc3ddb6',
            symbol: 'BD',
            name: 'Bahraini Dinar',
            symbol_native: 'د.ب.‏',
            decimal_digits: 3,
            rounding: 0,
            code: 'BHD',
            name_plural: 'Bahraini dinars'
          } ,
          {
            id: 'c89fae98-4bfb-4c07-8a64-09aedfc96aa4',
            symbol: 'FBu',
            name: 'Burundian Franc',
            symbol_native: 'FBu',
            decimal_digits: 0,
            rounding: 0,
            code: 'BIF',
            name_plural: 'Burundian francs'
          } ,
          {
            id: '3cd69d14-77ea-4637-b6b2-6230e5915d31',
            symbol: 'BN$',
            name: 'Brunei Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'BND',
            name_plural: 'Brunei dollars'
          } ,
          {
            id: '9b627cd8-e293-45c1-82cc-386a5ec292b0',
            symbol: 'Bs',
            name: 'Bolivian Boliviano',
            symbol_native: 'Bs',
            decimal_digits: 2,
            rounding: 0,
            code: 'BOB',
            name_plural: 'Bolivian bolivianos'
          } ,
          {
            id: '744fd5ae-cf14-4e5b-a57b-7d3b2f6be695',
            symbol: 'R$',
            name: 'Brazilian Real',
            symbol_native: 'R$',
            decimal_digits: 2,
            rounding: 0,
            code: 'BRL',
            name_plural: 'Brazilian reals'
          } ,
          {
            id: 'd601fe36-c362-4c1e-b56a-02168e51341b',
            symbol: 'BWP',
            name: 'Botswanan Pula',
            symbol_native: 'P',
            decimal_digits: 2,
            rounding: 0,
            code: 'BWP',
            name_plural: 'Botswanan pulas'
          } ,
          {
            id: 'e5c5452a-a8ea-4949-a40a-4fda052cf886',
            symbol: 'Br',
            name: 'Belarusian Ruble',
            symbol_native: 'руб.',
            decimal_digits: 2,
            rounding: 0,
            code: 'BYN',
            name_plural: 'Belarusian rubles'
          } ,
          {
            id: '59f746c8-3c55-4ca3-9e0a-3fe2bde456b8',
            symbol: 'BZ$',
            name: 'Belize Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'BZD',
            name_plural: 'Belize dollars'
          } ,
          {
            id: 'a22b54a3-1166-4d5a-8dda-abff1678af5d',
            symbol: 'CDF',
            name: 'Congolese Franc',
            symbol_native: 'FrCD',
            decimal_digits: 2,
            rounding: 0,
            code: 'CDF',
            name_plural: 'Congolese francs'
          } ,
          {
            id: 'f1fd490e-2766-4528-a1cf-b4deebde6499',
            symbol: 'CHF',
            name: 'Swiss Franc',
            symbol_native: 'CHF',
            decimal_digits: 2,
            rounding: 0.05,
            code: 'CHF',
            name_plural: 'Swiss francs'
          } ,
          {
            id: '140bdd3b-c148-45fe-8686-d96070e17db9',
            symbol: 'CL$',
            name: 'Chilean Peso',
            symbol_native: '$',
            decimal_digits: 0,
            rounding: 0,
            code: 'CLP',
            name_plural: 'Chilean pesos'
          } ,
          {
            id: '76133689-a149-40e2-ad40-48b5b8fd44ef',
            symbol: 'CN¥',
            name: 'Chinese Yuan',
            symbol_native: 'CN¥',
            decimal_digits: 2,
            rounding: 0,
            code: 'CNY',
            name_plural: 'Chinese yuan'
          } ,
          {
            id: 'fff34be1-f6eb-4932-94ee-35b176af98ce',
            symbol: 'CO$',
            name: 'Colombian Peso',
            symbol_native: '$',
            decimal_digits: 0,
            rounding: 0,
            code: 'COP',
            name_plural: 'Colombian pesos'
          } ,
          {
            id: '0e12b70e-ef10-4bdb-8f92-93c63e697738',
            symbol: '₡',
            name: 'Costa Rican Colón',
            symbol_native: '₡',
            decimal_digits: 0,
            rounding: 0,
            code: 'CRC',
            name_plural: 'Costa Rican colóns'
          } ,
          {
            id: 'bfcd65e1-c6a0-4cb8-9ce9-a2698b52bb9d',
            symbol: 'CV$',
            name: 'Cape Verdean Escudo',
            symbol_native: 'CV$',
            decimal_digits: 2,
            rounding: 0,
            code: 'CVE',
            name_plural: 'Cape Verdean escudos'
          } ,
          {
            id: 'dc9306e2-2238-4324-96e1-c9d5f5f5effc',
            symbol: 'Kč',
            name: 'Czech Republic Koruna',
            symbol_native: 'Kč',
            decimal_digits: 2,
            rounding: 0,
            code: 'CZK',
            name_plural: 'Czech Republic korunas'
          } ,
          {
            id: 'bb650ff2-d016-4115-b7b9-c62dc7d7ec0f',
            symbol: 'Fdj',
            name: 'Djiboutian Franc',
            symbol_native: 'Fdj',
            decimal_digits: 0,
            rounding: 0,
            code: 'DJF',
            name_plural: 'Djiboutian francs'
          } ,
          {
            id: 'b6d3fc33-c4ff-4792-888f-748ae74e35bf',
            symbol: 'Dkr',
            name: 'Danish Krone',
            symbol_native: 'kr',
            decimal_digits: 2,
            rounding: 0,
            code: 'DKK',
            name_plural: 'Danish kroner'
          } ,
          {
            id: 'fe60ebf8-134f-4581-8543-e6112adb367e',
            symbol: 'RD$',
            name: 'Dominican Peso',
            symbol_native: 'RD$',
            decimal_digits: 2,
            rounding: 0,
            code: 'DOP',
            name_plural: 'Dominican pesos'
          } ,
          {
            id: 'e8fb26bd-34b6-424d-adbe-f744a14b8842',
            symbol: 'DA',
            name: 'Algerian Dinar',
            symbol_native: 'د.ج.‏',
            decimal_digits: 2,
            rounding: 0,
            code: 'DZD',
            name_plural: 'Algerian dinars'
          } ,
          {
            id: 'ebc3327c-9db0-4563-9ba5-cec15d150617',
            symbol: 'Ekr',
            name: 'Estonian Kroon',
            symbol_native: 'kr',
            decimal_digits: 2,
            rounding: 0,
            code: 'EEK',
            name_plural: 'Estonian kroons'
          } ,
          {
            id: '513ff6e6-b34b-4a79-834b-00b269949019',
            symbol: 'EGP',
            name: 'Egyptian Pound',
            symbol_native: 'ج.م.‏',
            decimal_digits: 2,
            rounding: 0,
            code: 'EGP',
            name_plural: 'Egyptian pounds'
          } ,
          {
            id: '88b901fa-0acc-4940-ad5a-cbbd0206d068',
            symbol: 'Nfk',
            name: 'Eritrean Nakfa',
            symbol_native: 'Nfk',
            decimal_digits: 2,
            rounding: 0,
            code: 'ERN',
            name_plural: 'Eritrean nakfas'
          } ,
          {
            id: 'c8acc9f8-e359-45da-8578-a3c41d26238b',
            symbol: 'Br',
            name: 'Ethiopian Birr',
            symbol_native: 'Br',
            decimal_digits: 2,
            rounding: 0,
            code: 'ETB',
            name_plural: 'Ethiopian birrs'
          } ,
          {
            id: '2d479a1d-4788-4726-b0b0-639d206fb304',
            symbol: '£',
            name: 'British Pound Sterling',
            symbol_native: '£',
            decimal_digits: 2,
            rounding: 0,
            code: 'GBP',
            name_plural: 'British pounds sterling'
          } ,
          {
            id: '76cbaa31-b5d7-447d-8dee-62362f8d54ec',
            symbol: 'GEL',
            name: 'Georgian Lari',
            symbol_native: 'GEL',
            decimal_digits: 2,
            rounding: 0,
            code: 'GEL',
            name_plural: 'Georgian laris'
          } ,
          {
            id: '3ce6a0a7-7558-4fec-bced-5f586a79fdf6',
            symbol: 'GH₵',
            name: 'Ghanaian Cedi',
            symbol_native: 'GH₵',
            decimal_digits: 2,
            rounding: 0,
            code: 'GHS',
            name_plural: 'Ghanaian cedis'
          } ,
          {
            id: 'de16184a-e743-46d2-9ed5-a8032ce99a92',
            symbol: 'FG',
            name: 'Guinean Franc',
            symbol_native: 'FG',
            decimal_digits: 0,
            rounding: 0,
            code: 'GNF',
            name_plural: 'Guinean francs'
          } ,
          {
            id: 'dd2b77a5-ddb3-4577-ac94-d9cd4b1add21',
            symbol: 'GTQ',
            name: 'Guatemalan Quetzal',
            symbol_native: 'Q',
            decimal_digits: 2,
            rounding: 0,
            code: 'GTQ',
            name_plural: 'Guatemalan quetzals'
          } ,
          {
            id: '8feb2f7b-7540-418e-b4e6-4fd41527d2b0',
            symbol: 'HK$',
            name: 'Hong Kong Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'HKD',
            name_plural: 'Hong Kong dollars'
          } ,
          {
            id: '40d8f422-2c66-4314-9263-36b4c73bbd85',
            symbol: 'HNL',
            name: 'Honduran Lempira',
            symbol_native: 'L',
            decimal_digits: 2,
            rounding: 0,
            code: 'HNL',
            name_plural: 'Honduran lempiras'
          } ,
          {
            id: 'bfb9a799-2fee-4d6b-98aa-e66e09e1bd4d',
            symbol: 'kn',
            name: 'Croatian Kuna',
            symbol_native: 'kn',
            decimal_digits: 2,
            rounding: 0,
            code: 'HRK',
            name_plural: 'Croatian kunas'
          } ,
          {
            id: 'e0038fd7-6274-431d-85cf-dc6915a08113',
            symbol: 'Ft',
            name: 'Hungarian Forint',
            symbol_native: 'Ft',
            decimal_digits: 0,
            rounding: 0,
            code: 'HUF',
            name_plural: 'Hungarian forints'
          } ,
          {
            id: 'da3d85d3-9e1b-49b0-a5e8-fb7aea51173e',
            symbol: 'Rp',
            name: 'Indonesian Rupiah',
            symbol_native: 'Rp',
            decimal_digits: 0,
            rounding: 0,
            code: 'IDR',
            name_plural: 'Indonesian rupiahs'
          } ,
          {
            id: 'b8f82abc-1a1a-4565-97db-80dfcff219e0',
            symbol: '₪',
            name: 'Israeli New Sheqel',
            symbol_native: '₪',
            decimal_digits: 2,
            rounding: 0,
            code: 'ILS',
            name_plural: 'Israeli new sheqels'
          } ,
          {
            id: 'e1d57a10-d7b8-4c35-8635-0b783259e0a0',
            symbol: 'Rs',
            name: 'Indian Rupee',
            symbol_native: 'টকা',
            decimal_digits: 2,
            rounding: 0,
            code: 'INR',
            name_plural: 'Indian rupees'
          } ,
          {
            id: '3f64585c-0896-45fe-99dd-7365fb697793',
            symbol: 'IQD',
            name: 'Iraqi Dinar',
            symbol_native: 'د.ع.‏',
            decimal_digits: 0,
            rounding: 0,
            code: 'IQD',
            name_plural: 'Iraqi dinars'
          } ,
          {
            id: '17e89e40-5dc7-497c-bc3b-5e5c11b4402b',
            symbol: 'IRR',
            name: 'Iranian Rial',
            symbol_native: '﷼',
            decimal_digits: 0,
            rounding: 0,
            code: 'IRR',
            name_plural: 'Iranian rials'
          } ,
          {
            id: '6c5f50f1-4df9-4998-befb-196a7812e593',
            symbol: 'Ikr',
            name: 'Icelandic Króna',
            symbol_native: 'kr',
            decimal_digits: 0,
            rounding: 0,
            code: 'ISK',
            name_plural: 'Icelandic krónur'
          } ,
          {
            id: 'bbb2c459-d7de-4792-956d-5b379db36e91',
            symbol: 'J$',
            name: 'Jamaican Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'JMD',
            name_plural: 'Jamaican dollars'
          } ,
          {
            id: '63ac2cb6-2f7e-4dc1-a55f-1be93e039609',
            symbol: 'JD',
            name: 'Jordanian Dinar',
            symbol_native: 'د.أ.‏',
            decimal_digits: 3,
            rounding: 0,
            code: 'JOD',
            name_plural: 'Jordanian dinars'
          } ,
          {
            id: '43445998-eb7d-45d4-88e6-38d459c90b0c',
            symbol: '¥',
            name: 'Japanese Yen',
            symbol_native: '￥',
            decimal_digits: 0,
            rounding: 0,
            code: 'JPY',
            name_plural: 'Japanese yen'
          } ,
          {
            id: '7d76041a-419a-4c23-8c6e-4fde9dc4c9fc',
            symbol: 'Ksh',
            name: 'Kenyan Shilling',
            symbol_native: 'Ksh',
            decimal_digits: 2,
            rounding: 0,
            code: 'KES',
            name_plural: 'Kenyan shillings'
          } ,
          {
            id: '33803ff1-003d-4338-80ce-c41cca1a7189',
            symbol: 'KHR',
            name: 'Cambodian Riel',
            symbol_native: '៛',
            decimal_digits: 2,
            rounding: 0,
            code: 'KHR',
            name_plural: 'Cambodian riels'
          } ,
          {
            id: '7be9e9a7-c780-4671-8beb-55f5a3639087',
            symbol: 'CF',
            name: 'Comorian Franc',
            symbol_native: 'FC',
            decimal_digits: 0,
            rounding: 0,
            code: 'KMF',
            name_plural: 'Comorian francs'
          } ,
          {
            id: 'c0c590ed-5ecb-4050-bca3-b6edf166249a',
            symbol: '₩',
            name: 'South Korean Won',
            symbol_native: '₩',
            decimal_digits: 0,
            rounding: 0,
            code: 'KRW',
            name_plural: 'South Korean won'
          } ,
          {
            id: '51f9654c-f5b1-4e3d-8578-404a70954ddb',
            symbol: 'KD',
            name: 'Kuwaiti Dinar',
            symbol_native: 'د.ك.‏',
            decimal_digits: 3,
            rounding: 0,
            code: 'KWD',
            name_plural: 'Kuwaiti dinars'
          } ,
          {
            id: '7f307997-86ad-4fb1-b38c-7667e856a85f',
            symbol: 'KZT',
            name: 'Kazakhstani Tenge',
            symbol_native: 'тңг.',
            decimal_digits: 2,
            rounding: 0,
            code: 'KZT',
            name_plural: 'Kazakhstani tenges'
          } ,
          {
            id: '53200961-9b69-4f36-b1b8-d369a036ae3c',
            symbol: 'L.L.',
            name: 'Lebanese Pound',
            symbol_native: 'ل.ل.‏',
            decimal_digits: 0,
            rounding: 0,
            code: 'LBP',
            name_plural: 'Lebanese pounds'
          } ,
          {
            id: '1f48c91e-de86-42c3-aa02-c243a52a1170',
            symbol: 'SLRs',
            name: 'Sri Lankan Rupee',
            symbol_native: 'SL Re',
            decimal_digits: 2,
            rounding: 0,
            code: 'LKR',
            name_plural: 'Sri Lankan rupees'
          } ,
          {
            id: 'c7c037f3-9e47-4dbc-8c56-dd64dee585f2',
            symbol: 'Lt',
            name: 'Lithuanian Litas',
            symbol_native: 'Lt',
            decimal_digits: 2,
            rounding: 0,
            code: 'LTL',
            name_plural: 'Lithuanian litai'
          } ,
          {
            id: '76446d4e-9534-4862-b8e8-7fa446450246',
            symbol: 'Ls',
            name: 'Latvian Lats',
            symbol_native: 'Ls',
            decimal_digits: 2,
            rounding: 0,
            code: 'LVL',
            name_plural: 'Latvian lati'
          } ,
          {
            id: '5be4b237-e1a2-4d37-9433-31195f5172c5',
            symbol: 'LD',
            name: 'Libyan Dinar',
            symbol_native: 'د.ل.‏',
            decimal_digits: 3,
            rounding: 0,
            code: 'LYD',
            name_plural: 'Libyan dinars'
          } ,
          {
            id: 'b6abe2ba-a77c-4387-b756-3825ffbfddde',
            symbol: 'MAD',
            name: 'Moroccan Dirham',
            symbol_native: 'د.م.‏',
            decimal_digits: 2,
            rounding: 0,
            code: 'MAD',
            name_plural: 'Moroccan dirhams'
          } ,
          {
            id: 'c1d20a89-25ff-4c4c-ac33-505200053bb7',
            symbol: 'MDL',
            name: 'Moldovan Leu',
            symbol_native: 'MDL',
            decimal_digits: 2,
            rounding: 0,
            code: 'MDL',
            name_plural: 'Moldovan lei'
          } ,
          {
            id: '4bb7e565-863a-44bc-b312-7df75cff1035',
            symbol: 'MGA',
            name: 'Malagasy Ariary',
            symbol_native: 'MGA',
            decimal_digits: 0,
            rounding: 0,
            code: 'MGA',
            name_plural: 'Malagasy Ariaries'
          } ,
          {
            id: '9e2d3652-b170-435f-9300-fb860c9e915f',
            symbol: 'MKD',
            name: 'Macedonian Denar',
            symbol_native: 'MKD',
            decimal_digits: 2,
            rounding: 0,
            code: 'MKD',
            name_plural: 'Macedonian denari'
          } ,
          {
            id: '565dccf6-fdcf-4540-9bd6-1e866c1ae168',
            symbol: 'MMK',
            name: 'Myanma Kyat',
            symbol_native: 'K',
            decimal_digits: 0,
            rounding: 0,
            code: 'MMK',
            name_plural: 'Myanma kyats'
          } ,
          {
            id: '632b73e6-9527-4030-9f82-44ea0514cc63',
            symbol: 'MOP$',
            name: 'Macanese Pataca',
            symbol_native: 'MOP$',
            decimal_digits: 2,
            rounding: 0,
            code: 'MOP',
            name_plural: 'Macanese patacas'
          } ,
          {
            id: '0317db74-e346-44a1-a663-167c0c8773f6',
            symbol: 'MURs',
            name: 'Mauritian Rupee',
            symbol_native: 'MURs',
            decimal_digits: 0,
            rounding: 0,
            code: 'MUR',
            name_plural: 'Mauritian rupees'
          } ,
          {
            id: '5c617635-efdd-468e-a58c-f8141f317fc6',
            symbol: 'MX$',
            name: 'Mexican Peso',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'MXN',
            name_plural: 'Mexican pesos'
          } ,
          {
            id: '281a7343-9130-46f6-a4eb-71476c1b4d81',
            symbol: 'RM',
            name: 'Malaysian Ringgit',
            symbol_native: 'RM',
            decimal_digits: 2,
            rounding: 0,
            code: 'MYR',
            name_plural: 'Malaysian ringgits'
          } ,
          {
            id: '13d56b0e-cfb9-46ea-a72a-235f6c442ed9',
            symbol: 'MTn',
            name: 'Mozambican Metical',
            symbol_native: 'MTn',
            decimal_digits: 2,
            rounding: 0,
            code: 'MZN',
            name_plural: 'Mozambican meticals'
          } ,
          {
            id: '09a6c095-0f22-41f1-8bb0-581f43081e1d',
            symbol: 'N$',
            name: 'Namibian Dollar',
            symbol_native: 'N$',
            decimal_digits: 2,
            rounding: 0,
            code: 'NAD',
            name_plural: 'Namibian dollars'
          } ,
          {
            id: '904d5251-04b6-40a0-a49c-00f5c9500d83',
            symbol: '₦',
            name: 'Nigerian Naira',
            symbol_native: '₦',
            decimal_digits: 2,
            rounding: 0,
            code: 'NGN',
            name_plural: 'Nigerian nairas'
          } ,
          {
            id: 'b64aec51-4350-49a6-ac90-ac3f800fe542',
            symbol: 'C$',
            name: 'Nicaraguan Córdoba',
            symbol_native: 'C$',
            decimal_digits: 2,
            rounding: 0,
            code: 'NIO',
            name_plural: 'Nicaraguan córdobas'
          } ,
          {
            id: '9e090ae4-8d6d-4b3e-815f-bcbcca0c016d',
            symbol: 'Nkr',
            name: 'Norwegian Krone',
            symbol_native: 'kr',
            decimal_digits: 2,
            rounding: 0,
            code: 'NOK',
            name_plural: 'Norwegian kroner'
          } ,
          {
            id: 'adf4c5df-07ea-4344-a196-d3db629de8b3',
            symbol: 'NPRs',
            name: 'Nepalese Rupee',
            symbol_native: 'नेरू',
            decimal_digits: 2,
            rounding: 0,
            code: 'NPR',
            name_plural: 'Nepalese rupees'
          } ,
          {
            id: '917abf68-c1ff-4c91-87c7-f61aba275148',
            symbol: 'NZ$',
            name: 'New Zealand Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'NZD',
            name_plural: 'New Zealand dollars'
          } ,
          {
            id: '18a05cad-eece-48d3-8d50-8e9d2361aab1',
            symbol: 'OMR',
            name: 'Omani Rial',
            symbol_native: 'ر.ع.‏',
            decimal_digits: 3,
            rounding: 0,
            code: 'OMR',
            name_plural: 'Omani rials'
          } ,
          {
            id: '13b2d640-6824-4922-9de7-f6f4c5dcac41',
            symbol: 'B/.',
            name: 'Panamanian Balboa',
            symbol_native: 'B/.',
            decimal_digits: 2,
            rounding: 0,
            code: 'PAB',
            name_plural: 'Panamanian balboas'
          } ,
          {
            id: '0fc08628-ea8e-4db5-be3d-19533565938a',
            symbol: 'S/.',
            name: 'Peruvian Nuevo Sol',
            symbol_native: 'S/.',
            decimal_digits: 2,
            rounding: 0,
            code: 'PEN',
            name_plural: 'Peruvian nuevos soles'
          } ,
          {
            id: 'dd89cbe3-1b31-4935-a11c-6653264d1771',
            symbol: '₱',
            name: 'Philippine Peso',
            symbol_native: '₱',
            decimal_digits: 2,
            rounding: 0,
            code: 'PHP',
            name_plural: 'Philippine pesos'
          } ,
          {
            id: '7855fc8e-6fd6-4418-aea4-654d58424282',
            symbol: 'PKRs',
            name: 'Pakistani Rupee',
            symbol_native: '₨',
            decimal_digits: 0,
            rounding: 0,
            code: 'PKR',
            name_plural: 'Pakistani rupees'
          } ,
          {
            id: 'a22f4a75-aa57-4bb5-98b4-6c7bed509acd',
            symbol: 'zł',
            name: 'Polish Zloty',
            symbol_native: 'zł',
            decimal_digits: 2,
            rounding: 0,
            code: 'PLN',
            name_plural: 'Polish zlotys'
          } ,
          {
            id: '03645196-f12f-4f3f-ae68-24f951390040',
            symbol: '₲',
            name: 'Paraguayan Guarani',
            symbol_native: '₲',
            decimal_digits: 0,
            rounding: 0,
            code: 'PYG',
            name_plural: 'Paraguayan guaranis'
          } ,
          {
            id: '5494d84b-d705-4d06-9220-e9b64a19c1ea',
            symbol: 'QR',
            name: 'Qatari Rial',
            symbol_native: 'ر.ق.‏',
            decimal_digits: 2,
            rounding: 0,
            code: 'QAR',
            name_plural: 'Qatari rials'
          } ,
          {
            id: '5566079b-243f-4d85-90ff-2551c2a083db',
            symbol: 'RON',
            name: 'Romanian Leu',
            symbol_native: 'RON',
            decimal_digits: 2,
            rounding: 0,
            code: 'RON',
            name_plural: 'Romanian lei'
          } ,
          {
            id: '19e8f2dd-d562-4317-8d69-da77fab3178d',
            symbol: 'din.',
            name: 'Serbian Dinar',
            symbol_native: 'дин.',
            decimal_digits: 0,
            rounding: 0,
            code: 'RSD',
            name_plural: 'Serbian dinars'
          } ,
          {
            id: '536bc7cc-d299-4efb-9796-1045051d64c8',
            symbol: 'RUB',
            name: 'Russian Ruble',
            symbol_native: '₽.',
            decimal_digits: 2,
            rounding: 0,
            code: 'RUB',
            name_plural: 'Russian rubles'
          } ,
          {
            id: '665202e1-37ee-4801-bb45-2447f4918a06',
            symbol: 'RWF',
            name: 'Rwandan Franc',
            symbol_native: 'FR',
            decimal_digits: 0,
            rounding: 0,
            code: 'RWF',
            name_plural: 'Rwandan francs'
          } ,
          {
            id: '02ab61aa-4ef0-4899-9017-ed65e0d55e7d',
            symbol: 'SR',
            name: 'Saudi Riyal',
            symbol_native: 'ر.س.‏',
            decimal_digits: 2,
            rounding: 0,
            code: 'SAR',
            name_plural: 'Saudi riyals'
          } ,
          {
            id: '42faae00-f199-44c3-ba22-b9ff1cf3eef9',
            symbol: 'SDG',
            name: 'Sudanese Pound',
            symbol_native: 'SDG',
            decimal_digits: 2,
            rounding: 0,
            code: 'SDG',
            name_plural: 'Sudanese pounds'
          } ,
          {
            id: 'd892b67f-6ce1-45cc-8056-72a63c2bab60',
            symbol: 'Skr',
            name: 'Swedish Krona',
            symbol_native: 'kr',
            decimal_digits: 2,
            rounding: 0,
            code: 'SEK',
            name_plural: 'Swedish kronor'
          } ,
          {
            id: 'f0c98f13-d218-45e3-b495-39b2fd53f700',
            symbol: 'S$',
            name: 'Singapore Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'SGD',
            name_plural: 'Singapore dollars'
          } ,
          {
            id: '2d91dd19-895c-453f-a1ac-7c30c4234b50',
            symbol: 'Ssh',
            name: 'Somali Shilling',
            symbol_native: 'Ssh',
            decimal_digits: 0,
            rounding: 0,
            code: 'SOS',
            name_plural: 'Somali shillings'
          } ,
          {
            id: '768e3f6d-a31d-4176-8e46-ca4fc0901e84',
            symbol: 'SY£',
            name: 'Syrian Pound',
            symbol_native: 'ل.س.‏',
            decimal_digits: 0,
            rounding: 0,
            code: 'SYP',
            name_plural: 'Syrian pounds'
          } ,
          {
            id: '92eed319-cf12-47db-be7f-d1f12d6d093c',
            symbol: '฿',
            name: 'Thai Baht',
            symbol_native: '฿',
            decimal_digits: 2,
            rounding: 0,
            code: 'THB',
            name_plural: 'Thai baht'
          } ,
          {
            id: '230faddd-5e0f-4ddc-908f-b24bcae3767c',
            symbol: 'DT',
            name: 'Tunisian Dinar',
            symbol_native: 'د.ت.‏',
            decimal_digits: 3,
            rounding: 0,
            code: 'TND',
            name_plural: 'Tunisian dinars'
          } ,
          {
            id: '63a2c3ea-0581-4fe6-95e5-1e0c7515daa1',
            symbol: 'T$',
            name: 'Tongan Paʻanga',
            symbol_native: 'T$',
            decimal_digits: 2,
            rounding: 0,
            code: 'TOP',
            name_plural: 'Tongan paʻanga'
          } ,
          {
            id: 'eefc69c5-30e4-4170-8741-367120e9503b',
            symbol: 'TL',
            name: 'Turkish Lira',
            symbol_native: 'TL',
            decimal_digits: 2,
            rounding: 0,
            code: 'TRY',
            name_plural: 'Turkish Lira'
          } ,
          {
            id: '8916561f-bf6e-428e-a2a0-8f2a49c1383c',
            symbol: 'TT$',
            name: 'Trinidad and Tobago Dollar',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'TTD',
            name_plural: 'Trinidad and Tobago dollars'
          } ,
          {
            id: 'd9db4c61-d5c8-4ae9-b133-8d9425c35bff',
            symbol: 'NT$',
            name: 'New Taiwan Dollar',
            symbol_native: 'NT$',
            decimal_digits: 2,
            rounding: 0,
            code: 'TWD',
            name_plural: 'New Taiwan dollars'
          } ,
          {
            id: '289f356c-d14c-4f6d-90b9-0f950fd3df63',
            symbol: 'TSh',
            name: 'Tanzanian Shilling',
            symbol_native: 'TSh',
            decimal_digits: 0,
            rounding: 0,
            code: 'TZS',
            name_plural: 'Tanzanian shillings'
          } ,
          {
            id: '239e13f1-3d93-4052-89e7-75570df756e8',
            symbol: '₴',
            name: 'Ukrainian Hryvnia',
            symbol_native: '₴',
            decimal_digits: 2,
            rounding: 0,
            code: 'UAH',
            name_plural: 'Ukrainian hryvnias'
          } ,
          {
            id: 'a934f95a-2284-4e56-83bf-8395651b04a3',
            symbol: 'USh',
            name: 'Ugandan Shilling',
            symbol_native: 'USh',
            decimal_digits: 0,
            rounding: 0,
            code: 'UGX',
            name_plural: 'Ugandan shillings'
          } ,
          {
            id: 'b0702f7e-b308-46c6-b8d5-d78253d910d2',
            symbol: '$U',
            name: 'Uruguayan Peso',
            symbol_native: '$',
            decimal_digits: 2,
            rounding: 0,
            code: 'UYU',
            name_plural: 'Uruguayan pesos'
          } ,
          {
            id: '0803582e-29d6-42fe-86ac-b4287b8fa929',
            symbol: 'UZS',
            name: 'Uzbekistan Som',
            symbol_native: 'UZS',
            decimal_digits: 0,
            rounding: 0,
            code: 'UZS',
            name_plural: 'Uzbekistan som'
          } ,
          {
            id: '2e8ed2b1-8313-4fe5-b69a-a03e3cd50b66',
            symbol: 'Bs.F.',
            name: 'Venezuelan Bolívar',
            symbol_native: 'Bs.F.',
            decimal_digits: 2,
            rounding: 0,
            code: 'VEF',
            name_plural: 'Venezuelan bolívars'
          } ,
          {
            id: '29b17d8e-c582-4d1d-935c-f3bd6cc4e4b2',
            symbol: '₫',
            name: 'Vietnamese Dong',
            symbol_native: '₫',
            decimal_digits: 0,
            rounding: 0,
            code: 'VND',
            name_plural: 'Vietnamese dong'
          } ,
          {
            id: '0f58d24e-622c-4168-b907-dff115d91214',
            symbol: 'FCFA',
            name: 'CFA Franc BEAC',
            symbol_native: 'FCFA',
            decimal_digits: 0,
            rounding: 0,
            code: 'XAF',
            name_plural: 'CFA francs BEAC'
          } ,
          {
            id: 'fb81243c-7f2b-492c-b518-6c65bb659017',
            symbol: 'CFA',
            name: 'CFA Franc BCEAO',
            symbol_native: 'CFA',
            decimal_digits: 0,
            rounding: 0,
            code: 'XOF',
            name_plural: 'CFA francs BCEAO'
          } ,
          {
            id: '5a922ca8-9e15-4456-a65e-896b08746496',
            symbol: 'YR',
            name: 'Yemeni Rial',
            symbol_native: 'ر.ي.‏',
            decimal_digits: 0,
            rounding: 0,
            code: 'YER',
            name_plural: 'Yemeni rials'
          } ,
          {
            id: 'eac9ca42-c47e-48a1-90dd-96cccf8b8c16',
            symbol: 'R',
            name: 'South African Rand',
            symbol_native: 'R',
            decimal_digits: 2,
            rounding: 0,
            code: 'ZAR',
            name_plural: 'South African rand'
          } ,
          {
            id: 'c85d1f87-d88f-4bb0-8616-783992c821f3',
            symbol: 'ZK',
            name: 'Zambian Kwacha',
            symbol_native: 'ZK',
            decimal_digits: 0,
            rounding: 0,
            code: 'ZMK',
            name_plural: 'Zambian kwachas'
          } ,
          {
            id: 'd909643a-24d9-4f0e-a51a-95b2fefa45b6',
            symbol: 'ZWL$',
            name: 'Zimbabwean Dollar',
            symbol_native: 'ZWL$',
            decimal_digits: 0,
            rounding: 0,
            code: 'ZWL',
            name_plural: 'Zimbabwean Dollar'
          } ,
          
    ]

      return currencies
}

module.exports = createSettingCurrency;