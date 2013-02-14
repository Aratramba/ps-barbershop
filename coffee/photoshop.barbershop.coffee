Barbershop = require('./barbershop')


# Photoshop Barbershop
module.exports = class Barbershop.Photoshop extends Barbershop

	#––––––––––––––––––––––––––––––––––––
	# prepare document
	#––––––––––––––––––––––––––––––––––––

	prepare: (dataRow) ->

		# current
		@data = dataRow

		# duplicate
		@template.duplicate(@input.duplicate_name) if @input.duplicate

		# suspend history
		app.activeDocument.suspendHistory("Barbershop magic", "this.render()")



	#––––––––––––––––––––––––––––––––––––
	# recursively find all textlayers
	#––––––––––––––––––––––––––––––––––––

	collect: (layers) ->

		# first time, get document layers
		if not layers
			layers = app.activeDocument.layers

		# loop
		for layer in layers

			# push text layers
			if layer.kind is LayerKind.TEXT

				# check if it is barbershoppable, if so: add
				@textlayers.push(layer) if layer.textItem.contents.match(@MUSTACHE_REGEX)
					


			# find text layers in layergroup
			else if layer.typename is 'LayerSet' and layer.layers
				@collect(layer.layers)



	#––––––––––––––––––––––––––––––––––––
	# start cutting
	#––––––––––––––––––––––––––––––––––––

	shave: ->

		# loop through layers
		for layer,counter in @textlayers

			# replace template strings
			contents = layer.textItem.contents.replace /\{\{([^}]+)\}\}/gi, @trim

			# replace content only if something changed
			if contents isnt layer.textItem.contents
				layer.textItem.contents = contents

		@end()



	#––––––––––––––––––––––––––––––––––––
	# end
	#––––––––––––––––––––––––––––––––––––

	end: -> app.activeDocument = @template
		

	#––––––––––––––––––––––––––––––––––––
	# get template
	#––––––––––––––––––––––––––––––––––––

	getTemplate: -> return app.activeDocument


	#––––––––––––––––––––––––––––––––––––
	# there's no confirm in console
	#––––––––––––––––––––––––––––––––––––

	confirm: (msg) -> return confirm(msg)


	#––––––––––––––––––––––––––––––––––––
	# alert via console
	#––––––––––––––––––––––––––––––––––––

	alert: (msg) -> alert(msg)

