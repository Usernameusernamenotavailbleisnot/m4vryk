const { retryOperation } = require('../../utils/retry');
const { logWithAddress } = require('../../utils/logger');
const { checkSufficientBalance } = require('../balance/getBalance');
const config = require('../../../config/config.json');

const addUSDTLiquidity = async (mavryk, poolContract, tokenContract, amount, address, proxy = null) => {
  const logger = logWithAddress(address);
  
  try {
    logger.info(`==== ADDING USDT LIQUIDITY ====`);
    
    // Check if balance is sufficient for fees
    const isBalanceSufficient = await checkSufficientBalance(
      config.rpcUrl,
      address,
      5000, // Minimum for fees
      proxy
    );
    
    if (!isBalanceSufficient) {
      logger.error(`Insufficient balance for USDT liquidity operation fees`);
      return null;
    }
    
    // Step 1: Approve the pool contract as an operator
    logger.info("Step 1: Adding pool contract as operator...");
    
    const approveOp = await retryOperation(async () => {
      return tokenContract.methods.update_operators([
        {
          add_operator: {
            owner: await mavryk.signer.publicKeyHash(),
            operator: config.poolContractAddress,
            token_id: 0
          }
        }
      ]).send();
    });
    
    const approveHash = approveOp.hash || approveOp.opHash || "unknown";
    logger.info(`Approval operation hash: ${approveHash}`);
    logger.info(`View in explorer: ${config.explorerUrl}/${approveHash}`);
    logger.info("Waiting for approval confirmation...");
    await approveOp.confirmation(1);
    logger.info("Approval confirmed!");
    
    // Step 2: Add USDT liquidity
    logger.info(`Step 2: Adding USDT liquidity of ${(amount / 1000000).toFixed(6)} tokens...`);
    
    const addOp = await retryOperation(async () => {
      return poolContract.methods.addLiquidity(
        'usdt',
        amount.toString()
      ).send();
    });
    
    const addHash = addOp.hash || addOp.opHash || "unknown";
    logger.info(`Add liquidity operation hash: ${addHash}`);
    logger.info(`View in explorer: ${config.explorerUrl}/${addHash}`);
    logger.info("Waiting for add liquidity confirmation...");
    await addOp.confirmation(1);
    logger.info("Add liquidity confirmed!");
    
    // Step 3: Remove pool contract as operator
    logger.info(`Step 3: Removing pool contract as operator...`);
    
    const revokeOp = await retryOperation(async () => {
      return tokenContract.methods.update_operators([
        {
          remove_operator: {
            owner: await mavryk.signer.publicKeyHash(),
            operator: config.poolContractAddress,
            token_id: 0
          }
        }
      ]).send();
    });
    
    const revokeHash = revokeOp.hash || revokeOp.opHash || "unknown";
    logger.info(`Revoke operation hash: ${revokeHash}`);
    logger.info(`View in explorer: ${config.explorerUrl}/${revokeHash}`);
    logger.info("Waiting for revoke confirmation...");
    await revokeOp.confirmation(1);
    logger.info("Revoke confirmed!");
    
    return addHash;
  } catch (error) {
    logger.error(`Error in USDT liquidity process: ${error.message}`);
    if (error.errors) {
      logger.error(`Error details: ${JSON.stringify(error.errors, null, 2)}`);
    }
    return null;
  }
};

module.exports = {
  addUSDTLiquidity
};