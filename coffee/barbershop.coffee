class Barbershop

  constructor: (params) ->

    @textlayers = []

    # duplicate document
    if params.duplicate
      app.activeDocument.duplicate(params.docName)

    # jsonify csv data
    if params.type is 'csv'
      dict = arrayToObject(csv2array(params.data, params.csv_separator))

    # eval json
    if params.type is 'json'
      dict = eval("(#{params.data})")

    @render(dict)


  # find all text layers in document
  getTextLayers: (layers) ->

    # loop
    for layer in layers

      # push text layers
      if layer.kind is LayerKind.TEXT
        @textlayers.push(layer)

      # recurse into layergroups
      if layer.typename is 'LayerSet'
        @getTextLayers(layer.layers)


  # render all text layers
  render: (json) ->
    @getTextLayers(app.activeDocument.layers)

    for layer in @textlayers
      if layer.kind is LayerKind.TEXT

        # find tags, replace with values
        contents = layer.textItem.contents.replace /\{\{([^}]+)\}\}/gi, (original, text) ->

          # remove spaces
          tag = text.replace(/\s+/gi, '')
          
          # quick resolve
          if tag.indexOf('.') is -1
            if typeof json[tag] is 'string'
              return json[tag].replace(/\n/g, '\r')
            return original

          # object resolve
          keys = tag.split('.')

          # reference object
          ref = json

          # loop through keys
          for key,counter in keys


            # if a key was found
            if ref[key]
              ref = ref[key]

            # break if no index was found
            else
              break
            
          # if a string was found + ensure it was the last key found
          if typeof ref is 'string' and counter is keys.length
            return ref.replace(/\n/g, '\r')

          # last resort, return original
          return original


        # replace content only if something changed
        if contents isnt layer.textItem.contents
          layer.textItem.contents = contents