'use strict';

(function(exports) {
    exports.containsTagInSelector = function(selector, tag) {
        var containsTag = false;
        var elements = selector.split(' ');
        if (elements[elements.length - 1].indexOf(tag) > -1) {
            containsTag = true;
        }
        return containsTag;
    };

    exports.removeDuplicates = function (arr) {
        var i,
            len = arr.length,
            out = [],
            obj = {};

        for (i = 0; i < len; i++) {
            obj[arr[i]] = 0;
        }
        for (i in obj) {
            out.push(i);
        }
        return out;
    };

    exports.getProtocolHostPath = function (url) {
        var protocolAndHostRegex = new RegExp('^((?:ht)tp(?:s)?\://([^/]+))', 'im');
        var protocolAndHost = url.match(protocolAndHostRegex)[1].toString();
        var pathRegex = /([^:\/\s]+)((\/\w+)*\/)/;
        var path = url.match(pathRegex)[2].toString();
        return protocolAndHost + path;
    };
})(typeof exports === 'undefined' ? this['common'] = {} : exports);