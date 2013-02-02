# Barbershop ##
#### So you want to import dynamic data into your psd's? ####

![](https://raw.github.com/EightMedia/ps-barbershop/master/assets/img/example.png)

## Getting started ##
#### 1. Copy .jsx file ####
copy `install/barbershop.jsx` to your Photoshop scripts folder:

Windows: `C:\Program Files\Adobe\Adobe Photoshop CS5\Presets\Scripts`   
Mac OS: `Applications\Adobe Photoshop CS5\Presets\Scripts`

#### 2. Create variables ####
Create variables in your textlayers by wrapping them in double curly brackets, like so: `{{variable}}`. You can use object notation here if you wish, so `{{object.object.key}}` will work too (json only).

#### 3. Run the script ####

![](https://raw.github.com/EightMedia/ps-barbershop/master/assets/img/dialog.jpg)

Restart Photoshop. 

Now run the script from the Photoshop menu under `file › scripts › barbershop` or go to `file › scripts › browse` and find `barbershop.jsx`.

A dialog should now appear where you can tweak some import settings. Import your file and all your variables will be magically replaced by their matching data.

---
### Supported import formats ###
You can import CSV or JSON files with Barbershop. 

##### CSV ####
CSV doesn't necessarily mean comma separated. Use commas, periods, semicolons or exclamation marks for all I care. Just make sure you set the right import setting for `separator` and `string delimiter` in the Photoshop dialog. Also don't forget to escape separator characters that should be interpreted as a cell values (e.g. value;"The semicolon (;) is a punctuation mark"; value).

```csv
name,textfield,
Barbershop,"some text",
```

Multiple rows will create multiple psd's.

```csv
name;textfield;
Barbershop;"some text";
"Barbershop II";"some text II";
```

##### JSON ####
Any JSON'ish file will do really.

You can use a plain Javascript object:

```javascript
{
    "name": {
        "firstname": "Barber",
        "lastname": "Shop"
    },
    "textfield": "some\ntext"
}
```

Or an array holding multiple objects. This will create multiple psd's.

```javascript
[{
    "name": {
        "firstname": "Barber",
        "lastname": "Shop"
    },
    "textfield": "some\ntext"
},{
    "name": {
        "firstname": "Barber",
        "lastname": "Shop II"
    },
    "textfield": "some\ntext II"
}]
``` 

---

### Why use it? ###
Defining Photoshops native variables and importing data sets can be quite a tedious task. Other than that you're very limited in what you can achieve with them. Plus your files get messy because of all the separate textlayers for your variables. Barbershop aims to simplify this process.

---

### Known issues ###
##### CSV import error #####
Make sure all content, other than a single word or number, is wrapped in "" (or whatever the string_delimiter setting is set to). You'll get an error saying something like `Delimiter expected after character x. (foo bar)` if you don't "wrap strings in quotes".

##### Formatting removed #####
Barbershop will reset font styles if your textlayer consists of multiple text formats (like different colors, fonts, sizes etc). As long as you have 'plain' text fields, you're fine.

---

### Tips ###
When you use a script often consider [creating a shortcut](http://help.adobe.com/en_US/photoshop/cs/using/WSfd1234e1c4b69f30ea53e41001031ab64-7448a.html#WSA72EC22F-E602-4fa7-B236-401CCDD3DF1Aa).

---

#### Contribute ####
You must have [node](http://nodejs.org/), [npm](https://npmjs.org/), and [grunt](https://github.com/gruntjs/grunt/wiki/Getting-started) installed.

Run `npm install` to create a local install of the grunt packages.

Run `grunt` to continually compile coffeescript and move the .jsx file to the photoshop directory. Set the proper directory in Grunfile.coffee file.

[Report issues here](https://github.com/EightMedia/ps-barbershop/issues).
