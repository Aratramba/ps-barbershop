class Barbershop

  constructor: (@input) ->

    @template = app.activeDocument

    # eval JSON
    if @input.type is 'json'
      dict = eval("(#{@input.data})")
      @prepare(dict)


    # jsonify CSV data
    if @input.type is 'csv'

      arr = csv2array(@input.data, @input.csv_separator, @input.string_delimiter)

      return if not arr

      # if just 1 row
      if arr.length is 1
        alert('Only one row detected. Make sure there is at least one row of column names and one row of data present.')
        return

      # if just 2 rows
      else if arr.length is 2
        @prepare(arrayToObject(arr))

      # if multiple rows
      else

        # double check if this is what we want
        if confirm('Multiple rows detected. This will create a duplicate psd for each row. Proceed?')

          # render all rows
          @prepare(arrayToObject([arr[0], row])) for row in arr.slice(1)



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



  # prepare document
  prepare: (json) ->

    # duplicate
    @template.duplicate(@input.docName) if @input.duplicate

    # suspend history
    app.activeDocument.suspendHistory("Barbershop magic", "this.render(json)")



  # render all text layers
  render: (json) ->
    
    # gather all text layers
    @textlayers = []
    @getTextLayers(app.activeDocument.layers)

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

    # focus on template
    app.activeDocument = @template