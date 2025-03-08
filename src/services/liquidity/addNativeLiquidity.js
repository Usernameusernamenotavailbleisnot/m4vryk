const { retryOperation } = require('../../utils/retry');
const { logWithAddress } = require('../../utils/logger');
const { checkSufficientBalance } = require('../balance/getBalance');
const config = require('../../../config/config.json');

const addNativeLiquidity = async (mavryk, poolContract, amount, address, proxy = null) => {
  const logger = logWithAddress(address);
  
  try {
    logger.info(`==== ADDING NATIVE LIQUIDITY ====`);
    // Display human-readable amount (in tokens)
    logger.info(`Preparing addLiquidity transaction with ${(amount / 1000000).toFixed(6)} ṁ...`);
    
    // Check if balance is sufficient
    const isBalanceSufficient = await checkSufficientBalance(
      config.rpcUrl,
      address,
      amount,
      proxy
    );
    
    if (!isBalanceSufficient) {
      logger.error(`Insufficient balance for adding native liquidity`);
      return null;
    }
    
    // Execute the operation with retry
    const operation = await retryOperation(async () => {
      return poolContract.methods.addLiquidity(
        'mav',
        amount.toString()
      ).send({
        amount: amount / 1000000, 
        mutez: false
      });
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
    logger.error(`Error adding native liquidity: ${error.message}`);
    if (error.errors) {
      logger.error(`Error details: ${JSON.stringify(error.errors, null, 2)}`);
    }
    return null;
  }
};

module.exports = {
  addNativeLiquidity
};