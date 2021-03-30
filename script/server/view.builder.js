'use strict';

(function(exports) {
    var fs = require("fs"),
        logService = require('./log.service.js');

    exports.build = function(message, socket) {
        var date = new Date();
        var file = 'temp/127.0.0.1.' + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() + '.html';
        var content = buildContent(message.view.objects, message.view.head);
        fs.writeFile(file, content, function (error) {
            if (error) {
                onError(message, error, socket);
            } else {
                message.view.url = file;
                message.view.objects = [];
                message.view.head = "";
                message.view.content = content;
                socket.emit('buildView', message);
            }
        });
    };

    function buildContent(objects, head) {
        var content = "";
        var properties;
        var values;
        for (var i = 0, l = objects.length; i < l; i += 1) {
            properties = objects[i].properties;
            if (properties.length > 0) {
                for (var j = 0, ll = properties.length; j < ll; j += 1) {
                    values = properties[j].values;
                    for (var k = 0, lll = values.length; k < lll; k += 1) {
                        content += values[k];
                    }
                }
            } else {
                values = objects[i].values;
                for (var m = 0, llll = values.length; m < llll; m += 1) {
                    content += values[m];
                }
            }
        }
        return '<html>\n' + head + '<body>' + content + '</body>\n</html>';
    }

    function onError(message, error, socket) {
        message.view.objects = [];
        message.view.code = 500;
        message.view.error = error.message;
        logService.error(message, error);
        socket.emit('buildView', message);
    }
})(exports);