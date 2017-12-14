import React, {Component} from "react";
import PropTypes from "prop-types";

const withContract = (contract, mapContractToProps) => WrappedComponent =>
  class WithContract extends Component {
    static contextTypes = {
      contracts: PropTypes.object.isRequired,
      cacheNewContract: PropTypes.func.isRequired
    };

    componentDidMount() {
      // If the contract doesn't exist in the cache then call back to have it resolved and cached.
      if (!this.context.contracts[contract.contractName]) {
        this.context.cacheNewContract(contract);
      }
    }

    render() {
      let contractProps = {};
      if (this.context.contracts[contract.contractName]) {
        // If a mapping function was provided then use it, otherwise pass the whole contract down
        contractProps = mapContractToProps
          ? mapContractToProps({
              ...this.context.contracts[contract.contractName],
              resolved: true
            })
          : {
              [contract.contractName]: this.context.contracts[
                contract.contractName
              ],
              resolved: true
            };
      }

      return (
        <WrappedComponent resolved={false} {...this.props} {...contractProps} />
      );
    }
  };

export default withContract;
