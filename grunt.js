module.exports = function(grunt) {

	// run `npm link` first to install packages
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.initConfig({

		// look for changes
		watch: {
			coffee: {
				files: 'coffee/*.coffee',
				tasks: ['coffee', 'concat', 'copy']
			},
			js: {
				files: ['js/*.js', 'lib/*.js'],
				tasks: ['concat', 'copy']
			}
		},

		// compile coffeescripts
		coffee: {
			compile: {
				files: {
					'js/settings.js': 'coffee/settings.coffee',
				 	'js/all.js': ['coffee/utils.coffee', 'coffee/dialog.coffee', 'coffee/barbershop.coffee', 'coffee/index.coffee']
				},
				options: {
					bare: true
				}
			}
		},

		// join all files
		concat: {
			dist: {
				src: ['js/settings.js', 'js/lib/csv2array.js', 'js/all.js'],
				dest: 'build/barbershop.jsx'
			}
		},

		// copy files to photoshop scripts directory
		copy: {
			dist: {
				files: {
					"/Applications/Adobe\ Photoshop\ CS5/Presets/Scripts/barbershop.jsx": "build/barbershop.jsx"
				}
			}
		}
	});

	// task
	grunt.registerTask('default', 'watch');
};