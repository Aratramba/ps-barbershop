{ arrayToObject, csv2array } = require('./utils')


# Basic Barbershop
module.exports = class Barbershop

	#––––––––––––––––––––––––––––––––––––
	# constructor
	#––––––––––––––––––––––––––––––––––––

	constructor: (@input) -> 

		@MUSTACHE_REGEX = /\{\{([^}]+)\}\}/gi

		# prepare output
		@output = []

		# get template
		@template = @getTemplate()

		# cleanup input
		dataRows = @import()

		# check if data is valid
		if dataRows and typeof dataRows.length

			# setup document for every row found
			@prepare(row) for row in dataRows 

		# data was not parsed
		else
			@alert('There was an error parsing the input')

		return @output



	#––––––––––––––––––––––––––––––––––––
	# import data
	#––––––––––––––––––––––––––––––––––––

	import: ->

		# parse json
		return @json(@input) if @input.type is 'json'

		# parse csv
		return @csv(@input) if @input.type is 'csv'



	#––––––––––––––––––––––––––––––––––––
	# convert input to json
	#––––––––––––––––––––––––––––––––––––

	json: (input) ->

		# js evaluate input
		try
			parsed = eval("(#{input.data})")

		# not evalable
		catch err
			@alert('error while evaluating input')
			return

		# if it's an array
		if parsed.length

			# no rows, useless, go away
			return if parsed.length is 0

			# return parsed rows in an array
			return parsed
				
		# return object wrapped in array for convenience
		return [parsed]



	#––––––––––––––––––––––––––––––––––––
	# convert input to csv
	#––––––––––––––––––––––––––––––––––––

	csv: (input) -> 

		# create an array from csv
		original = csv2array(@input.data, @input.csv_separator, @input.string_delimiter)

		# if it's not an array, it's useless
		return if not original

		# if it's just 1 row, useless
		return if original.length is 1

		# create new array
		dataRows = []

		# find header and remove from original array
		header = original.shift()

		# loop
		for row,counter in original

			# create object: create keys from header, values from row
			obj = arrayToObject([header, row])

			# add row
			dataRows.push(obj)

		return dataRows




	#––––––––––––––––––––––––––––––––––––
	# prepare document
	#––––––––––––––––––––––––––––––––––––

	prepare: (dataRow) -> 

		# json
		@data = dataRow

		# render
		@render()



	#––––––––––––––––––––––––––––––––––––
	# recursively find all textlayers
	#––––––––––––––––––––––––––––––––––––

	collect: (layers) ->

		layers = @template if not layers?

		# loop
		for layer in layers

			# push text layers
			if Array.isArray(layer)
				@collect(layer)

			# find text layers in layergroup
			else

				# check if it is barbershoppable, if so: add
				@textlayers.push(layer) if layer.match(@MUSTACHE_REGEX)
					



	#––––––––––––––––––––––––––––––––––––
	# render
	#––––––––––––––––––––––––––––––––––––

	render: -> 

		# contain all textlayers
		@textlayers = []

		# collect textlayers
		@collect()

		# start shaving
		@shave()



	#––––––––––––––––––––––––––––––––––––
	# start cutting
	#––––––––––––––––––––––––––––––––––––

	shave: ->

		# loop through layers
		for layer,counter in @textlayers

			# remove {{ }} and replace with json value
			contents = layer.replace @MUSTACHE_REGEX, @trim

			# replace content only if something has changed
			@textlayers[counter] = contents if contents isnt layer

		@end()



	#––––––––––––––––––––––––––––––––––––
	# trim a textlayer
	#––––––––––––––––––––––––––––––––––––

	trim: (original, text) =>

		# remove spaces
		tag = text.replace(/\s+/gi, '')

		#–––
		# resolve object notation
		# –––

		# find keys
		keys = tag.split('.')

		# reference object
		ref = @data

		# loop through keys
		for key in keys

			# stop loop if no key was found
			break if not ref[key]

			# set new reference if a key was found
			ref = ref[key]

		# if a string was found
		if typeof ref is 'string'

			#–––
			# functions
			# –––

			# if it finds () at the end of the string, it's a function reference
			# "func()", "func(1,2)", "func(barber,shop)"
			if /\(.*?\)$/.test(ref)

				# if no dot was found: "func()"
				# note: this won't work for "func('1.1, 1.2')"
				if ref.indexOf('.') is -1

					# remove () from end of string and find referenced function
					fn = @data[ref.replace(/\(.*?\)$/, '')]

				# if a dot was found
				else

					# find path in object data[nested][func]
					path = ref.replace(/\(.*?\)$/, '').split('.')

					# set root
					fn = @data

					# traverse path
					fn = fn[key] for key in path
						

				# if it's a function
				if typeof fn is 'function'

					# find arguments: "func(barber, shop)"
					# todo: redo this regex
					args = ref.match(/\((.*?)\)$/)[1].split(',')

					# execute function with arguments
					return @resolveFn(fn, args)

				# oops, not a function
				else
					@alert("Something went wrong trying to match '#{tag}' '#{ref}'")

			# if it's plain text return replaced value with photoshop acceptable newlines
			return @resolveText(ref)



		# if it's a directly called function: `fn: function(){}`
		if typeof ref is 'function'

			# execute
			return @resolveFn(ref)

		# last resort, return original
		return original



	#––––––––––––––––––––––––––––––––––––
	# return types
	#––––––––––––––––––––––––––––––––––––

	resolveFn: (val, args = []) ->
		return val.apply(@data, args)

	resolveText: (val) ->
		return val.replace(/\n/g, '\r')



	#––––––––––––––––––––––––––––––––––––
	# end
	#––––––––––––––––––––––––––––––––––––

	end: -> 

		# output like [ 'layer1', 'layer2', 'layer3' ]
		output = (layer for layer in @textlayers)

		# add output
		@output.push(output)

		# log output
		# console.log @output



	#––––––––––––––––––––––––––––––––––––
	# get template
	#––––––––––––––––––––––––––––––––––––

	getTemplate: -> return @input.template


	#––––––––––––––––––––––––––––––––––––
	# there's no confirm in console
	#––––––––––––––––––––––––––––––––––––

	confirm: (msg) -> return true


	#––––––––––––––––––––––––––––––––––––
	# alert via console
	#––––––––––––––––––––––––––––––––––––

	alert: (msg) -> console.log(msg)


