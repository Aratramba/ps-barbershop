# Barbershop #
Simple Photoshop templating engine. 

Import json / csv data into your designs so you won't have to define them silly old Photoshop variables each and every time you want to import some dynamic data. Just type `{{ variable }}`, import a csv or json'ish file and you're good to go.

## Simple install ##

copy `build/barbershop.js` to your photoshop scripts folder.

Windows: `C:\Program Files\Adobe\Adobe Photoshop CS5\Presets\Scripts`
Mac OS: `Applications\Adobe Photoshop CS5\Presets\Scripts`

## Usage ##

Run the script. If you have copied the .jsx file to the right directory, the script should appear in Photoshop (restart) under file › scripts › barbershop. Click it and a dialog should now appear.

Import your file and all your variables will be replaced by their matching variables.


## Modify code ##
You must have [node](http://nodejs.org/), [npm](https://npmjs.org/), [coffeescript](http://www.coffeescript.org) and [grunt](http://www.gruntjs.com) installed. 

### Install node modules ###
Run `npm link` to create a local install of the grunt packages.

### Edit code ###
Run `grunt` to continually compile coffeescript and move the .jsx file to the photoshop directory. Set the proper directory in the grunt.js file.


## todo ##
* multiline in photoshop don't spread over more lines, maybe replace \n by \r\n ??