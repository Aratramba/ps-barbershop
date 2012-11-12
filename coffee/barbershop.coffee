class Barbershop

  constructor: (@params) ->

    @doc = app.activeDocument

    # eval JSON
    if @params.type is 'json'
      dict = eval("(#{params.data})")
      @render(dict)


    # jsonify CSV data
    if @params.type is 'csv'

      arr = csv2array(@params.data, @params.csv_separator)

      # if just 1 row
      if arr.length is 2
        @render(arrayToObject(arr))

      # if multiple rows
      else

        # check permission
        if confirm('Multiple rows detected. Proceed?')

          # render all rows
          @render(arrayToObject([arr[0], row])) for row in arr.slice(1)



  # duplicate document
  duplicate: () -> 
    if @params.duplicate
      @doc.duplicate(@params.docName)



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

    ###
    TODO: duplicating works, but multiple rows only get filled with the first rows' value
    ###
    duplicate = @duplicate()

    @textlayers = []
    @getTextLayers(duplicate.layers)

    # loop through all textlaters
    for layer in @textlayers

      # find {{tags}}, replace with values
      contents = layer.textItem.contents.replace /\{\{([^}]+)\}\}/gi, (original, text) ->

        # remove spaces
        tag = text.replace(/\s+/gi, '')
        
        # quick resolve
        if tag.indexOf('.') is -1
          if typeof json[tag] is 'string'
            return json[tag].replace(/\n/g, '\r')
          return original

        # resolve object
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