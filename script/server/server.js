'use strict';

(function() {
    var dbservice = require('./db.service.js'),
        httpService = require('./http.service.js'),
        socketIoListener = require('./socket.io.listener.js'),
        port = process.argv[2],
        host = process.argv[3];

    dbservice.connect('mongodb://' + host + '/madmaxdb');
    socketIoListener.listen(httpService.connect(port, host));
}());