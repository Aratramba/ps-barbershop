# Barbershop ##
#### a simple Photoshop `{{ templating }}` engine#### ####

So you want to import dynamic data into your psd's?

![](https://raw.github.com/EightMedia/ps-barbershop/master/assets/example.png)

Just type `{{ variable }}` somewhere inside your textfields, import a csv or json'ish file and run the script to import your data.

## Getting started ## ##
#### 1. Copy .jsx file ####
copy `build/barbershop.jsx` to your Photoshop scripts folder:

Windows: `C:\Program Files\Adobe\Adobe Photoshop CS5\Presets\Scripts`   
Mac OS: `Applications\Adobe Photoshop CS5\Presets\Scripts`

#### 2. Open script ####
If you have copied the .jsx file to the right directory, the script should appear in Photoshop under `file › scripts › barbershop` when you have restarted it.

## Usage ##
Create variables in the textlayers of your .psd by wrapping them in double curly brackets, like so: `{{variable}}`. You can use object notation here if you wish, so `{{object.object.key}}` will work too (json only).

Run the script `file › scripts › barbershop` and a dialog should now appear where you can tweak some import settings.

Import your file and all your variables will be magically replaced by their matching data.

## Why use it? ## ##
Defining Photoshops native variables and importing data sets can be quite a tedious task. Other than that you're very limited in what you can achieve with them. Plus your files get messy because of all the separate textlayers for your variables. Barbershop aims to simplify this process.

---

### Known issues ###
Make sure all content, other than a single word or number, is wrapped in "" (or whatever the string_delimiter setting is set to). You'll get an error saying something like `Delimiter expected after character x. (foo bar)` if you don't "wrap strings in quotes".

---

### Tips ###
When you use a script often consider [creating a shortcut](http://help.adobe.com/en_US/photoshop/cs/using/WSfd1234e1c4b69f30ea53e41001031ab64-7448a.html#WSA72EC22F-E602-4fa7-B236-401CCDD3DF1Aa).

---

#### Contribute / modify ####
You must have [node](http://nodejs.org/), [npm](https://npmjs.org/), [coffeescript](http://www.coffeescript.org) and [grunt](http://www.gruntjs.com) installed. (Report issues here)[https://github.com/EightMedia/ps-barbershop/issues].

##### Install node modules #####
Run `npm install` to create a local install of the grunt packages.

##### Edit code #####
Run `grunt` to continually compile coffeescript and move the .jsx file to the photoshop directory. Set the proper directory in Grunfile.coffee file.
