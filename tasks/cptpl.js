/*
 * grunt-cptpl-underscore
 * https://github.com/XIAOGUIGUI/grunt-cptpl-underscore
 *
 * Copyright (c) 2018 gui
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var ENGINES_MAP = {
        hogan: function (t) {
            return 'Hogan.compile(' + t + ');'
        },

        handlebars: function (t) {
            return 'Handlebars.compile(' + t + ');'
        },

        arttemplate: function (t) {
            return 'template.compile(' + t + ');'
        },

        underscore: function (t) {
            return '_.template(' + t + ');'
        },

        juicer: function (t) {
            return 'juicer(' + t + ');'
        },

        dot: function (t) {
            return 'doT.template(' + t + ');'
        },

        kissy: function (t) {
            return 'KISSY.Template(' + t + ');'
        },

        baidutemplate: function (t) {
            return 'baidu.template(' + t + ');'
        }
    }

    var ln = grunt.util.normalizelf('\n');
    var fileNameReg = /\/([^\/\\]+?)(\.[a-zA-z\d]+)?$/gi;

    grunt.registerMultiTask('cptpl', 'Compiled template files into JavaScript files', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            banner: '',
            engine: 'handlebars',
            context: 'window',
            reName: function (name) {return name;},
            customEngines: {}
        });

        for(var key in options.customEngines){
            ENGINES_MAP[key.toLowerCase()] = options.customEngines[key];
        }

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {

            // Filte specified files.
            var src = f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                    // Read file source.
                    var name = filepath.replace('\\', '\/')
                        .split('\/')
                        .pop()
                        .replace(/\..*$/, '');
                    var content = grunt.util.normalizelf(grunt.file.read(filepath))
                        .split(ln)
                        .map(function (line) {return line.trim()})
                        .join('');
                    return {name: name,content: content};
            });

            // Ouput into js files
            src.forEach(function (item, i, src) {
                var start, end;
                console.log(f.dest.lastIndexOf('/'))
                //var dest = f.dest.charAt(f.dest.length-1) === '/' ? f.dest : f.dest + '/';
                var dest =  f.dest.substring(0,f.dest.lastIndexOf('/')+1)
                console.log(f.dest)
                console.log(dest)
                var name = options.reName(item.name);
                var content = ENGINES_MAP[options.engine.toLowerCase()]('\'' + item.content
                    .replace(/\"/gi, '\\\"')
                    .replace(/\'/gi, '\\\'')
                    .trim() + '\''
                );

                switch (options.context){
                    case '{AMD}':
                        start = ';define(function() { ' + ln + '    return ';
                        end   = ln + '});'
                        break;
                    case '{CMD}':
                        start = 'define(function(require, exports, module) {'+'\n' +' var _ = require("underscore");'+'\n' + ln + '    module.exports = ';
                        end   = ln + '});'
                        break;
                    default:
                        start = ';' + options.context + '.' + name + ' = ';
                        end   = '';
                }
                content = options.banner + start + content + end;
                grunt.file.write(dest + name + '.js', content);
            });

            // Print a success message.
            grunt.log.writeln(src.length + ' files created.');
        });
    });

};
