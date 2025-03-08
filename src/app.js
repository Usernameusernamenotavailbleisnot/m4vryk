const { MavrykToolkit } = require('@mavrykdynamics/taquito');
const { InMemorySigner } = require('@mavrykdynamics/taquito-signer');
const { HttpsProxyAgent } = require('https-proxy-agent');
const figlet = require('figlet');
const chalk = require('chalk');

const { readPrivateKeys, readProxies, maskWalletAddress } = require('./utils/wallet');
const { logger, logWithAddress } = require('./utils/logger');
const { getBalanceViaRPC } = require('./services/balance/getBalance');
const { addNativeLiquidity } = require('./services/liquidity/addNativeLiquidity');
const { addUSDTLiquidity } = require('./services/liquidity/addUSDTLiquidity');
const { removeNativeLiquidity } = require('./services/liquidity/removeNativeLiquidity');
const { removeUSDTLiquidity } = require('./services/liquidity/removeUSDTLiquidity');
const { executeRedelegationProcess } = require('./services/delegation/redelegateToBaker');
const config = require('../config/config.json');

// Display ASCII art header
const displayHeader = () => {
  const headerText = figlet.textSync('Mavryk', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  console.log(chalk.cyan(headerText));
  console.log(chalk.yellow('==== MAVRYK OPERATIONS TOOL ====\n'));
};

// Generate a random amount within min-max range
const getRandomAmount = (min, max) => {
  // Generate random amount between min and max (human readable format)
  const randomAmount = min + (Math.random() * (max - min));
  // Convert to microtoken format needed by blockchain (multiply by 1,000,000)
  return Math.floor(randomAmount * 1000000);
};

// Process a single wallet
const processWallet = async (privateKey, proxyUrl = null) => {
  try {
    // Initialize Mavryk toolkit with proxy if available
    const mavryk = new MavrykToolkit(config.rpcUrl);
    mavryk.setProvider({ signer: new InMemorySigner(privateKey) });
    
    // Get wallet address
    const address = await mavryk.signer.publicKeyHash();
    const logger = logWithAddress(address);
    logger.info(`Processing wallet: ${maskWalletAddress(address)}`);
    
    // Get native balance
    const nativeBalance = await getBalanceViaRPC(config.rpcUrl, address, proxyUrl);
    if (!nativeBalance) {
      logger.error('Failed to retrieve balance, skipping wallet');
      return false;
    }
    
    // Load contracts
    logger.info('Loading contracts...');
    const poolContract = await mavryk.wallet.at(config.poolContractAddress);
    const usdtContract = await mavryk.wallet.at(config.usdtTokenAddress);
    logger.info('Contracts loaded successfully');
    
    // Execute operations in sequence
    
    // 1. Add Native Liquidity (multiple iterations)
    for (let i = 0; i < config.liquidity.add.iterations; i++) {
      const amount = getRandomAmount(config.liquidity.add.minAmount, config.liquidity.add.maxAmount);
      logger.info(`Executing native liquidity addition #${i + 1}`);
      await addNativeLiquidity(mavryk, poolContract, amount, address, proxyUrl);
      
      // Add delay between operations
      if (i < config.liquidity.add.iterations - 1) {
        logger.info(`Waiting ${config.delay.betweenOperations / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, config.delay.betweenOperations));
      }
    }
    
    // 2. Add USDT Liquidity (multiple iterations)
    for (let i = 0; i < config.liquidity.add.iterations; i++) {
      const amount = getRandomAmount(config.liquidity.add.minAmount, config.liquidity.add.maxAmount);
      logger.info(`Executing USDT liquidity addition #${i + 1}`);
      await addUSDTLiquidity(mavryk, poolContract, usdtContract, amount, address, proxyUrl);
      
      // Add delay between operations
      if (i < config.liquidity.add.iterations - 1) {
        logger.info(`Waiting ${config.delay.betweenOperations / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, config.delay.betweenOperations));
      }
    }
    
    // 3. Remove Native Liquidity (multiple iterations)
    for (let i = 0; i < config.liquidity.remove.iterations; i++) {
      const amount = getRandomAmount(config.liquidity.remove.minAmount, config.liquidity.remove.maxAmount);
      logger.info(`Executing native liquidity removal #${i + 1}`);
      await removeNativeLiquidity(mavryk, poolContract, amount, address, proxyUrl);
      
      // Add delay between operations
      if (i < config.liquidity.remove.iterations - 1) {
        logger.info(`Waiting ${config.delay.betweenOperations / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, config.delay.betweenOperations));
      }
    }
    
    // 4. Remove USDT Liquidity (multiple iterations)
    for (let i = 0; i < config.liquidity.remove.iterations; i++) {
      const amount = getRandomAmount(config.liquidity.remove.minAmount, config.liquidity.remove.maxAmount);
      logger.info(`Executing USDT liquidity removal #${i + 1}`);
      await removeUSDTLiquidity(mavryk, poolContract, amount, address, proxyUrl);
      
      // Add delay between operations
      if (i < config.liquidity.remove.iterations - 1) {
        logger.info(`Waiting ${config.delay.betweenOperations / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, config.delay.betweenOperations));
      }
    }
    
    // 5. Execute delegation process with multiple redelegations
    logger.info('Executing delegation process');
    await executeRedelegationProcess(mavryk, config.delegation.iterations, address, proxyUrl);
    
    logger.info('All operations completed for this wallet');
    return true;
  } catch (error) {
    logger.error(`Error processing wallet: ${error.message}`);
    return false;
  }
};

// Main function to process all wallets
const processAllWallets = async () => {
  try {
    displayHeader();
    
    // Read private keys and proxies
    const privateKeys = readPrivateKeys();
    const proxies = readProxies();
    
    logger.info(`Loaded ${privateKeys.length} private keys and ${proxies.length} proxies`);
    
    // Process each wallet
    for (let i = 0; i < privateKeys.length; i++) {
      const privateKey = privateKeys[i];
      
      // Get proxy if available
      const proxyUrl = proxies.length > 0 ? 
        proxies[i % proxies.length] : // Round-robin proxy assignment
        null;
      
      logger.info(`Processing wallet ${i + 1} of ${privateKeys.length}`);
      await processWallet(privateKey, proxyUrl);
      
      // Add delay between wallets
      if (i < privateKeys.length - 1) {
        logger.info(`Waiting ${config.delay.betweenWallets / 1000} seconds before next wallet...`);
        await new Promise(resolve => setTimeout(resolve, config.delay.betweenWallets));
      }
    }
    
    logger.info('All wallets processed successfully');
    logger.info(`Adding delay of ${config.delay.afterCompletion / (1000 * 60 * 60)} hours before next run`);
    
    // Wait 25 hours before next run
    await new Promise(resolve => setTimeout(resolve, config.delay.afterCompletion));
    
    // Restart process
    return processAllWallets();
  } catch (error) {
    logger.error(`Error in main process: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  processAllWallets
};