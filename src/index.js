const { processAllWallets } = require('./app');
const { logger } = require('./utils/logger');

// Handling unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Handling uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

// Start the application
logger.info('Starting Mavryk Operations Tool...');

processAllWallets()
  .catch(error => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });