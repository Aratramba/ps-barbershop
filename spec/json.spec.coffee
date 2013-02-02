Barbershop = require('../coffee/barbershop')


describe "Barbershop json", ->

	beforeEach ->

		@data = """
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

		@template = [
			"{{ layer }}"
			"{{ layergroup.layer }}"
			"{{ layergroup.layergroup.layer }}"
		]



	#––––––––––––––––––––––––––––––––––––
	# single object
	#––––––––––––––––––––––––––––––––––––

	it "must handle a single object", ->

		input = 
			type: 'json'
			data: @data
			template: @template
		
		b = new Barbershop(input)
		expect(b).toEqual([['layer1', 'layer2', 'layer3']])



	#––––––––––––––––––––––––––––––––––––
	# array with single object
	#––––––––––––––––––––––––––––––––––––

	it "must handle an array with a single object", ->

		input = 
			type: 'json'
			data: "[#{@data}]"
			template: @template
		
		b = new Barbershop(input)
		expect(b).toEqual([['layer1', 'layer2', 'layer3']])



	#––––––––––––––––––––––––––––––––––––
	# array with multiple objects
	#––––––––––––––––––––––––––––––––––––

	it "must handle an array with multiple objects", ->

		input = 
			type: 'json'
			data: "[#{@data}, #{@data}, #{@data}]"
			template: @template
		
		b = new Barbershop(input)
		expect(b).toEqual([['layer1', 'layer2', 'layer3'],['layer1', 'layer2', 'layer3'],['layer1', 'layer2', 'layer3']])
