settings = {
	type: 'json',
	csv_separator: ';',
	duplicate: true,
	samples:{
		csv: """
			name;textfield
			Barbershop;"some text"
			"Barbershop II";"some text II"
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