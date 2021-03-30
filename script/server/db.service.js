'use strict';

(function(exports) {
    var mongoose = require('mongoose'),
        logService = require('./log.service.js');

    exports.connect = function(url) {
        mongoose.connect(url);
        logService.info('MadMax connected to MongoDB, url: ' + url + ' pid: ' + process.pid);
    };
})(exports);