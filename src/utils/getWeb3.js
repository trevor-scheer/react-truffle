/**
 * Heavily inspired by truffle-contract 's implementation of getWeb3
 * https://github.com/truffle-box/react-box/blob/master/src/utils/getWeb3.js
 */
import Web3 from 'web3';

export default new Promise(resolve => {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', () => {
    let {web3} = window;

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      console.log('Injected web3 detected.');
      web3 = new Web3(web3.currentProvider);
    } else {
      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      console.warn('No web3 instance injected, using Local web3.');
      const provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
      web3 = new Web3(provider);
    }

    resolve(web3);
  });
});
