# Barbershop #
Simple Photoshop templating engine. 

Import json / csv data into your designs so you won't have to define them silly old Photoshop variables each and every time you want to import some dynamic data. Just type `{{ variable }}`, import a csv or json'ish file and you're good to go.

## Simple install ##

copy `build/barbershop.jsx` to your photoshop scripts folder.

Windows: `C:\Program Files\Adobe\Adobe Photoshop CS5\Presets\Scripts` 

Mac OS: `Applications\Adobe Photoshop CS5\Presets\Scripts`

If you have copied the .jsx file to the right directory, the script should appear in Photoshop (restart) under `file › scripts › barbershop`

## Usage ##

Create variables in the textlayers of your .psd by wrapping them in double curly brackets, like so: `{{variable}}`. You can use JSON here if you wish, so `{{object.object.variable}}` will work too.

Run the script (`file › scripts › barbershop`) and a dialog should now appear.

Import your file and all your variables will be replaced by their matching variables.


## Contribute / modify ##
You must have [node](http://nodejs.org/), [npm](https://npmjs.org/), [coffeescript](http://www.coffeescript.org) and [grunt](http://www.gruntjs.com) installed. 

### Install node modules ###
Run `npm link` to create a local install of the grunt packages.

### Edit code ###
Run `grunt` to continually compile coffeescript and move the .jsx file to the photoshop directory. Set the proper directory in the grunt.js file.


### Credits ###
Barbershop.js uses [Hogan](http://twitter.github.com/hogan.js/) for it's templating magic and [csv2array](http://www.speqmath.com/tutorials/csv2array/).