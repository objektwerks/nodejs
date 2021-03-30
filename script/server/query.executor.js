'use strict';

(function(exports) {
    var queryModel = require('./query.model.js'),
        jsdom = require('jsdom'),
        common = require('../shared/common.js'),
        messageFactory = require('../shared/message.factory.js'),
        logService = require('./log.service.js'),
        jQueryLib = 'http://code.jquery.com/jquery-1.6.4.min.js';

    exports.execute = function(message, socket) {
        queryModel.executeQuery(message, function (query) {
            if (query.code == 200) {
                try {
                    jsdom.env(query.url, [ jQueryLib ], {
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
                            var selectors = query.selectors;
                            var subselectors;
                            var object;
                            var property;
                            for (var i = 0, l = selectors.length; i < l; i += 1) {
                                object = messageFactory.createObject(selectors[i].name);
                                subselectors = selectors[i].subselectors;
                                if (subselectors.length > 0) {
                                    for (var j = 0, ll = subselectors.length; j < ll; j += 1) {
                                        property = messageFactory.createProperty(subselectors[j].name);
                                        property.values = executeSelector($, query.url, selectors[i].selector, subselectors[j].selector);
                                        object.properties.push(property);
                                    }
                                } else {
                                    object.values = executeSelector($, query.url, selectors[i].selector);
                                }
                                message.executor.objects.push(object);
                            }
                            message.executor.head = query.head;
                            socket.emit('executeQuery', message);
                        }
                    });
                } catch(error) {
                    onError(message, error, socket);
                }
            } else {
                onError(message, new Error(query.error), socket);
            }
        });
    };

    function executeSelector($, url, selector, subselector) {
        var containsImgTagInSelector;
        var containsATagInSelector;
        var results;
        var values = [];
        if (subselector) {
            containsImgTagInSelector = common.containsTagInSelector(subselector, 'img');
            containsATagInSelector = common.containsTagInSelector(subselector, 'a')
            results = $(selector).find(subselector);
        } else {
            containsImgTagInSelector = common.containsTagInSelector(selector, 'img');
            containsATagInSelector = common.containsTagInSelector(selector, 'a')
            results = $(selector);
        }
        results.each(function() {
            if (containsImgTagInSelector && $(this).attr('src')) {
                if ($(this).attr('src').indexOf('http') === -1) {
                    values.push(common.getProtocolHostPath(url) + $(this).attr('src'));
                } else {
                    values.push($(this).attr('src'));
                }
            } else if (containsATagInSelector && $(this).attr('href')) {
                if ($(this).attr('href').indexOf('http') === -1) {
                    values.push(common.getProtocolHostPath(url) + $(this).attr('href'));
                } else {
                    values.push($(this).attr('href'));
                }
            } else {
                values.push($(this).html());
            }
        });
        return values;
    }

    function onError(message, error, socket) {
        message.executor.code = 500;
        message.executor.error = error.message;
        logService.error(message, error);
        socket.emit('executeQuery', message);
    }
})(exports);