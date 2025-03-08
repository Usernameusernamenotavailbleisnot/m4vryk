const winston = require('winston');
const moment = require('moment');
const chalk = require('chalk');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

// Function to mask wallet address
const maskWalletAddress = (address) => {
  if (!address) return 'unknown';
  if (address.length <= 8) return address;
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, address }) => {
  const formattedTimestamp = moment(timestamp).format('DD/MM/YYYY - HH:mm:ss');
  const maskedAddress = maskWalletAddress(address);
  
  // Color selection based on log level
  let colorizedMessage;
  switch (level) {
    case 'error':
      colorizedMessage = chalk.red(message);
      break;
    case 'warn':
      colorizedMessage = chalk.yellow(message);
      break;
    case 'info':
      colorizedMessage = chalk.green(message);
      break;
    case 'debug':
      colorizedMessage = chalk.blue(message);
      break;
    default:
      colorizedMessage = message;
  }
  
  return `[${formattedTimestamp} - ${maskedAddress}] ${colorizedMessage}`;
});

// Custom format for file output (without colors)
const fileFormat = printf(({ level, message, timestamp, address }) => {
  const formattedTimestamp = moment(timestamp).format('DD/MM/YYYY - HH:mm:ss');
  const maskedAddress = maskWalletAddress(address);
  return `[${formattedTimestamp} - ${maskedAddress}] ${message}`;
});

// Create the logger
const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    fileFormat
  ),
  transports: [
    // Write to all logs with level 'info' and below to combined.log
    new transports.File({ filename: 'logs/combined.log' }),
    // Write all logs error (and below) to error.log
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Console transport with colors
    new transports.Console({
      format: combine(
        timestamp(),
        consoleFormat
      )
    })
  ]
});

// Helper function to log with wallet address context
const logWithAddress = (address) => {
  return {
    error: (message) => logger.error(message, { address }),
    warn: (message) => logger.warn(message, { address }),
    info: (message) => logger.info(message, { address }),
    debug: (message) => logger.debug(message, { address })
  };
};

module.exports = {
  logger,
  logWithAddress,
  maskWalletAddress
};