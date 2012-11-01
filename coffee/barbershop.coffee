class Barbershop

  init: (params) ->

    @textlayers = []

    # duplicate document
    if params.duplicate
      app.activeDocument.duplicate(params.docName)

    # render csv data
    if params.type is 'csv'
      dict = arrayToObject(csv2array(params.data, params.csv_separator))
      @render(dict)

    # render json data
    if params.type is 'json'
      @render(eval("(#{params.data})"))


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
        template = Hogan.compile(layer.textItem.contents)
        rendered = template.render(json).replace(/\n/g, '\r')
        if layer.textItem.contents isnt rendered
          layer.textItem.contents = rendered