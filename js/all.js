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

  function Dialog(barbershop) {
    var buttons, dlg, fields, group, groups;
    this.barbershop = barbershop;
    this.insertCSV = __bind(this.insertCSV, this);

    this.insertJSON = __bind(this.insertJSON, this);

    this.browse = __bind(this.browse, this);

    this.close = __bind(this.close, this);

    this.changeType = __bind(this.changeType, this);

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
    return this.barbershop.init(values);
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

  function Barbershop() {}

  Barbershop.prototype.init = function(params) {
    var dict;
    this.textlayers = [];
    if (params.duplicate) {
      app.activeDocument.duplicate(params.docName);
    }
    if (params.type === 'csv') {
      dict = arrayToObject(csv2array(params.data, params.csv_separator));
      this.render(dict);
    }
    if (params.type === 'json') {
      return this.render(eval("(" + params.data + ")"));
    }
  };

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

  Barbershop.prototype.render = function(json) {
    var contents, layer, _i, _len, _ref, _results;
    this.getTextLayers(app.activeDocument.layers);
    _ref = this.textlayers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      layer = _ref[_i];
      if (layer.kind === LayerKind.TEXT) {
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
          _results.push(layer.textItem.contents = contents);
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Barbershop;

})();

var barbershop, dialog;

barbershop = new Barbershop();

dialog = new Dialog(barbershop);
