'use strict';

(function(exports) {
    var jsdom = require('jsdom'),
        parser = require('url'),
        common = require('../shared/common.js'),
        fs = require("fs"),
        request = require('request'),
        logService = require('./log.service.js'),
        jQueryLib = 'http://code.jquery.com/jquery-1.6.4.min.js';

    exports.read = function(message, socket) {
        try {
            var type = message.resource.type;
            if (type === 'html') {
                handleHtml(message, socket);
            } else if (type === 'css' || type === 'js' || type === 'template') {
                handleResource(message, socket);
            } else {
                onError(message, new Error('Invalid type: ' + message.resource.type), socket);
            }
        } catch(error) {
            onError(message, error, socket);
        }
    };

    function handleHtml(message, socket) {
        jsdom.env(message.resource.url, [ jQueryLib ], {
            config: {
                features: {
                    FetchExternalResources   : false,
                    ProcessExternalResources : false,
                    MutationEvents           : false,
                    QuerySelector            : false
                }
            }}, function (error, window) {
            if (error) {
                onError(message, error, socket);
            } else {
                var $ = window.$;
                var url = message.resource.url;
                var hostname = parser.parse(url).hostname;
                var host = common.getProtocolHostPath(url);
                var base = "\n    <base href=" + host + "/>";
                $('head').prepend(base);
                var date = new Date();
                var file = 'temp/' + hostname + '.' + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() + '.html';
                var content = $('html').html();
                fs.writeFile(file, content, function (error) {
                    if (error) {
                        onError(message, error, socket);
                    } else {
                        message.resource.url = '../' + file;
                        message.resource.content = content;
                        socket.emit('readResource', message);
                    }
                    content = null;
                });
            }
        });
    }

    function handleResource(message, socket) {
        request(message.resource.url, function (error, response, body) {
            if (error) {
                onError(message, error, socket);
            } else {
                message.resource.content = body;
                socket.emit('readResource', message);
            }
        });
    }

    function onError(message, error, socket) {
        message.resource.code = 500;
        message.resource.error = error.message;
        logService.error(message, error);
        socket.emit('readResource', message);
    }
})(exports);