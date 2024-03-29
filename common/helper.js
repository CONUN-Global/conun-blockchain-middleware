// logger impl
const log4js = require('log4js');

class helper {
    static getLogger(modulName) {
        const logger = log4js.getLogger(modulName);

        let appLog = 'logs/app/app.log';
        let workerLog = 'logs/worker/worker.log';
        let dbLog = 'logs/db/db.log';
        let appLevel = 'debug';
        let dbLelvel = 'debug';

        if (process.env.LOG_LEVEL_APP) {
            appLevel = process.env.LOG_LEVEL_APP;
        }


        if (process.env.LOG_LEVEL_DB) {
            dbLog = process.env.LOG_LEVEL_DB;
        }

        // setup logging conf..
        const logConfig = {
            appenders: {
                "app": {
                    type: 'dateFile',
                    filename: appLog,
                    pattern: "-yyyy-MM-dd",
                    maxLogSize: 8 * 1024 * 1024,
                    numBackups: 7
                },
                "worker": {
                    type: 'dateFile',
                    filename: workerLog,
                    pattern: "-yyyy-MM-dd",
                    maxLogSize: 8 * 1024 * 1024,
                    numBackups: 7
                },
                "db": {
                    type: 'dateFile',
                    filename: dbLog,
                    pattern: "-yyyy-MM-dd",
                    maxLogSize: 8 * 1024 * 1024,
                    numBackups: 7
                }
            },
            categories: {
                default: {appenders: ["app"], level: appLevel},
                worker: {appenders: ["worker"], level: 'all'},
                MongoDB: {appenders: ["db"], level: dbLelvel}
            }
        };

        log4js.configure(logConfig);

        return logger;
    }
}

// const logger = helper.getLogger('uncaughtException');
//
// process.on('uncaughtException', ex => {
//     logger.error('>> uncaughtException: ', ex);
// });

module.exports = helper;
