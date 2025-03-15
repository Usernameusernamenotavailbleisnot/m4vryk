// constants.js
module.exports = {
    // Available validators
    VALIDATORS: [
      { id: 1, address: 'mv1V4h45W3p4e1sjSBvRkK2uYbvkTnSuHg8g' },
      { id: 2, address: 'mv1KY9HYiBcxS69SiffUvsEfKkhfTwmCCPgW' },
      { id: 3, address: 'mv1Wv89o61199rZ5NMBzyFGzfddxvYrYS3xi' },
      { id: 4, address: 'mv1KryptaWtsDi7EozpfoBjKbKbf4zgMvpj8' }
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
