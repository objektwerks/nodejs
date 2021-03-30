(function(exports) {
    var http = require("http"),
        url = require("url"),
        path = require("path"),
        fs = require("fs"),
        logService = require('./log.service.js');

    (function() {
        var fs = require("fs"),
            logService = require('./log.service.js');

        fs.readdir('temp', function(error, files) {
            if (!error) {
                try {
                    for (var i = 0, l = files.length; i < l; i += 1) {
                        fs.unlinkSync('temp/' + files[i]);
                    }
                    fs.rmdirSync('temp');
                } catch(e) {
                    logService.fatal('Failed to remove temp directory:' + e);
                    throw e;
                }
            }
            try {
                fs.mkdirSync('temp', 0777);
                fs.chmodSync('temp', 0777);
            } catch(error) {
                logService.fatal('Failed to create temp directory: ' + error);
                throw error;
            }
        });
    }());

    exports.connect = function(port, host) {
        var server = http.createServer(httpServer);
        server.listen(port, host, function() {
            logService.info('MadMax Http Server bound to port:' + port + ' host:' + host + ' pid: ' + process.pid);
        });
        return server;
    };

    function httpServer(request, response) {
        var uri = url.parse(request.url).pathname;
        uri = (uri === '/') ? '/index.html' : uri;
        var filename = path.join(process.cwd(), uri);
        path.exists(filename, function(exists) {
            if (!exists) {
                writeError(response, 404, {"Content-Type": "text/plain"}, "404 Not Found\n");
                return;
            }
            fs.readFile(filename, "binary", function(error, file) {
                if (error) {
                    writeError(response, 500, {"Content-Type": "text/plain"}, error + "\n");
                } else {
                    writeFile(uri, response, 200, file, "binary");
                }
            });
        });
    }

    function writeError(response, code, header, error) {
        response.writeHead(code, header);
        response.end(error);
    }

    function writeFile(uri, response, code, file, type) {
        response.writeHead(code, {"Content-Type": createContentType(uri), "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "X-Requested-With"});
        response.end(file, type);
    }

    function createContentType(uri) {
        var contentType;
        if (uri.indexOf('.css') > -1) {
            contentType = "text/css";
        } else if (uri.indexOf('.js') > -1) {
            contentType = "text/javascript";
        } else if (uri.indexOf('.html') > -1) {
            contentType = "text/html";
        } else if (uri.indexOf('.png') > -1) {
            contentType = "image/png";
        } else if (uri.indexOf('.gif') > -1) {
            contentType = "image/gif";
        } else {
            contentType = "text/plain";
        }
        return contentType;
    }
})(exports);