settings = {
	type: 'json',
	csv_separator: ';',
	duplicate: false,
	samples:{
		csv: """
			name;textfield
			Arjen;"some text"
			""",
		json: """
			{
				"name": {
					"firstname": "Arjen",
					"lastname": "Scherff-de Water"
				},
				"textfield": "some text"
			}
			"""
	}
}