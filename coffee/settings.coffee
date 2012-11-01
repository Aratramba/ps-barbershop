settings = {
	type: 'json',
	csv_separator: ';',
	duplicate: true,
	samples:{
		csv: """
			name;textfield
			Barbershop;"some text"
			""",
		json: """
			{
				"name": {
					"firstname": "Barber",
					"lastname": "Shop"
				},
				"textfield": "some text"
			}
			"""
	}
}