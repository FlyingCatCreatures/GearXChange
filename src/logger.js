const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logFilePath = path.join(__dirname, 'log.txt');
        // Right now we're electing to log errors to the same file as the log
        //this.errorLogFilePath = path.join(__dirname, 'errorlog.txt');
        this.errorLogFilePath = this.logFilePath;
        
        // Clear the log file if it already exists
        if (fs.existsSync(this.logFilePath)) {
            fs.writeFileSync(this.logFilePath, '', 'utf8');
        }
    }

    log(...msgs) {
        const timestamp = new Date().toISOString();
        const logMessage = `[LOG] [${timestamp}] ${msgs.join(' ')}\n`;
        fs.appendFileSync(this.logFilePath, logMessage, 'utf8');
    }

    error(...msgs) {
        const timestamp = new Date().toISOString();
        const errorMessage = `[ERROR] [${timestamp}] ${msgs.join(' ')}\n`;
        fs.appendFileSync(this.errorLogFilePath, errorMessage, 'utf8');
    }
}

// Singleton class just like the database class
const logger = new Logger();
module.exports = logger;