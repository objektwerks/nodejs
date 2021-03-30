'use strict';

(function(exports) {
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        messageFactory = require('../shared/message.factory.js'),
        logService = require('./log.service.js');

    var SubSelectorSchema = new Schema({
        name       : { type : String },
        selector   : { type : String }
    });
    
    var SelectorSchema = new Schema({
        name         : { type : String },
        selector     : { type : String },
        subselectors : [SubSelectorSchema]
    });

    var QuerySchema = new Schema({
        name      : { type : String, unique: true },
        url       : { type : String },
        selectors : [SelectorSchema],
        head      : { type : String },
        template  : { type : String }
    });

    var Query = mongoose.model('Query', QuerySchema);

    exports.newQuery = function(message, socket) {
        var newInstance = new Query();
        newInstance.name = message.query.name;
        newInstance.url = message.query.url;
        newInstance.selectors = message.query.selectors;
        newInstance.head = message.query.head;
        newInstance.template = message.query.template;
        newInstance.save(function(error) {
            var query;
            if (!error) {
                query = messageFactory.createQuery(newInstance._id, newInstance.name, newInstance.url, newInstance.selectors, newInstance.head, newInstance.template);
            } else {
                query = onQueryError(query);
                logService.error(message, error);
            }
            socket.emit('newQuery', query);
        });
    };

    exports.saveQuery = function(message, socket) {
        Query.findById(message.query.id, function(error, instance) {
            if (!error) {
                instance.url = message.query.url;
                instance.selectors = message.query.selectors;
                instance.head = message.query.head;
                instance.template = message.query.template;
                instance.save(function(error) {
                    var status;
                    if (!error) {
                        status = messageFactory.createStatus(200, "");
                    } else {
                        status = messageFactory.createStatus(500, error);
                        logService.error(message, error);
                    }
                    socket.emit('saveQuery', status);
                });
            } else {
                socket.emit('saveQuery', messageFactory.createStatus(500, error));
            }
        });
    };

    exports.findQuery = function(message, socket) {
        Query.find({name: message.finder.name}, function(error, instance) {
            var query;
            if (!error) {
                query = messageFactory.createQuery(instance[0]._id, instance[0].name, instance[0].url, instance[0].selectors, instance[0].head, instance[0].template);
            } else {
                query = onQueryError(query);
                logService.error(message, error);
            }
            socket.emit('findQuery', query);
        });
    };

    exports.listQueryNames = function(socket) {
        Query.find({}, function(error, instances) {
            var list;
            var names = [];
            if (!error) {
                for (var i = 0, l = instances.length; i < l; i += 1) {
                    names[i] = instances[i].name;
                }
                names.sort();
                names.reverse();
                list = messageFactory.createList(names);
            } else {
                list = messageFactory.createList(names, 500, error);
                logService.error('listQueryNames', error);
            }
            socket.emit('listQueryNames', list);
        });
    };

    exports.executeQuery = function(message, callback) {
        Query.find({name: message.executor.name}, function(error, instance) {
            var query;
            if (!error) {
                query = messageFactory.createQuery(instance[0]._id, instance[0].name, instance[0].url, instance[0].selectors, instance[0].head, instance[0].template);
            } else {
                query = onQueryError(query);
            }
            callback(query.query);
        });
    };

    function onQueryError(query) {
        query = messageFactory.createQuery();
        query.code = 500;
        query.error = error.message;
        return query;
    }
})(exports);