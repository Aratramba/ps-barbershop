var settings;

settings = {
  type: 'json',
  csv_separator: ';',
  duplicate: true,
  samples: {
    csv: "name;textfield\nBarbershop;\"some text\"\n\"Barbershop II\";\"some text II\"",
    json: "{\n	\"name\": {\n		\"firstname\": \"Barber\",\n		\"lastname\": \"Shop\"\n	},\n	\"textfield\": \"some text\"\n}"
  }
};

/**
 * Convert data in CSV (comma separated value) format to a javascript array.
 *
 * Values are separated by a comma, or by a custom one character delimeter.
 * Rows are separated by a new-line character.
 *
 * Leading and trailing spaces and tabs are ignored.
 * Values may optionally be enclosed by double quotes.
 * Values containing a special character (comma's, double-quotes, or new-lines)
 *   must be enclosed by double-quotes.
 * Embedded double-quotes must be represented by a pair of consecutive 
 * double-quotes.
 *
 * Example usage:
 *   var csv = '"x", "y", "z"\n12.3, 2.3, 8.7\n4.5, 1.2, -5.6\n';
 *   var array = csv2array(csv);
 *  
 * Author: Jos de Jong, 2010
 * 
 * @param {string} data      The data in CSV format.
 * @param {string} delimeter [optional] a custom delimeter. Comma ',' by default
 *                           The Delimeter must be a single character.
 * @return {Array} array     A two dimensional array containing the data
 * @throw {String} error     The method throws an error when there is an
 *                           error in the provided data.
 */ 
function csv2array(data, delimeter) {
  // Retrieve the delimeter
  if (delimeter == undefined) 
    delimeter = ',';
  if (delimeter && delimeter.length > 1)
    delimeter = ',';

  // initialize variables
  var newline = '\n';
  var eof = '';
  var i = 0;
  var c = data.charAt(i);
  var row = 0;
  var col = 0;
  var array = new Array();

  while (c != eof) {
    // skip whitespaces
    while (c == ' ' || c == '\t' || c == '\r') {
      c = data.charAt(++i); // read next char
    }
    
    // get value
    var value = "";
    if (c == '\"') {
      // value enclosed by double-quotes
      c = data.charAt(++i);
      
      do {
        if (c != '\"') {
          // read a regular character and go to the next character
          value += c;
          c = data.charAt(++i);
        }
        
        if (c == '\"') {
          // check for escaped double-quote
          var cnext = data.charAt(i+1);
          if (cnext == '\"') {
            // this is an escaped double-quote. 
            // Add a double-quote to the value, and move two characters ahead.
            value += '\"';
            i += 2;
            c = data.charAt(i);
          }
        }
      }
      while (c != eof && c != '\"');
      
      if (c == eof) {
        alert("Unexpected end of data, double-quote expected");
      }

      c = data.charAt(++i);
    }
    else {
      // value without quotes
      while (c != eof && c != delimeter && c!= newline && c != ' ' && c != '\t' && c != '\r') {
        value += c;
        c = data.charAt(++i);
      }
    }

    // add the value to the array
    if (array.length <= row) 
      array.push(new Array());
    array[row].push(value);
    
    // skip whitespaces
    while (c == ' ' || c == '\t' || c == '\r') {
      c = data.charAt(++i);
    }

    // go to the next row or column
    if (c == delimeter) {
      // to the next column
      col++;
    }
    else if (c == newline) {
      // to the next row
      col = 0;
      row++;
    }
    else if (c != eof) {
      // unexpected character
      alert("Delimiter expected after character " + i);
    }
    
    // go to the next character
    c = data.charAt(++i);
  }  
  
  return array;
}
var arrayToObject;

arrayToObject = function(arr) {
  var dict, key, val, _i, _len, _ref;
  dict = {};
  _ref = arr[0];
  for (key = _i = 0, _len = _ref.length; _i < _len; key = ++_i) {
    val = _ref[key];
    if (arr[1][key]) {
      dict[val] = arr[1][key];
    }
  }
  return dict;
};

