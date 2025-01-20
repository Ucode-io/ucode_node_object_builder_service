async function personFields() {
    let fields = [{
		"required": 	false,
		"slug": 		"guid",
		"label": 		"ID",
		"default": 		"v4",
		"type": 		"UUID",
		"index": 		"true",
		"is_visible": 	true,
		"unique": 		true,
		"is_system": 	true,
		"id": 			"fb852fe5-0255-4d2e-8ceb-bf331ae55fb2",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"created_at": 	new Date(),
		"updated_at": 	new Date(),
		"__v": 			0
	}, {
		"id": 			"f54d8076-4972-4067-9a91-c178c02c4273",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"required": 	false,
		"slug": 		"full_name",
		"label": 		"Full Name",
		"default": 		"",
		"type": 		"SINGLE_LINE",
		"index": 		"string",
		"attributes": {
		  "fields": {
			"label_en": 		{ "stringValue": "Full Name", "kind": "stringValue" },
			"number_of_rounds": { "nullValue": "NULL_VALUE", "kind": "nullValue" },
			"defaultValue": 	{ "stringValue": "", "kind": "stringValue" },
			"label": 			{ "stringValue": "", "kind": "stringValue" }
		  }
		},
		"is_visible": 			false,
		"autofill_field": 		"",
		"autofill_table": 		"",
		"automatic": 			false,
		"commit_id": 			"",
		"relation_field": 		"",
		"is_system": 			true,
		"show_label": 			true,
		"enable_multilanguage": false,
		"hide_multilanguage": 	false,
		"created_at": 			new Date(),
		"updated_at": 			new Date(),
		"__v": 					0
	}, {
		"id": 			"d868638d-35d6-4992-8216-7b2f479f722e",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"required": 	false,
		"slug": 		"email",
		"label": 		"Email",
		"default": 		"",
		"type": 		"EMAIL",
		"index": 		"string",
		"attributes": {
		  "fields": {
			"label_en": 		{ "stringValue": "Email", "kind": "stringValue" },
			"number_of_rounds": { "nullValue": "NULL_VALUE", "kind": "nullValue" },
			"defaultValue": 	{ "stringValue": "", "kind": "stringValue" },
			"label": 			{ "stringValue": "", "kind": "stringValue" }
		  }
		},
		"is_visible": 			false,
		"autofill_field": 		"",
		"autofill_table": 		"",
		"is_system": 			true,
		"enable_multilanguage": false,
		"hide_multilanguage": 	false,
		"created_at": 			new Date(),
		"updated_at": 			new Date(),
		"__v": 					0
	}, {
		"id": 			"eb3deeb7-6d34-4e24-b65a-f03e09efd0cf",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"required": 	false,
		"slug": 		"phone_number",
		"label": 		"Phone Number",
		"default": 		"",
		"type": 		"INTERNATION_PHONE",
		"index": 		"string",
		"attributes": {
		  "fields": {
			"label_en": 		{ "stringValue": "Phone Number", "kind": "stringValue" },
			"number_of_rounds": { "nullValue": "NULL_VALUE", "kind": "nullValue" },
			"defaultValue": 	{ "stringValue": "", "kind": "stringValue" },
			"label": 			{ "stringValue": "", "kind": "stringValue" }
		  }
		},
		"is_visible": 			false,
		"autofill_field": 		"",
		"autofill_table": 		"",
		"automatic": 			false,
		"relation_field": 		"",
		"is_system": 			true,
		"enable_multilanguage": false,
		"hide_multilanguage": 	false,
		"minio_folder": 		"",
		"created_at": 			new Date(),
		"updated_at": 			new Date(),
		"__v": 					0
	}, {
		"id": 			"b92b9b8c-c138-4ce6-9260-b4452a7f5ae2",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"required": 	false,
		"slug": 		"gender",
		"label": 		"Gender",
		"default": 		"",
		"type": 		"MULTISELECT",
		"index": 		"string",
		"attributes": {
		  "fields": {
			"is_multiselect": 	{ "boolValue": false, "kind": "boolValue" },
			"label": 			{ "stringValue": "", "kind": "stringValue" },
			"label_en": 		{ "stringValue": "Gender", "kind": "stringValue" },
			"number_of_rounds": { "nullValue": "NULL_VALUE", "kind": "nullValue" },
			"options": {
			  "listValue": {
				"values": [
				  {
					"structValue": {
					  "fields": {
						"value": 	{ "stringValue": "male", "kind": "stringValue" },
						"color": 	{ "stringValue": "", "kind": "stringValue" },
						"icon": 	{ "stringValue": "", "kind": "stringValue" },
						"id": 		{ "stringValue": "m5nhqhnwx94lr5tvlf", "kind": "stringValue" },
						"label": 	{ "stringValue": "Male", "kind": "stringValue" }
					  }
					},
					"kind": "structValue"
				  },
				  {
					"structValue": {
					  "fields": {
						"color": 	{ "stringValue": "", "kind": "stringValue" },
						"icon": 	{ "stringValue": "", "kind": "stringValue" },
						"id": 		{ "stringValue": "m5nhqlmt8ivnl7ijvr", "kind": "stringValue" },
						"label": 	{ "stringValue": "Female", "kind": "stringValue" },
						"value": 	{ "stringValue": "female", "kind": "stringValue" }
					  }
					},
					"kind": "structValue"
				  },
				  {
					"structValue": {
					  "fields": {
						"color": 	{ "stringValue": "", "kind": "stringValue" },
						"icon": 	{ "stringValue": "", "kind": "stringValue" },
						"id": 		{ "stringValue": "m5nibeydyfhz3y2lfk", "kind": "stringValue" },
						"label": 	{ "stringValue": "Other", "kind": "stringValue" },
						"value": 	{ "stringValue": "other", "kind": "stringValue" }
					  }
					},
					"kind": "structValue"
				  }
				]
			  },
			  "kind": "listValue"
			},
			"defaultValue": { "stringValue": "", "kind": "stringValue" },
			"has_color": 	{ "boolValue": false, "kind": "boolValue" }
		  }
		},
		"is_visible": 			false,
		"autofill_field": 		"",
		"autofill_table": 		"",
		"unique": 				false,
		"automatic": 			false,
		"relation_field": 		"",
		"is_system": 			true,
		"enable_multilanguage": false,
		"hide_multilanguage": 	false,
		"minio_folder": 		"",
		"created_at": 			new Date(),
		"updated_at": 			new Date(),
		"__v": 					0
	}, {
		"id": 			"c5b09b80-528d-4987-9105-a2be539255ee",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"required": 	false,
		"slug": 		"image",
		"label": 		"Image",
		"default": 		"",
		"type": 		"PHOTO",
		"index": 		"string",
		"attributes": {
		  "fields": {
			"defaultValue": 	{ "stringValue": "", "kind": "stringValue" },
			"label": 			{ "stringValue": "", "kind": "stringValue" },
			"label_en": 		{ "stringValue": "Image", "kind": "stringValue" },
			"number_of_rounds": { "nullValue": "NULL_VALUE", "kind": "nullValue" },
			"path": 			{ "stringValue": "Media", "kind": "stringValue" }
		  }
		},
		"is_visible": 			false,
		"autofill_field": 		"",
		"autofill_table": 		"",
		"unique": 				false,
		"automatic": 			false,
		"relation_field": 		"",
		"is_system": 			true,
		"enable_multilanguage": false,
		"hide_multilanguage": 	false,
		"is_search": 			true,
		"created_at": 			new Date(),
		"updated_at": 			new Date(),
		"__v": 					0
	}, {
		"id": 			"e5a2a21e-a9e2-4e6d-87e8-57b8dd837d48",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"required": 	false,
		"slug": 		"date_of_birth",
		"label": 		"Date Of Birth",
		"default": 		"",
		"type": 		"DATE",
		"index": 		"string",
		"attributes": {
		  "fields": {
			"defaultValue": 	{ "stringValue": "", "kind": "stringValue" },
			"label": 			{ "stringValue": "", "kind": "stringValue" },
			"label_en": 		{ "stringValue": "Date of birth", "kind": "stringValue" },
			"number_of_rounds": { "nullValue": "NULL_VALUE", "kind": "nullValue" }
		  }
		},
		"is_visible": 			false,
		"autofill_field": 		"",
		"autofill_table": 		"",
		"automatic": 			false,
		"relation_field": 		"",
		"is_system": 			true,
		"enable_multilanguage": false,
		"hide_multilanguage": 	false,
		"minio_folder": 		"",
		"created_at": 			new Date(),
		"updated_at": 			new Date(),
		"__v": 					0,
	}, {
		"id": 			"4f7ade49-da8a-4534-b3a4-35f2875609b1",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"required": 	false,
		"slug": 		"login",
		"label": 		"Login",
		"default": 		"",
		"type": 		"SINGLE_LINE",
		"index": 		"string",
		"attributes": {
		  "fields": {
			"label": 			{ "stringValue": "", "kind": "stringValue" },
			"label_en": 		{ "stringValue": "Login", "kind": "stringValue" },
			"number_of_rounds": { "nullValue": "NULL_VALUE", "kind": "nullValue" }
		  }
		},
		"is_visible": 			false,
		"autofill_field": 		"",
		"autofill_table": 		"",
		"unique": 				false,
		"automatic": 			false,
		"commit_id": 			"",
		"relation_field": 		"",
		"show_label": 			true,
		"enable_multilanguage": false,
		"hide_multilanguage": 	false,
		"minio_folder": 		"",
		"is_search": 			true,
		"created_at": 			new Date(),
		"updated_at": 			new Date(),
		"__v": 					0,
		"is_system": 			true,
	}, {
		"id": 			"88ef053a-ae80-44a0-aad1-055f4405a3ee",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"required": 	false,
		"slug": 		"password",
		"label": 		"Password",
		"default": 		"",
		"type": 		"PASSWORD",
		"index": 		"string",
		"attributes": {
		  "fields": {
			"label": 			{ "stringValue": "", "kind": "stringValue" },
			"label_en": 		{ "stringValue": "Password", "kind": "stringValue" },
			"number_of_rounds": { "nullValue": "NULL_VALUE", "kind": "nullValue" }
		  }
		},
		"is_visible": 			false,
		"autofill_field": 		"",
		"autofill_table": 		"",
		"unique": 				false,
		"automatic": 			false,
		"commit_id": 			"",
		"relation_field": 		"",
		"is_system": 			true,
		"show_label": 			true,
		"enable_multilanguage": false,
		"hide_multilanguage": 	false,
		"minio_folder": 		"",
		"is_search": 			true,
		"created_at": 			new Date(),
		"updated_at": 			new Date(),
		"__v": 					0
	}, {
		"id": 			"4342bf9d-24ad-4f74-bb7e-156d3b4e1dfd",
		"table_id": 	"c1669d87-332c-41ee-84ac-9fb2ac9efdd5",
		"required": 	false,
		"slug": 		"user_id_auth",
		"label": 		"User ID Auth",
		"default": 		"",
		"type": 		"SINGLE_LINE",
		"index": 		"string",
		"attributes": {
		  "fields": {
			"label_en": 	{ "stringValue": "User Id Auth", "kind": "stringValue" },
			"label": 		{ "stringValue": "", "kind": "stringValue" },
			"defaultValue": { "stringValue": "", "kind": "stringValue" }
		  }
		},
		"is_visible": 			false,
		"autofill_field": 		"",
		"autofill_table": 		"",
		"is_system": 			true,
		"show_label": 			true,
		"enable_multilanguage": false,
		"hide_multilanguage": 	false,
		"is_search": 			true,
		"created_at": 			new Date(),
		"updated_at": 			new Date(),
		"__v": 					0
	}]

    return fields
}

module.exports = personFields;