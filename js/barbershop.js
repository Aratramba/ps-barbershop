(function(){
var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/photoshop.dialog.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Barbershop, Dialog, settings,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  settings = require('./photoshop.settings');

  Barbershop = require('./photoshop.barbershop');

  module.exports = Dialog = (function() {

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
      group.add('statictext', void 0, 'String delimiter:');
      fields.string_delimiter = group.add('edittext', {
        x: 240,
        y: 300,
        width: 80,
        height: 25
      }, settings.string_delimiter);
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
      fields.duplicate = group.add('checkbox', void 0, 'Create duplicate');
      fields.duplicate.value = settings.duplicate;
      group = dlg.add('group');
      buttons.submit = group.add('button', void 0, 'OK');
      buttons.cancel = group.add('button', void 0, 'cancel');
      this.dlg = dlg;
      this.fields = fields;
      this.groups = groups;
      buttons.submit.onClick = this.close;
      buttons.browse.onClick = this.browse;
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
        duplicate_name: this.fields.duplicate_name.text,
        type: this.fields.type.selection.text,
        csv_separator: this.fields.csv_separator.text,
        string_delimiter: this.fields.string_delimiter.text
      };
      return new Barbershop(values);
    };

    Dialog.prototype.browse = function() {
      var data, is_csv, is_json, srcFile;
      srcFile = File.openDialog("Select the data file.");
      if (srcFile && srcFile.exists) {
        is_json = srcFile.name.match(/\.json|.js$/i);
        is_csv = srcFile.name.match(/\.csv$/i);
        if (is_json || is_csv) {
          this.fields.browse.text = "" + srcFile.path + "/" + srcFile.name;
          data = '';
          srcFile.open("r");
          data = srcFile.read();
          srcFile.close();
          if (is_json) {
            this.insertJSON(data);
          }
          if (is_csv) {
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

}).call(this);

});

require.define("/photoshop.settings.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {

  module.exports = {
    type: 'json',
    csv_separator: ';',
    string_delimiter: '\"',
    duplicate: true
  };

}).call(this);

});

require.define("/photoshop.barbershop.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Barbershop,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Barbershop = require('./barbershop');

  module.exports = Barbershop.Photoshop = (function(_super) {

    __extends(Photoshop, _super);

    function Photoshop() {
      return Photoshop.__super__.constructor.apply(this, arguments);
    }

    Photoshop.prototype.prepare = function(dataRow) {
      this.current = dataRow;
      if (this.input.duplicate) {
        this.template.duplicate(this.input.duplicate_name);
      }
      return app.activeDocument.suspendHistory("Barbershop magic", "this.render()");
    };

    Photoshop.prototype.collect = function(layers) {
      var layer, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = layers.length; _i < _len; _i++) {
        layer = layers[_i];
        if (layer.kind === LayerKind.TEXT) {
          this.collect(layer);
        }
        if (layer.typename === 'LayerSet') {
          _results.push(this.textlayers.push(layer.layers));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Photoshop.prototype.shave = function() {
      var contents, counter, layer, _i, _len, _ref;
      _ref = this.textlayers;
      for (counter = _i = 0, _len = _ref.length; _i < _len; counter = ++_i) {
        layer = _ref[counter];
        contents = layer.textItem.contents.replace(/\{\{([^}]+)\}\}/gi, this.trim);
        if (contents !== layer.textItem.contents) {
          layer.textItem.contents = contents;
        }
      }
      return this.end();
    };

    Photoshop.prototype.end = function() {
      return app.activeDocument = this.template;
    };

    Photoshop.prototype.getTemplate = function() {
      return app.activeDocument;
    };

    Photoshop.prototype.confirm = function(msg) {
      return confirm(msg);
    };

    Photoshop.prototype.alert = function(msg) {
      return alert(msg);
    };

    return Photoshop;

  })(Barbershop);

}).call(this);

});

