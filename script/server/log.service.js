(function(exports) {
    var log4js = require('log4js'),
        logger = log4js.getLogger('madmax'),
        emailer = require('nodemailer');

    (function() {
        var fs = require("fs");
        try {
            fs.mkdirSync('logs', 0777);
            fs.chmodSync('logs', 0777);
        } catch(dirExists) {
        } finally {
            log4js.addAppender(log4js.fileAppender('logs/madmax.' + toDateString() + '.log'), 'madmax');
            logger.setLevel('INFO');
            emailer.SMTP = { host: 'smtp.madmobile.com' };
        }
    }());

    exports.clientError = function(client, error) {
        var entry = client + '\n' + toString(error);
        logger.error(entry);
        sendEmail('Client', entry);
    };

    exports.uncaughtException = function(error) {
        var entry = toErrorString('UncaughtException', error);
        logger.error(entry);
        sendEmail('UncaughtException', entry);
        return entry;
    };

    exports.fatal = function(message, error) {
        var entry = toErrorString(message, error);
        logger.fatal(entry);
        sendEmail('Fatal', entry);
        return entry;
    };

    exports.error = function(message, error) {
        var entry = toErrorString(message, error);
        logger.error(entry);
        sendEmail('Error', entry);
        return entry;
    };

    exports.warn = function(message, error) {
        var entry = toErrorString(message, error);
        logger.warn(entry);
        sendEmail('Warn', entry);
        return entry;
    };

    exports.info = function(message) {
        logger.info(toString(message));
    };

    exports.debug = function(message) {
        logger.debug(toString(message));
    };

    function toDateString() {
        var date = new Date();
        return date.getFullYear() + '.' + date.getDate() + '.' + date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds();
    }

    function toErrorString(message, error) {
        return 'Message: ' + toString(message) + '\n' + error.stack;
    }

    function toString(message) {
        if (message) {
            return JSON.stringify(message, null, 4);
        } else {
            return "";
        }
    }

    function sendEmail(type, message) {
        try {
            emailer.send_mail(
                {
                    sender: 'madmax@madmobile.com',
                    to:'madmax@madmobile.com',
                    subject:'Madmax ' + type + ' Message',
                    body: message
                },
                function(error, success) {
                    if (error || (success === false)) {
                        logger.fatal('Failed to send email: ' + toString(error));
                    }
                }
            );
        } catch(error) {
            logger.fatal('Failed to send email: ' + toString(error));
        }
    }
})(exports);