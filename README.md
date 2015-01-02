[![GPL License][license-image]][license-url]

#Bitsharesblocks

Repo for the source code of http://www.bitsharesblocks.com

##Setup
Clone into your directory of choice, then do "npm install" (sudo might be necessary).

The website uses a component file structure, see https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/mobilebasic?pli=1. 

In order to use lineman with this layout it is necessary to modify the grunt configuration file in: 

	/node_modules/lineman-angular/config/plugins/ngtemplates.coffee

Replace the following: 

	ngtemplates:
	    app:
	        options:
	          base: "app/templates"
	        src: "app/templates/**/*.html"
	        dest: "<%= files.ngtemplates.dest %>"

	    watch:
	      ngtemplates:
	        files: "app/templates/**/*.html",
	        tasks: ["ngtemplates", "concat_sourcemap:js"]

with: (this is coffeescript so make sure the indentations are correct)

	ngtemplates:
		app:
			options:
			  base: "app/components"
			src: ["app/templates/**/*.html",
			     "app/components/**/**/*.html"]
			dest: "<%= files.ngtemplates.dest %>"

	watch:
		ngtemplates:
			files: ["app/templates/**/*.html","app/components/**/*.html"]
			tasks: ["ngtemplates", "concat_sourcemap:js"]

Then, in this file: 

	/node_modules/lineman-angular/node_modules/grunt-angular-templates/tasks/lib/compiler.js

Comment out line 18:

	var id        = (options.prepend || '') + path.relative(options.base || '.', file).replace( /\\/g, '/');

And add the following on line 19:

	console.log('file: '+file);
    var id = file.split('/');
    id = id[id.length-1];
      
##Use
Launch the website locally using "lineman run". To compile, use "lineman build".

Access the website at localhost:8000. 

##Translations
Bounties for translations available here:

https://bitsharestalk.org/index.php?topic=11695.0

Translations accepted for bounties: Russian

[license-image]: http://img.shields.io/badge/license-GPL3-blue.svg?style=flat
[license-url]: LICENSE