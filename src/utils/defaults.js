export function defaultMapContractToProps(contract) {
  return {contract};
}

export function getDefaultStoreOpts() {
  return {
    pollInterval: 5000,
    autoPoll: true
  };
}

export function getDefaultHocOpts() {
  return {
    subscribeToAccountChange: true,
    renderBeforeContractResolves: false,
    renderCountProp: false
  };
}
