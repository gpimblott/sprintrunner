'use strict';
const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, prettyPrint } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level} [${label}]: ${message}`;
});

// Return the last folder name in the path and the calling
// module's filename.
let getLabel = function (callingModule) {
    let parts = callingModule.filename.split(path.sep);
    return path.join(parts[ parts.length - 2 ], parts.pop());
};

module.exports = function (callingModule) {
    return createLogger({
        level: 'info',
        format: format.combine(
            format.colorize(),
            format.label({ label : getLabel(callingModule)}),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.splat(),
            myFormat
        ),
        transports: [
            new transports.File({ filename: 'prototyper-error.log', level: 'error' }),
            new transports.Console()
        ]
    });
};