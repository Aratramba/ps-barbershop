module.exports = (grunt) ->

	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-contrib-copy')
	grunt.loadNpmTasks('grunt-jasmine-node')
	grunt.loadNpmTasks('grunt-browserify')


	grunt.initConfig

		# watch files
		watch:
			coffee:
				files: 'coffee/**/*.coffee'
				tasks: ['jasmine_node','browserify', 'copy']
			
			js: 
				files: ['js/barbershop.js']
				tasks: ['copy']


		browserify:
			'js/barbershop.js':
				src: 'coffee/photoshop.index.coffee'


		copy:
			dist:
				src: ['js/barbershop.js']
				dest: '/Applications/Adobe\ Photoshop\ CS3/Presets/Scripts/barbershop.jsx' 


		jasmine_node:
			spec: "./spec"
			projectRoot: "."
			requirejs: false
			forceExit: true
			extensions: "js|coffee"
			isVerbose: true


	# task
	grunt.registerTask('default', ['watch'])
	grunt.registerTask('test', ['jasmine_node'])
	grunt.registerTask('compile', ['browserify'])