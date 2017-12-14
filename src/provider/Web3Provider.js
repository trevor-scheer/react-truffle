import {Component, Children} from "react";
import PropTypes from "prop-types";
import truffleContract from "truffle-contract";
import getWeb3 from "../utils/getWeb3";

export default class Web3Provider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  };

  static childContextTypes = {
    web3: PropTypes.object,
    contracts: PropTypes.object,
    cacheNewContract: PropTypes.func
  };

  // Cache contracts and web3 instance as they're resolved
  state = {
    contracts: {},
    web3: null
  };

  // Instantiating a contract requires web3 to be resolved, so grab web3
  // from this promise whenever we're building and caching a contract.
  //
  // withWeb3 HOC looks for web3 on context so cache it once it's resolved
  web3Promise = getWeb3
    .then(web3 => {
      this.setState({web3});
      return web3;
    })
    .catch(e => console.error("Error finding web3.", e));

  // web3 - consumed by withWeb3 HOC
  // contracts - consumed by withContract HOC
  // cacheNewContract - callback for resolving and loading a new contract into the cache
  getChildContext() {
    return {
      web3: this.state.web3,
      contracts: this.state.contracts,
      cacheNewContract: this.cacheNewContract
    };
  }

  cacheNewContract = contract => {
    const contractInstance = truffleContract(contract);
    this.web3Promise
      .then(web3 => {
        if (!web3.currentProvider) {
          throw new Error("No currentProvider found on web3 instance.");
        }
        contractInstance.setProvider(web3.currentProvider);

        // .deployed() throws if contract isn't deployed on the blockchain
        return contractInstance.deployed();
      })
      .then(result => {
        // Cache contract by name once it's resolved (found on the blockchain)
        this.setState(prevState => ({
          contracts: {
            ...prevState.contracts,
            [contract.contractName]: result
          }
        }));
      })
      .catch(error => console.error(error));
  };

  render() {
    return Children.only(this.props.children);
  }
}
