// constants.js
module.exports = {
    // Available validators
    VALIDATORS: [
      { id: 1, address: 'mv1V4h45W3p4e1sjSBvRkK2uYbvkTnSuHg8g' },
      { id: 2, address: 'mv1DeXVziJ3ygDBFEteUi9jrpWudPUhSBHgP' },
      { id: 3, address: 'mv1RjfC3xV7Aoshdq66GLNDAH9DRzWuRNFnh' },
      { id: 4, address: 'mv1DrGAS49DGQsLsPDo7ZLhpH7evt7BQ4ytn' },
      { id: 5, address: 'mv1NVfdsfc7LHTyHE8Bm7TokYSKHwiQg1ToW' }
    ],
    
    // Error messages
    ERRORS: {
      INSUFFICIENT_BALANCE: 'Insufficient balance',
      PROXY_ERROR: 'Proxy connection error',
      RPC_ERROR: 'RPC connection error',
      NOT_ENOUGH_LIQUIDITY: 'Not enough liquidity',
      DELEGATION_UNCHANGED: 'Delegation unchanged',
    },
    
    // Operation types
    OPERATIONS: {
      ADD_NATIVE: 'ADD_NATIVE_LIQUIDITY',
      ADD_USDT: 'ADD_USDT_LIQUIDITY',
      REMOVE_NATIVE: 'REMOVE_NATIVE_LIQUIDITY',
      REMOVE_USDT: 'REMOVE_USDT_LIQUIDITY',
      DELEGATE: 'DELEGATE_TO_BAKER'
    }
  };