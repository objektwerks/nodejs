'use strict';

(function(exports) {
    exports.createQuery = function(id, name, url, selectors, head, template) {
        return {"query": {
            "id": id || "",
            "name": name || "",
            "url": url || "",
            "selectors": selectors || [],
            "head": head || "",
            "template": template || "",
            "code" : 200,
            "error" : ""
        }};
    };

    exports.createSelector = function(name, selector, subselectors) {
        return {
            "name": name,
            "selector": selector,
            "subselectors": subselectors || []
        };
    };

    exports.createSubSelector = function(name, selector) {
        return {
            "name": name,
            "selector": selector
        };
    };

    exports.createList = function(names) {
        return {"list": {
            "names": names,
            "code" : 200,
            "error" : ""
        }};
    };

    exports.createFinder = function(name) {
        return {"finder": {
            "name": name,
            "code" : 200,
            "error" : ""
        }};
    };

    exports.createResource = function(url, type) {
        return {"resource": {
            "url": url,
            "type": type,
            "content": "",
            "code" : 200,
            "error" : ""
        }};
    };

    exports.createView = function(objects, head) {
        return {"view": {
            "objects": objects,
            "head": head || "",
            "url": "",
            "content": "",
            "code" : 200,
            "error" : ""
        }};
    };

    exports.createExecutor = function(name) {
        return {"executor": {
            "name": name,
            "head": "",
            "objects": [],
            "code" : 200,
            "error" : ""
        }};
    };

    exports.createObject = function(name) {
        return {
            "name": name,
            "values": [],
            "properties": []
        };
    }

    exports.createProperty = function(name) {
        return {
            "name": name,
            "values": []
        };
    };

    exports.createStatus = function(code, error) {
        return {"status": {
            "code": code,
            "error": toString(error)
        }};
    };

    exports.createLog = function(message, code, error) {
        return {"log": {
            "message": message,
            "code": code,
            "error": toString(error)
        }};
    };

    function toString(error) {
        if (error) {
            return JSON.stringify(error);
        } else {
            return "";
        }
    }
})(typeof exports === 'undefined' ? this['messageFactory'] = {} : exports);