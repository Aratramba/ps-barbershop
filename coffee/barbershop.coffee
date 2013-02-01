{ arrayToObject, csv2array } = require('./utils')


# Basic Barberbershop
module.exports = class Barbershop

	#––––––––––––––––––––––––––––––––––––
	# constructor
	#––––––––––––––––––––––––––––––––––––

	constructor: (@input) -> 

		# get template
		@template = @getTemplate()

		# cleanup input
		dataRows = @import()

		# check if data is valid
		if dataRows and typeof Array.isArray(dataRows)

			# setup document for every row found
			@prepare(row) for row in dataRows 

		# data was not parsed
		else
			@alert('data not parsed')



	#––––––––––––––––––––––––––––––––––––
	# import data
	#––––––––––––––––––––––––––––––––––––

	import: ->

		# parse json
		return @json(@input) if input.type is 'json'

		# parse csv
		return @csv(@input) if input.type is 'csv'



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

		# create array
		if Array.isArray(parsed)

			# no rows, useless
			return if parsed.length? is 0

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

		# current
		@current = dataRow

		# render
		@render()



	#––––––––––––––––––––––––––––––––––––
	# render
	#––––––––––––––––––––––––––––––––––––

	render: -> 

		# contain all textlayers
		@textlayers = []

		# collect textlayers
		@collect(@template)

		# start shaving
		@shave()



	#––––––––––––––––––––––––––––––––––––
	# recursively find all textlayers
	#––––––––––––––––––––––––––––––––––––

	collect: (layers) ->

		# loop
	    for layer in layers

	      # push text layers
	      if Array.isArray(layer)
	      	@collect(layer)

	      # find text layers in layergroup
	      else
	      	@textlayers.push(layer)



	#––––––––––––––––––––––––––––––––––––
	# start cutting
	#––––––––––––––––––––––––––––––––––––

	shave: ->

		# loop through layers
		for layer,counter in @textlayers

			# replace template strings
			contents = layer.replace /\{\{([^}]+)\}\}/gi, @trim

			# replace content only if something changed
			@textlayers[counter] = contents if contents isnt layer

		@end()



	#––––––––––––––––––––––––––––––––––––
	# trim a textlayer
	#––––––––––––––––––––––––––––––––––––

	trim: (original, text) =>

		# remove spaces
		tag = text.replace(/\s+/gi, '')


		# –––
		# quick resolve when no . is found
		# –––

		if tag.indexOf('.') is -1

			# if it's a string
			if typeof @current[tag] is 'string'

				# return new value
				return @current[tag].replace(/\n/g, '\r')

			# return original
			return original


		#–––
		# resolve object notation
		# –––

		keys = tag.split('.')

		# reference object
		ref = @current

		# loop through keys
		for key,counter in keys

			# if a key was found
			if ref[key]

				# set new reference
				ref = ref[key]

			# break if no index was found
			else
				break

		# if a string was found + ensure it was the last key found
		if typeof ref is 'string' and counter is keys.length
			return ref.replace(/\n/g, '\r')

		# last resort, return original
		return original



	#––––––––––––––––––––––––––––––––––––
	# end
	#––––––––––––––––––––––––––––––––––––

	end: -> 
		#return
		console.log (layer for layer in @textlayers)



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



"""

# photoshop specific code
class Barbershop.Photoshop extends Barbershop
	confirm: (msg) -> return confirm(msg)
	alert: (msg) -> alert(msg)
	getTemplate: -> return app.activeDocument



# html specific code
class Barbershop.Html extends Barbershop
	confirm: (msg) -> return confirm(msg)
	alert: (msg) -> console.log(msg)

"""