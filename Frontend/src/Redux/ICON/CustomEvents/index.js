export const customRequestHasAccount = new CustomEvent('ICONEX_RELAY_REQUEST', {
    detail: {
      type: 'REQUEST_HAS_ACCOUNT'
    }
  });
  
export const customRequestAddress = new CustomEvent('ICONEX_RELAY_REQUEST', {
    detail: {
      type: 'REQUEST_ADDRESS',
      id: 1234
    }
  });

export const customRequestRPC = rpcPayload => new CustomEvent('ICONEX_RELAY_REQUEST', {
  detail: {
      type: 'REQUEST_JSON-RPC',
      payload: JSON.parse(rpcPayload)
  }
});


