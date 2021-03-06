settings = require('./photoshop.settings')
Barbershop = require('./photoshop.barbershop')


# photoshop dialog
module.exports = class Dialog

  constructor: () ->

    return if not app.documents.length

    groups = {}
    fields = {}
    buttons = {}

    # create new dialog
    dlg = new Window('dialog', 'Barbershop')
    dlg.alignChildren = "left";

    # browse
    group = dlg.add('group')
    fields.browse = group.add('edittext', { x: 0, y: 0, width: 250, height: 25 }, '')
    fields.browse.enabled = false
    buttons.browse = group.add('button', undefined, 'browse')

    # paste data
    fields.data = dlg.add('edittext', { x: 0, y: 0, width: 600, height: 300 }, undefined, { multiline: true, scrolling: true })
    fields.data.active = true

    # type
    group = dlg.add('group')
    group.add('statictext', { x: 0, y: 0, width: 140, height: 25 }, 'Type:')
    fields.type = group.add('dropdownlist', { x: 140, y: 330, width: 100, height: 25 }, ['csv', 'json'])
    fields.type.selection = fields.type.find(settings.type)
    fields.type.onChange = @changeType

    # csv separators
    groups.csv = group = group.add('group')
    group.alignChildren = 'left'
    group.orientation = 'row'

    group.add('statictext', undefined, 'Separator:')
    fields.csv_separator = group.add('edittext', { x: 140, y: 300, width: 80, height: 25 }, settings.csv_separator)

    group.add('statictext', undefined, 'String delimiter:')
    fields.string_delimiter = group.add('edittext', { x: 240, y: 300, width: 80, height: 25 }, settings.string_delimiter)

    # duplicate document
    group = dlg.add('group')
    group.add('statictext', { x: 0, y: 0, width: 140, height: 25 }, 'Document name:')
    fields.duplicate_name = group.add('edittext', { x: 140, y: 360, width: 100, height: 25 }, app.activeDocument.name)
    fields.duplicate = group.add('checkbox', undefined, 'Create duplicate')
    fields.duplicate.value = settings.duplicate

    # buttons
    group = dlg.add('group')
    buttons.submit = group.add('button', undefined, 'OK')
    buttons.cancel = group.add('button', undefined, 'cancel')

    @dlg = dlg
    @fields = fields
    @groups = groups

    # buttons
    buttons.submit.onClick = @close
    buttons.browse.onClick = @browse

    @changeType()

    # show dialog
    dlg.show()


  changeType: (type) =>
    if type?
        @fields.type.selection = @fields.type.find(type)
    else
        type = @fields.type.selection.text

    @groups.csv.visible = (type is 'csv')


  close: =>
    @dlg.close()

    values = {
        data: @fields.data.text,
        duplicate: @fields.duplicate.value,
        duplicate_name: @fields.duplicate_name.text,
        type: @fields.type.selection.text,
        csv_separator: @fields.csv_separator.text,
        string_delimiter: @fields.string_delimiter.text
    }
    new Barbershop(values)


  browse: =>
    # open file
    srcFile = File.openDialog("Select the data file.")

    # check existance
    if srcFile and srcFile.exists
        is_json = srcFile.name.match(/\.json|.js$/i)
        is_csv = srcFile.name.match(/\.csv$/i)

        if is_json or is_csv
            @fields.browse.text = "#{srcFile.path}/#{srcFile.name}"

            data = ''

            # read
            srcFile.open("r")
            data = srcFile.read()

            # close file
            srcFile.close()

            # write data
            @insertJSON(data) if is_json
            @insertCSV(data) if is_csv

        else
            @fields.data.text = 'unknown file format'


  insertJSON: (json) =>
    @fields.data.text = json || settings.samples.json
    @changeType('json')

  insertCSV: (csv) => 
    @fields.data.text = csv || settings.samples.csv
    @changeType('csv')
