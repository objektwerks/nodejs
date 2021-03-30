'use strict';

(function(exports) {
    var io = require('socket.io'),
        logService = require('./log.service.js'),
        queryModel = require('./query.model.js'),
        resourceReader = require('./resource.reader.js'),
        queryExecutor = require('./query.executor.js'),
        templateBuilder = require('./view.builder.js'),
        manager;

    process.on('uncaughtException', function (error) {
        logService.uncaughtException(error);
    });

    exports.listen = function(httpService) {
        manager = io.listen(httpService);
        manager.configure(function() {
            manager.set('log level', 1);
        });
        manager.sockets.on('connection', function(socket) {
            logService.info('Client [' + socket.id + '] connected.');
            onDisconnect(socket);
            onLog(socket);
            onNewQuery(socket);
            onSaveQuery(socket);
            onFindQuery(socket);
            onListQueryNames(socket);
            onReadResource(socket);
            onExecuteQuery(socket);
            onBuildView(socket);
        });
    };

    function onDisconnect(socket) {
        socket.on('disconnect', function(message) {
            logService.info('Client disconnected: ' + message);
        });
    }

    function onLog(socket) {
        socket.on('log', function(message) {
            logService.clientError('Client [' + socket.id + ']', message);
        });
    }

    function onNewQuery(socket) {
        socket.on('newQuery', function(message) {
            queryModel.newQuery(message, socket);
        });
    }

    function onSaveQuery(socket) {
        socket.on('saveQuery', function(message) {
            queryModel.saveQuery(message, socket);
        });
    }

    function onFindQuery(socket) {
        socket.on('findQuery', function(message) {
            queryModel.findQuery(message, socket);
        });
    }

    function onListQueryNames(socket) {
        socket.on('listQueryNames', function() {
            queryModel.listQueryNames(socket);
        });
    }

    function onReadResource(socket) {
        socket.on('readResource', function(message) {
            resourceReader.read(message, socket);
        });
    }

    function onExecuteQuery(socket) {
        socket.on('executeQuery', function(message) {
            queryExecutor.execute(message, socket);
        });
    }

    function onBuildView(socket) {
        socket.on('buildView', function(message) {
            templateBuilder.build(message, socket);
        });
    }
})(exports);