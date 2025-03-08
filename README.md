# M4vryk Operations Tool

An automation tool for operations on the M4vryk blockchain network with multi-wallet and multi-proxy support. This tool allows users to automatically execute various operations such as adding/removing liquidity and delegating to validators.
## Key Features

- **Multi-Wallet Support** - Operations with multiple private keys simultaneously
- **Multi-Proxy Support** - Use different proxies for each wallet
- **Add/Remove Liquidity** - Native (MAV) and USDT liquidity operations
- **Smart Delegation** - Random delegation with validator rotation
- **Retry Mechanism** - Automatic error handling with retry mechanism
- **Colored Logging** - Formatted logs with timestamp and wallet address
- **Flexible Configuration** - Adjustable liquidity amounts, iterations, and delays

## Folder Structure

```
m4vryk/
├── config/               # Configuration and constants
│   ├── config.json
│   └── constants.js
├── logs/                 # Log files
│   └── .gitkeep
├── src/
│   ├── services/         # Blockchain operation services
│   │   ├── liquidity/    # Add/remove liquidity functions
│   │   ├── delegation/   # Delegation functions
│   │   └── balance/      # Balance check functions
│   ├── utils/            # Utilities
│   │   ├── logger.js
│   │   ├── retry.js
│   │   └── wallet.js
│   ├── app.js            # Main logic
│   └── index.js          # Entry point
├── data/                 # Wallet and proxy data
│   ├── pk.txt            # Private keys (one per line)
│   └── proxy.txt         # Proxies (one per line)
└── package.json
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Usernameusernamenotavailbleisnot/m4vryk.git
   cd m4vryk
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Prepare data files:
   ```
   mkdir -p data
   touch data/pk.txt
   touch data/proxy.txt
   ```

4. Add private keys to `data/pk.txt` (one private key per line):
   ```
   edsk1...
   edsk2...
   ```

5. (Optional) Add proxies to `data/proxy.txt` (one proxy per line):
   ```
   http://user:pass@ip:port
   http://user:pass@ip:port
   ```

## Configuration

Edit the `config/config.json` file according to your needs:

```json
{
  "rpcUrl": "https://atlasnet.rpc.M4vryk.network",
  "apiUrl": "https://atlasnet.api.M4vryk.network/v1",
  "explorerUrl": "https://nexus.M4vryk.org/operation",
  "poolContractAddress": "KT1PptWQrc5WR868GhFoxnFasYSkC5JstkWS",
  "usdtTokenAddress": "KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf",
  "liquidity": {
    "add": {
      "minAmount": 0.05,       // Minimum amount (in tokens)
      "maxAmount": 0.15,       // Maximum amount (in tokens)
      "iterations": 2          // Number of operations to perform
    },
    "remove": {
      "minAmount": 0.03,
      "maxAmount": 0.10,
      "iterations": 2
    }
  },
  "delegation": {
    "iterations": 3            // Number of random redelegations
  },
  "retryOptions": {
    "retries": 5,              // Maximum number of retries
    "minTimeout": 1000,        // Initial timeout (ms)
    "maxTimeout": 15000,       // Maximum timeout (ms)
    "factor": 2                // Exponential factor
  },
  "delay": {
    "betweenOperations": 5000, // Delay between operations (ms)
    "betweenWallets": 10000,   // Delay between wallets (ms)
    "afterCompletion": 90000000 // Delay after all wallets (25 hours)
  }
}
```

## Usage

Run the tool with the command:

```
npm start
```

The tool will automatically:
1. Load all private keys and proxies
2. Perform the following operations for each wallet:
   - Add MAV (Native) liquidity according to the configured number of iterations
   - Add USDT liquidity according to the configured number of iterations
   - Remove MAV (Native) liquidity according to the configured number of iterations
   - Remove USDT liquidity according to the configured number of iterations
   - Perform random delegation/redelegation to validators
3. Wait for 25 hours after all wallets are processed
4. Start the cycle again from the beginning

## Operation Flow

### Add Native Liquidity
1. Check if balance is sufficient
2. Add MAV liquidity with a random amount between min-max
3. Wait for blockchain confirmation

### Add USDT Liquidity
1. Check if balance is sufficient for operation fees
2. Set the pool contract as an operator for USDT
3. Add USDT liquidity with a random amount between min-max
4. Revoke operator permission after completion

### Delegation & Redelegation
1. Check current validator (if any)
2. Delegate to a different random validator
3. Rotate redelegation for the configured number of iterations

## Troubleshooting

### "Insufficient balance" Error
- Ensure the wallet has enough MAV for operation fees and liquidity

### "Not enough liquidity to remove" Error
- Ensure the wallet has liquidity in the pool before attempting to remove

### "delegate.unchanged" Error
- The wallet is already delegated to the same validator, choose a different validator

### Proxy Errors
- Check the proxy format in proxy.txt
- Correct format: `http://user:pass@ip:port` or `http://ip:port`

## Logging

All activities are recorded in log files:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is for educational and testing purposes only. Please use responsibly and in accordance with the terms of service of the networks you interact with.
