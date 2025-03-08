const fs = require('fs');
const { logger } = require('./logger');

// Read all private keys from file
const readPrivateKeys = () => {
  try {
    const content = fs.readFileSync('data/pk.txt', 'utf8');
    const keys = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (keys.length === 0) {
      throw new Error('No private keys found in pk.txt');
    }
    
    logger.info(`Loaded ${keys.length} private keys from pk.txt`);
    return keys;
  } catch (error) {
    logger.error(`Error reading private keys: ${error.message}`);
    throw new Error(`Error reading private keys: ${error.message}`);
  }
};

// Read all proxies from file
const readProxies = () => {
  try {
    if (!fs.existsSync('data/proxy.txt')) {
      logger.info('No proxy.txt file found, proceeding without proxies');
      return []; // No proxies available
    }
    
    const content = fs.readFileSync('data/proxy.txt', 'utf8');
    const proxies = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    logger.info(`Loaded ${proxies.length} proxies from proxy.txt`);
    return proxies;
  } catch (error) {
    logger.error(`Error reading proxies: ${error.message}`);
    throw new Error(`Error reading proxies: ${error.message}`);
  }
};

// Function to mask wallet address for display
const maskWalletAddress = (address) => {
  if (!address) return 'unknown';
  if (address.length <= 8) return address;
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

module.exports = {
  readPrivateKeys,
  readProxies,
  maskWalletAddress
};