var Dialog,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Dialog = (function() {

  function Dialog() {
    this.insertCSV = __bind(this.insertCSV, this);

    this.insertJSON = __bind(this.insertJSON, this);

    this.browse = __bind(this.browse, this);

    this.close = __bind(this.close, this);

    this.changeType = __bind(this.changeType, this);

    var buttons, dlg, fields, group, groups;
    if (!app.documents.length) {
      return;
    }
    groups = {};
    fields = {};
    buttons = {};
    dlg = new Window('dialog', 'Barbershop');
    dlg.alignChildren = "left";
    group = dlg.add('group');
    fields.browse = group.add('edittext', {
      x: 0,
      y: 0,
      width: 250,
      height: 25
    }, '');
    fields.browse.enabled = false;
    buttons.browse = group.add('button', void 0, 'browse');
    group.add('statictext', void 0, 'insert sample');
    buttons.sample_json = group.add('button', void 0, 'json');
    buttons.sample_csv = group.add('button', void 0, 'csv');
    fields.data = dlg.add('edittext', {
      x: 0,
      y: 0,
      width: 600,
      height: 300
    }, void 0, {
      multiline: true,
      scrolling: true
    });
    fields.data.active = true;
    group = dlg.add('group');
    group.add('statictext', {
      x: 0,
      y: 0,
      width: 140,
      height: 25
    }, 'Type:');
    fields.type = group.add('dropdownlist', {
      x: 140,
      y: 330,
      width: 100,
      height: 25
    }, ['csv', 'json']);
    fields.type.selection = fields.type.find(settings.type);
    fields.type.onChange = this.changeType;
    groups.csv = group = group.add('group');
    group.alignChildren = 'left';
    group.orientation = 'row';
    group.add('statictext', void 0, 'Separator:');
    fields.csv_separator = group.add('edittext', {
      x: 140,
      y: 300,
      width: 80,
      height: 25
    }, settings.csv_separator);
    group = dlg.add('group');
    group.add('statictext', {
      x: 0,
      y: 0,
      width: 140,
      height: 25
    }, 'Document name:');
    fields.duplicate_name = group.add('edittext', {
      x: 140,
      y: 360,
      width: 100,
      height: 25
    }, app.activeDocument.name);
    fields.duplicate = group.add('checkbox', void 0, 'Duplicate window');
    fields.duplicate.value = settings.duplicate;
    group = dlg.add('group');
    buttons.submit = group.add('button', void 0, 'OK');
    buttons.cancel = group.add('button', void 0, 'cancel');
    this.dlg = dlg;
    this.fields = fields;
    this.groups = groups;
    buttons.submit.onClick = this.close;
    buttons.browse.onClick = this.browse;
    buttons.sample_json.onClick = this.insertJSON;
    buttons.sample_csv.onClick = this.insertCSV;
    this.changeType();
    dlg.show();
  }

  Dialog.prototype.changeType = function(type) {
    if (type != null) {
      this.fields.type.selection = this.fields.type.find(type);
    } else {
      type = this.fields.type.selection.text;
    }
    return this.groups.csv.visible = type === 'csv';
  };

  Dialog.prototype.close = function() {
    var values;
    this.dlg.close();
    values = {
      data: this.fields.data.text,
      duplicate: this.fields.duplicate.value,
      docName: this.fields.duplicate_name.text,
      type: this.fields.type.selection.text,
      csv_separator: this.fields.csv_separator.text
    };
    return new Barbershop(values);
  };

  Dialog.prototype.browse = function() {
    var csv, data, json, srcFile;
    srcFile = File.openDialog("Select the data file.");
    if (srcFile && srcFile.exists) {
      json = srcFile.name.match(/\.json|.js$/i);
      csv = srcFile.name.match(/\.csv$/i);
      if (json || csv) {
        this.fields.browse.text = "" + srcFile.path + "/" + srcFile.name;
        data = '';
        srcFile.open("r");
        data = srcFile.read();
        srcFile.close();
        if (json) {
          this.insertJSON(data);
        }
        if (csv) {
          return this.insertCSV(data);
        }
      } else {
        return this.fields.data.text = 'unknown file format';
      }
    }
  };

  Dialog.prototype.insertJSON = function(json) {
    this.fields.data.text = json || settings.samples.json;
    return this.changeType('json');
  };

  Dialog.prototype.insertCSV = function(csv) {
    this.fields.data.text = csv || settings.samples.csv;
    return this.changeType('csv');
  };

  return Dialog;

})();

var Barbershop;

Barbershop = (function() {

  function Barbershop(input) {
    var arr, dict, row, _i, _len, _ref;
    this.input = input;
    this.template = app.activeDocument;
    if (this.input.type === 'json') {
      dict = eval("(" + this.input.data + ")");
      this.prepare(dict);
    }
    if (this.input.type === 'csv') {
      arr = csv2array(this.input.data, this.input.csv_separator);
      if (arr.length === 2) {
        this.prepare(arrayToObject(arr));
      } else {
        if (confirm('Multiple rows detected. This will create a duplicate psd for each row. Proceed?')) {
          _ref = arr.slice(1);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            row = _ref[_i];
            this.prepare(arrayToObject([arr[0], row]));
          }
        }
      }
    }
  }

  Barbershop.prototype.getTextLayers = function(layers) {
    var layer, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = layers.length; _i < _len; _i++) {
      layer = layers[_i];
      if (layer.kind === LayerKind.TEXT) {
        this.textlayers.push(layer);
      }
      if (layer.typename === 'LayerSet') {
        _results.push(this.getTextLayers(layer.layers));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Barbershop.prototype.prepare = function(json) {
    if (this.input.duplicate) {
      this.template.duplicate(this.input.docName);
    }
    return app.activeDocument.suspendHistory("Barbershop magic", "this.render(json)");
  };

  Barbershop.prototype.render = function(json) {
    var contents, layer, _i, _len, _ref;
    this.textlayers = [];
    this.getTextLayers(app.activeDocument.layers);
    _ref = this.textlayers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      contents = layer.textItem.contents.replace(/\{\{([^}]+)\}\}/gi, function(original, text) {
        var counter, key, keys, ref, tag, _j, _len1;
        tag = text.replace(/\s+/gi, '');
        if (tag.indexOf('.') === -1) {
          if (typeof json[tag] === 'string') {
            return json[tag].replace(/\n/g, '\r');
          }
          return original;
        }
        keys = tag.split('.');
        ref = json;
        for (counter = _j = 0, _len1 = keys.length; _j < _len1; counter = ++_j) {
          key = keys[counter];
          if (ref[key]) {
            ref = ref[key];
          } else {
            break;
          }
        }
        if (typeof ref === 'string' && counter === keys.length) {
          return ref.replace(/\n/g, '\r');
        }
        return original;
      });
      if (contents !== layer.textItem.contents) {
        layer.textItem.contents = contents;
      }
    }
    return app.activeDocument = this.template;
  };

  return Barbershop;

})();

var dialog;

dialog = new Dialog();
