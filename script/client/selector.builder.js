jQuery.fn.extend({
    selectByClass: function(path) {
        if (typeof path === 'undefined') {
            path = '';
        }
        if (this.is('html') || this.is('body') || this.is('thead') || this.is('tbody')) {
            return path;
        }
        var node = this.get(0).nodeName.toLowerCase(),
            clazz = this.attr('class');
        if (typeof clazz != 'undefined') {
            node += '.' + clazz.split(/[\s\n]+/).join('.');
        }
        path = this.parent().selectByClass(' > ' + node + path);
        if (path.indexOf(' >') == 0) {
            path = path.substring(3, path.length);
        }
        return path;
    },

    selectById: function(path) {
        if (typeof path === 'undefined') {
            path = '';
        }
        if (this.is('html') || this.is('body') || this.is('thead') || this.is('tbody')) {
            return path;
        }
        var node = this.get(0).nodeName.toLowerCase(),
            id = this.attr('id');
        if (typeof id !== 'undefined') {
            node += '#' + id;
        }
        path = this.parent().selectById(' > ' + node + path);
        if (path.indexOf(' >') == 0) {
            path = path.substring(3, path.length);
        }
        return path;
    },

    selectByIdAndClass: function(path) {
        if (typeof path === 'undefined') {
            path = '';
        }
        if (this.is('html') || this.is('body') || this.is('thead') || this.is('tbody')) {
            return path;
        }
        var node = this.get(0).nodeName.toLowerCase(),
            id = this.attr('id'),
            clazz = this.attr('class');
        if (typeof id !== 'undefined') {
            node += '#' + id;
        }
        if (typeof clazz !== 'undefined') {
            node += '.' + clazz.split(/[\s\n]+/).join('.');
        }
        path = this.parent().selectByIdAndClass(' > ' + node + path);
        if (path.indexOf(' >') == 0) {
            path = path.substring(3, path.length);
        }
        return path;
    },

    selectByElement: function(path) {
        if (typeof path === 'undefined') {
            path = '';
        }
        if (this.is('html') || this.is('body') || this.is('thead') || this.is('tbody')) {
            return path;
        }
        var node = this.get(0).nodeName.toLowerCase();
        path = this.parent().selectByElement(' > ' + node + path);
        if (path.indexOf(' >') == 0) {
            path = path.substring(3, path.length);
        }
        return path;
    }
});