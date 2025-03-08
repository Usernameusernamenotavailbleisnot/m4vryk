const retry = require('async-retry');
const { logger } = require('./logger');
const config = require('../../config/config.json');

// Generic retry wrapper function
const retryOperation = async (operation, options = {}) => {
  const retryOptions = {
    ...config.retryOptions,
    ...options,
    onRetry: (error, attempt) => {
      logger.warn(`Retry attempt ${attempt} due to: ${error.message}`);
      if (options.onRetry) {
        options.onRetry(error, attempt);
      }
    }
  };

  return retry(async (bail, attempt) => {
    try {
      return await operation();
    } catch (error) {
      // Some errors should not be retried
      if (error.message && (
        error.message.includes('NotEnoughBalance') ||
        error.message.includes('delegate.unchanged')
      )) {
        bail(error);
        return;
      }
      
      // Log retry attempt
      logger.warn(`Operation failed (attempt ${attempt}): ${error.message}`);
      
      // Rethrow to trigger retry
      throw error;
    }
  }, retryOptions);
};

module.exports = {
  retryOperation
};