export { Logger, LoggerClass };
class Logger {
    /**
     *
     * @param {string} str Message to log
     * @param {string | undefined}log Optional - Shows in Log
     */
    static log(str, log) {
        if (typeof log === "string") {
            console.warn(` §l§e${log} §r- ${str}`);
        }
        else {
            console.warn(` §l§eStandard §r- ${str} `);
        }
    }
}
class LoggerClass {
    constructor(loggerId) {
        this.loggerId = loggerId;
    }
    log(str) {
        Logger.log(str, this.loggerId);
    }
}
