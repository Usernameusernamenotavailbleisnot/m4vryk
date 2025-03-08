const { retryOperation } = require('../../utils/retry');
const { logWithAddress } = require('../../utils/logger');
const { checkSufficientBalance } = require('../balance/getBalance');
const config = require('../../../config/config.json');

const removeNativeLiquidity = async (mavryk, poolContract, amount, address, proxy = null) => {
  const logger = logWithAddress(address);
  
  try {
    logger.info(`==== REMOVING NATIVE LIQUIDITY ====`);
    logger.info(`Preparing removeLiquidity transaction for ${(amount / 1000000).toFixed(6)} ṁ...`);
    
    // Check if balance is sufficient for fees
    const isBalanceSufficient = await checkSufficientBalance(
      config.rpcUrl,
      address,
      5000, // Minimum for fees
      proxy
    );
    
    if (!isBalanceSufficient) {
      logger.error(`Insufficient balance for operation fees`);
      return null;
    }
    
    // Execute the operation with retry
    const operation = await retryOperation(async () => {
      return poolContract.methods.removeLiquidity(
        'mav',
        amount.toString()
      ).send();
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
    logger.error(`Error removing native liquidity: ${error.message}`);
    if (error.errors) {
      logger.error(`Error details: ${JSON.stringify(error.errors, null, 2)}`);
    }
    return null;
  }
};

module.exports = {
  removeNativeLiquidity
};