const { retryOperation } = require('../../utils/retry');
const { logWithAddress } = require('../../utils/logger');
const { checkSufficientBalance } = require('../balance/getBalance');
const { VALIDATORS } = require('../../../config/constants');
const config = require('../../../config/config.json');

// Get current delegation
const getCurrentDelegation = async (mavryk, address) => {
  try {
    const account = await mavryk.rpc.getDelegate(address);
    
    // Find matching validator
    if (account) {
      const validator = VALIDATORS.find(v => v.address === account);
      return validator ? validator.id : null;
    }
    
    return null;
  } catch (error) {
    return null; // Not currently delegating
  }
};

const delegateToBaker = async (mavryk, validatorId, address, proxy = null) => {
  const logger = logWithAddress(address);
  
  try {
    logger.info(`==== DELEGATING TO VALIDATOR ====`);
    
    // Validate validator ID
    if (validatorId < 1 || validatorId > VALIDATORS.length) {
      logger.error(`Invalid validator ID: ${validatorId}`);
      return null;
    }
    
    const selectedValidator = VALIDATORS[validatorId - 1];
    logger.info(`Delegating to validator: ${selectedValidator.address}...`);
    
    // Check if balance is sufficient for fees
    const isBalanceSufficient = await checkSufficientBalance(
      config.rpcUrl,
      address,
      5000, // Minimum for delegation fees
      proxy
    );
    
    if (!isBalanceSufficient) {
      logger.error(`Insufficient balance for delegation operation fees`);
      return null;
    }
    
    // Execute the operation with retry
    const operation = await retryOperation(async () => {
      return mavryk.wallet.setDelegate({
        delegate: selectedValidator.address
      }).send();
    }, {
      // Some errors should not be retried
      retryIf: (error) => !error.message.includes('delegate.unchanged')
    });
    
    const hash = operation.hash || operation.opHash || "unknown";
    logger.info(`Operation hash: ${hash}`);
    logger.info(`Transaction sent to blockchain.`);
    logger.info(`View status in explorer: ${config.explorerUrl}/${hash}`);
    
    logger.info("Waiting for confirmation...");
    await operation.confirmation(1);
    logger.info("Transaction confirmed!");
    
    return hash;
  } catch (error) {
    logger.error(`Error delegating to validator: ${error.message}`);
    if (error.errors) {
      logger.error(`Error details: ${JSON.stringify(error.errors, null, 2)}`);
    }
    // Special handling for common delegation errors
    if (error.message && error.message.includes('delegate.unchanged')) {
      logger.warn("You are already delegating to this validator. Please choose a different one.");
    }
    return null;
  }
};

// Function to delegate to a randomly selected validator
const delegateToRandomBaker = async (mavryk, currentValidatorId, address, proxy = null) => {
  const logger = logWithAddress(address);
  
  // Generate array of valid validator IDs (excluding current)
  const validValidatorIds = VALIDATORS
    .map(v => v.id)
    .filter(id => id !== currentValidatorId);
  
  // Randomly select one
  const randomIndex = Math.floor(Math.random() * validValidatorIds.length);
  const selectedValidatorId = validValidatorIds[randomIndex];
  
  logger.info(`Randomly selected validator ID: ${selectedValidatorId}`);
  
  return delegateToBaker(mavryk, selectedValidatorId, address, proxy);
};

module.exports = {
  getCurrentDelegation,
  delegateToBaker,
  delegateToRandomBaker
};