require.define("/barbershop.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Barbershop, arrayToObject, csv2array, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('./utils'), arrayToObject = _ref.arrayToObject, csv2array = _ref.csv2array;

  module.exports = Barbershop = (function() {

    function Barbershop(input) {
      var dataRows, row, _i, _len;
      this.input = input;
      this.trim = __bind(this.trim, this);

      this.output = [];
      this.template = this.getTemplate();
      dataRows = this["import"]();
      if (dataRows && typeof dataRows.length) {
        for (_i = 0, _len = dataRows.length; _i < _len; _i++) {
          row = dataRows[_i];
          this.prepare(row);
        }
      } else {
        this.alert('data not parsed');
      }
      return this.output;
    }

    Barbershop.prototype["import"] = function() {
      if (this.input.type === 'json') {
        return this.json(this.input);
      }
      if (this.input.type === 'csv') {
        return this.csv(this.input);
      }
    };

    Barbershop.prototype.json = function(input) {
      var parsed;
      try {
        parsed = eval("(" + input.data + ")");
      } catch (err) {
        this.alert('error while evaluating input');
        return;
      }
      if (parsed.length) {
        if (parsed.length === 0) {
          return;
        }
        return parsed;
      }
      return [parsed];
    };

    Barbershop.prototype.csv = function(input) {
      var counter, dataRows, header, obj, original, row, _i, _len;
      original = csv2array(this.input.data, this.input.csv_separator, this.input.string_delimiter);
      if (!original) {
        return;
      }
      if (original.length === 1) {
        return;
      }
      dataRows = [];
      header = original.shift();
      for (counter = _i = 0, _len = original.length; _i < _len; counter = ++_i) {
        row = original[counter];
        obj = arrayToObject([header, row]);
        dataRows.push(obj);
      }
      return dataRows;
    };

    Barbershop.prototype.prepare = function(dataRow) {
      this.current = dataRow;
      return this.render();
    };

    Barbershop.prototype.render = function() {
      this.textlayers = [];
      this.collect(this.template);
      return this.shave();
    };

    Barbershop.prototype.collect = function(layers) {
      var layer, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = layers.length; _i < _len; _i++) {
        layer = layers[_i];
        if (Array.isArray(layer)) {
          _results.push(this.collect(layer));
        } else {
          _results.push(this.textlayers.push(layer));
        }
      }
      return _results;
    };

    Barbershop.prototype.shave = function() {
      var contents, counter, layer, _i, _len, _ref1;
      _ref1 = this.textlayers;
      for (counter = _i = 0, _len = _ref1.length; _i < _len; counter = ++_i) {
        layer = _ref1[counter];
        contents = layer.replace(/\{\{([^}]+)\}\}/gi, this.trim);
        if (contents !== layer) {
          this.textlayers[counter] = contents;
        }
      }
      return this.end();
    };

    Barbershop.prototype.trim = function(original, text) {
      var counter, key, keys, ref, tag, _i, _len;
      tag = text.replace(/\s+/gi, '');
      if (tag.indexOf('.') === -1) {
        if (typeof this.current[tag] === 'string') {
          return this.current[tag].replace(/\n/g, '\r');
        }
        return original;
      }
      keys = tag.split('.');
      ref = this.current;
      for (counter = _i = 0, _len = keys.length; _i < _len; counter = ++_i) {
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
    };

    Barbershop.prototype.end = function() {
      var layer, output;
      output = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.textlayers;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          layer = _ref1[_i];
          _results.push(layer);
        }
        return _results;
      }).call(this);
      return this.output.push(output);
    };

    Barbershop.prototype.getTemplate = function() {
      return this.input.template;
    };

    Barbershop.prototype.confirm = function(msg) {
      return true;
    };

    Barbershop.prototype.alert = function(msg) {
      return console.log(msg);
    };

    return Barbershop;

  })();

  "\n# photoshop specific code\nclass Barbershop.Photoshop extends Barbershop\n	confirm: (msg) -> return confirm(msg)\n	alert: (msg) -> alert(msg)\n	getTemplate: -> return app.activeDocument\n\n\n\n# html specific code\nclass Barbershop.Html extends Barbershop\n	confirm: (msg) -> return confirm(msg)\n	alert: (msg) -> console.log(msg)\n";


}).call(this);

});

require.define("/utils.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
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
 * @param {string} data             The data in CSV format.
 * @param {string} delimeter        [optional] a custom delimeter. Comma ',' by default
 *                                  The Delimeter must be a single character.
 * @param {string} string_delimiter defaults to ""
 * @return {Array} array            A two dimensional array containing the data
 * @throw {String} error            The method throws an error when there is an
 *                                  error in the provided data.
 */ 
function csv2array(data, delimeter, string_delimiter) {

  // Retrieve the delimeter
  if (delimeter == undefined) 
    delimeter = ',';
  if (delimeter && delimeter.length > 1)
    delimeter = ',';


  if (string_delimiter === undefined)
    string_delimiter = '\"';

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
    if (c == string_delimiter) {
      // value enclosed by double-quotes
      c = data.charAt(++i);
      
      do {
        if (c != string_delimiter) {
          // read a regular character and go to the next character
          value += c;
          c = data.charAt(++i);
        }
        
        if (c == string_delimiter) {
          // check for escaped double-quote
          var cnext = data.charAt(i+1);
          if (cnext == string_delimiter) {
            // this is an escaped double-quote. 
            // Add a double-quote to the value, and move two characters ahead.
            value += string_delimiter;
            i += 2;
            c = data.charAt(i);
          }
        }
      }
      while (c != eof && c != string_delimiter);
      
      if (c == eof) {
        //alert("Unexpected end of data, double-quote expected");
        return false;
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
      //alert("Delimiter expected after character "+ i +"( "+ data.substr(i - 15, 20) +")");
      return false;
    }
    
    // go to the next character
    c = data.charAt(++i);
  }  
  
  return array;
}
;


  module.exports = {
    arrayToObject: arrayToObject,
    csv2array: csv2array
  };

}).call(this);

});

require.define("/photoshop.index.coffee",function(require,module,exports,__dirname,__filename,process,global){(function() {
  var Dialog;

  Dialog = require('./photoshop.dialog');

  new Dialog();

}).call(this);

});
require("/photoshop.index.coffee");

})();
