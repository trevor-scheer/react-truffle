import truffleContract from 'truffle-contract';
import {getDefaultStoreOpts, getWeb3} from '../utils';

export default class ContractStore {
  constructor(opts) {
    // Merge provided options into default options
    this.opts = {...getDefaultStoreOpts(), ...opts};
    this.contracts = {};
    this.account = '';
    this.subscriptions = [];

    if (this.opts.autoPoll) {
      this.startPolling();
    }
  }

  /**
   * Start polling for account changes at the interval provided. Unfortunately this is
   * currently the best solution for handling an account change since there's no event.
   */
  startPolling() {
    this.polling = setInterval(() => {
      this.maybeUpdateAccount();
    }, this.opts.pollInterval);
  }

  /**
   * Stop polling for account changes.
   */
  stopPolling() {
    clearInterval(this.polling);
    this.polling = null;
  }

  /**
   * Subscribe to the store.
   *
   * @param {function} callback Function to call on event
   * @returns {function} Function for unsubscribing from the store
   */
  subscribe(callback) {
    this.subscriptions.push(callback);
    return this.getUnsubscribeFunction(callback);
  }

  /**
   * Create a function to be handed back to a subscriber for unsubscribing.
   *
   * @param {function} callback The function passed in by the subscriber
   * @returns {function} Function for unsubscribing from the store
   */
  getUnsubscribeFunction(callback) {
    // Return a callback for unsubscribing.
    return () => {
      // Filter the array of subscriptions using the reference of the callback that was originally passed.
      this.subscriptions = this.subscriptions.filter(
        subscription => subscription !== callback
      );
    };
  }

  /**
   * Call each of the callbacks in the subscriptions array.
   */
  notifySubscribers() {
    this.subscriptions.forEach(cb => cb());
  }

  /**
   * Find the contract in cache or on the blockchain.
   *
   * @param {object} contract A smart contract compiled into a JSON object
   * @returns {Promise} Resolves when the contract is in cache
   */
  getContract(contract) {
    if (this.contracts.hasOwnProperty(contract.contractName)) {
      // If the contract is already cached, just return a resolved Promise.
      return Promise.resolve();
    } else {
      // Otherwise, return a Promise that resolves once the contract is cached.
      return this.cacheNewContract(contract);
    }
  }

  /**
   * Find a contract on the blockchain and cache the result.
   *
   * @param {object} contract A smart contract compiled into a JSON object
   * @returns {Promise} Resolves when the contract is in cache
   */
  cacheNewContract(contract) {
    const contractInstance = truffleContract(contract);
    return getWeb3
      .then(web3 => {
        if (!web3) {
          throw new Error('No web3 instance found.');
        } else if (!web3.currentProvider) {
          throw new Error('No currentProvider found on web3 instance.');
        } else {
          contractInstance.setProvider(web3.currentProvider);
          // .deployed() throws if contract isn't deployed on the blockchain
          return contractInstance.deployed();
        }
      })
      .then(result => {
        // Cache contract by name once it's resolved (found on the blockchain)
        this.contracts[contract.contractName] = result;
      })
      .catch(error => console.error(error));
  }

  /**
   * Get current account from web3, update if it changes.
   */
  maybeUpdateAccount() {
    getWeb3.then(web3 => {
      web3.eth.getAccounts((error, [account]) => {
        if (error) {
          console.error(error);
        } else {
          // If the account changed, update it and notify the subscribers
          if (account !== this.account) {
            this.account = account;
            this.notifySubscribers();
          }
        }
      });
    });
  }
}
