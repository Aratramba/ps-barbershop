Barbershop = require('../coffee/barbershop')


describe "Barbershop csv", ->

	beforeEach ->

		@data = """
		name;textfield
		Barbershop;"some text"
		"""

		@template = [
			"{{ name }}"
			"{{ textfield }}"
		]



	#––––––––––––––––––––––––––––––––––––
	# single row
	#––––––––––––––––––––––––––––––––––––

	it "must handle a single row", ->

		input = 
			type: 'csv'
			csv_separator: ';'
			string_delimiter: '\"'
			data: @data
			template: @template
		
		b = new Barbershop(input)
		expect(b).toEqual([['Barbershop', 'some text']])



	#––––––––––––––––––––––––––––––––––––
	# multiple rows
	#––––––––––––––––––––––––––––––––––––

	it "must handle multiple rows", ->

		input = 
			type: 'csv'
			csv_separator: ';'
			string_delimiter: '\"'
			data: """
			name;textfield
			Barbershop;"some text"
			"Barbershop II";"some text II"
			"""
			template: @template
		
		b = new Barbershop(input)
		expect(b).toEqual([['Barbershop', 'some text' ], [ 'Barbershop II', 'some text II']])



	#––––––––––––––––––––––––––––––––––––
	# comma separator
	#––––––––––––––––––––––––––––––––––––

	it "must handle a comma separator", ->

		input = 
			type: 'csv'
			csv_separator: ','
			string_delimiter: '\"'
			data: """
			name,textfield
			Barbershop,"some text"
			"""
			template: @template
		
		b = new Barbershop(input)
		expect(b).toEqual([['Barbershop', 'some text']])



	#––––––––––––––––––––––––––––––––––––
	# apostrophe string delimiter
	#––––––––––––––––––––––––––––––––––––

	it "must handle an apostrophe as string delimiter", ->

		input = 
			type: 'csv'
			csv_separator: ';'
			string_delimiter: "\'"
			data: """
			name;textfield
			Barbershop;'some text'
			"""
			template: @template
		
		b = new Barbershop(input)
		expect(b).toEqual([['Barbershop', 'some text']])
