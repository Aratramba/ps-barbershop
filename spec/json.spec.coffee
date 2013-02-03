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



	#––––––––––––––––––––––––––––––––––––
	# execute function
	#––––––––––––––––––––––––––––––––––––

	it "must execute functions", ->

		input = 
			type: 'json'
			data: """
			{
				fn: function(){
					return 'barbershop';
				}
			}
			"""
			template: ["{{ fn }}"]
		
		b = new Barbershop(input)
		expect(b).toEqual([['barbershop']])



	#––––––––––––––––––––––––––––––––––––
	# execute nested function
	#––––––––––––––––––––––––––––––––––––

	it "must execute nested functions", ->

		input = 
			type: 'json'
			data: """
			{
				foo: {
					fn: function(){
						return 'barbershop';
					}
				}
			}
			"""
			template: ["{{ foo.fn }}"]
		
		b = new Barbershop(input)
		expect(b).toEqual([['barbershop']])


	#––––––––––––––––––––––––––––––––––––
	# execute function reference
	#––––––––––––––––––––––––––––––––––––

	it "must execute referenced function", ->

		input = 
			type: 'json'
			data: """
			{
				fn: function(){
					return 'barbershop';
				},
				ref: "fn()"
			}
			"""
			template: ["{{ ref }}"]
		
		b = new Barbershop(input)
		expect(b).toEqual([['barbershop']])



	#––––––––––––––––––––––––––––––––––––
	# execute nested function reference
	#––––––––––––––––––––––––––––––––––––

	it "must execute nested function reference", ->

		input = 
			type: 'json'
			data: """
			{
				fn: function(){
					return 'barbershop';
				},
				tag: {
					ref: "fn()"
				}
			}
			"""
			template: ["{{ tag.ref }}"]
		
		b = new Barbershop(input)
		expect(b).toEqual([['barbershop']])



	#––––––––––––––––––––––––––––––––––––
	# execute nested function call
	#––––––––––––––––––––––––––––––––––––

	it "must execute nested function call", ->

		input = 
			type: 'json'
			data: """
			{
				nested: {
					fn: function(){
						return 'barbershop';
					}
				},
				tag: {
					ref: "nested.fn()"
				}
			}
			"""
			template: ["{{ tag.ref }}"]
		
		b = new Barbershop(input)
		expect(b).toEqual([['barbershop']])