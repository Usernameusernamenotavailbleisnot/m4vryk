const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { retryOperation } = require('../../utils/retry');
const { logWithAddress } = require('../../utils/logger');

// Get native balance via RPC
const getBalanceViaRPC = async (rpcUrl, address, proxy = null) => {
  const logger = logWithAddress(address);
  
  try {
    // Retry the balance check operation
    return await retryOperation(async () => {
      let fetchOptions = {};
      
      // Configure proxy if provided
      if (proxy) {
        fetchOptions = {
          agent: new HttpsProxyAgent(proxy)
        };
      }
      
      const response = await fetch(
        `${rpcUrl}/chains/main/blocks/head/context/contracts/${address}/balance`,
        fetchOptions
      );
      
      if (!response.ok) {
        throw new Error(`RPC error: ${response.status}`);
      }
      
      const balance = await response.json();
      const balanceInMavryk = parseInt(balance) / 1000000;
      logger.info(`Native balance: ${balanceInMavryk.toFixed(6)} ṁ`);
      
      return balance;
    });
  } catch (error) {
    logger.error(`Error getting balance: ${error.message}`);
    return null;
  }
};

// Check if balance is sufficient for an operation
const checkSufficientBalance = async (rpcUrl, address, requiredAmount, proxy = null) => {
  const logger = logWithAddress(address);
  
  try {
    const balance = await getBalanceViaRPC(rpcUrl, address, proxy);
    
    if (!balance) {
      logger.error('Failed to retrieve balance');
      return false;
    }
    
    const balanceValue = parseInt(balance);
    
    // Verify balance is sufficient (add a small buffer for fees)
    if (balanceValue < (requiredAmount + 5000)) {
      logger.error(`Insufficient balance: ${(balanceValue / 1000000).toFixed(6)} ṁ, required: ${(requiredAmount / 1000000).toFixed(6)} ṁ`);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error(`Error checking balance: ${error.message}`);
    return false;
  }
};

module.exports = {
  getBalanceViaRPC,
  checkSufficientBalance
};