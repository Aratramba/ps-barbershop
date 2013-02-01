Barbershop = require('../coffee/barbershop')


describe "Barbershop", ->

	beforeEach ->

		@jsonData = """
				{
					layer: 'layer1',
					layergroup: {
						layer: 'layer2',
						layergroup: {
							layer: 'layer3'
						}
					}
				}
			"""

		@jsonTemplate = [
				"{{ layer }}"
				"{{ layergroup.layer }}"
				"{{ layergroup.layergroup.layer }}"
			]


		@csvData = """
			name;textfield
			Barbershop;"some text"
			"""


		@csvTemplate = [
				"{{ name }}"
				"{{ textfield }}"
			]



	it "must be functioning", ->
		expect(true).toBe(true)


	it "must do json", ->
		expect(true).toBe(true)




#########################
# TEST CASES
#########################
###
data = """
	{
		layer: 'layer1',
		layergroup: {
			layer: 'layer2',
			layergroup: {
				layer: 'layer3'
			}
		}
	}
"""

input = 
	type: 'json'
	duplicate: true
	csv_separator: ';'
	string_delimiter: '\"'
	data: data

	template: [
		"{{ layer }}"
		"{{ layergroup.layer }}"
		"{{ layergroup.layergroup.layer }}"
	]

console.log '––––––––––––––––––––––––––––––––––––'
new Barbershop(input)


console.log '––––––––––––––––––––––––––––––––––––'
input.data = "[#{data}]"
new Barbershop(input)


console.log '––––––––––––––––––––––––––––––––––––'
input.data = "[#{data},#{data},#{data}]"
new Barbershop(input)


console.log '––––––––––––––––––––––––––––––––––––'
input.data = """
	name;textfield
	Barbershop;"some text"
	"""
	
input.template = [
	"{{ name }}"
	"{{ textfield }}"
]
input.type = 'csv'
new Barbershop(input)


console.log '––––––––––––––––––––––––––––––––––––'
input.data = """
	name;textfield
	Barbershop;"some text"
	"Barbershop II";"some text II"
	"""
input.type = 'csv'
new Barbershop(input)
###

