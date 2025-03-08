const { getCurrentDelegation, delegateToRandomBaker } = require('./delegateToBaker');
const { logWithAddress } = require('../../utils/logger');
const { VALIDATORS } = require('../../../config/constants');
const config = require('../../../config/config.json');

// Function to execute redelegation process
const executeRedelegationProcess = async (mavryk, iterations, address, proxy = null) => {
  const logger = logWithAddress(address);
  
  try {
    logger.info(`Starting redelegation process for ${iterations} iterations`);
    
    let currentValidatorId = await getCurrentDelegation(mavryk, address);
    logger.info(`Current delegation: Validator ${currentValidatorId || 'None'}`);
    
    // If not currently delegating, pick a random validator
    if (currentValidatorId === null) {
      currentValidatorId = Math.floor(Math.random() * VALIDATORS.length) + 1;
      logger.info(`Not currently delegating, will start with random validator`);
    }
    
    // Perform the specified number of redelegations
    for (let i = 0; i < iterations; i++) {
      logger.info(`Redelegation iteration ${i + 1} of ${iterations}`);
      
      // Delegate to a random baker different from current
      const result = await delegateToRandomBaker(mavryk, currentValidatorId, address, proxy);
      
      // Update current validator if delegation was successful
      if (result) {
        currentValidatorId = await getCurrentDelegation(mavryk, address);
        logger.info(`New delegation: Validator ${currentValidatorId || 'None'}`);
        
        // Add delay between iterations
        if (i < iterations - 1) {
          logger.info(`Waiting ${config.delay.betweenOperations / 1000} seconds before next redelegation...`);
          await new Promise(resolve => setTimeout(resolve, config.delay.betweenOperations));
        }
      } else {
        logger.error(`Redelegation failed, skipping to next iteration`);
      }
    }
    
    logger.info(`Redelegation process completed`);
    return true;
  } catch (error) {
    logger.error(`Error in redelegation process: ${error.message}`);
    return false;
  }
};

module.exports = {
  executeRedelegationProcess
};