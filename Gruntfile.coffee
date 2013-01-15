module.exports = (grunt) ->

	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-contrib-coffee')
	grunt.loadNpmTasks('grunt-contrib-copy')
	grunt.loadNpmTasks('grunt-contrib-concat')


	grunt.initConfig

		# watch files
		watch:
			coffee:
				files: 'coffee/**/*.coffee'
				tasks: ['coffee', 'concat', 'copy']
			
			js: 
				files: ['js/*.js', 'js/lib/*.js']
				tasks: ['concat', 'copy']


		coffee:
			compile:
				options:
					bare: true

				files:
					'js/settings.js': 'coffee/settings.coffee'
					'js/all.js': ['coffee/utils.coffee', 'coffee/dialog.coffee', 'coffee/barbershop.coffee', 'coffee/index.coffee']


		concat:
			dist:
				src: ['js/settings.js', 'js/lib/csv2array.js', 'js/all.js']
				dest: 'build/barbershop.jsx'


		copy:
			dist:
				src: ['build/barbershop.jsx']
				dest: '/Applications/Adobe\ Photoshop\ CS5/Presets/Scripts/barbershop.jsx' 


	# task
	grunt.registerTask('default', ['watch'])