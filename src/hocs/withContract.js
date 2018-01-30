import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ContractStore from '../store/ContractStore';
import {
  defaultMapContractToProps,
  getDefaultHocOpts,
  validateContract,
  validateMapFunction,
  validateHocOpts
} from '../utils';

export default function withContract(contract, mapFunction, opts = {}) {
  // If the contract is invalid just render the child component
  // and log an error to the console.
  if (!validateContract(contract)) {
    return WrappedComponent => WrappedComponent;
  }

  // If the map function is provided and valid, use it.
  // Otherwise fall back to default which passes the whole contract object through
  // as {contract: ContractObject}
  const mapContractToProps = validateMapFunction(mapFunction, 'WithContract')
    ? mapFunction
    : defaultMapContractToProps;

  // Merge default opts with opts provided.
  const hocOpts = {
    ...getDefaultHocOpts(),
    ...(validateHocOpts(opts, 'WithContract') && opts)
  };

  return function(WrappedComponent) {
    class WithContract extends Component {
      constructor(props, context) {
        super(props, context);
        this.renderCount = 0;
        this.contractProps = null;
        this.trySubscribe();
        this.tryResolveContract();
      }

      componentWillUpdate(_, nextState) {
        // Going from unresolved to resolved means we now have a contract;
        // The contract won't change so we can run the map function once
        // and cache the result rather than call it on each render.
        if (!this.state.resolved && nextState.resolved) {
          this.cacheContractProps();
        }
        // Now that we've cached the result and state.resolved is set,
        // there's no reason to enter cWU anymore.
        this.componentWillUpdate = null;
      }

      componentWillUnmount() {
        // If we're subscribed to the store, then unsubscribe.
        if (hocOpts.subscribeToAccountChange) {
          this.unsubscribe();
        }
      }

      trySubscribe() {
        // If the HOC is configured to listen for account changes then subscribe to the store.
        // We pass a callback to the store so we know when to update, in return we get a
        // callback in order to unsubscribe.
        if (hocOpts.subscribeToAccountChange) {
          this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate();
          });
        }
      }

      tryResolveContract() {
        // It's possible the contract is already cached in the store. If so, that saves us an
        // async call to fetch the contract and a subsequent setState (re-render).
        const resolved = this.context.store.contracts.hasOwnProperty(
          contract.contractName
        );

        // Note: this is only called from the constructor
        this.state = {resolved};
        if (resolved) {
          // If we have the contract already, run the map function and cache the result
          // since it will never change.
          this.cacheContractProps();
        } else {
          // If we don't have the contract, call on the store to resolve and cache it.
          this.resolveContract();
        }
      }

      resolveContract() {
        // Once the store has cached the contract, we can setState. This will trigger a
        // re-render and subsequently cache the contract props in cWU.
        this.context.store.getContract(contract).then(() => {
          this.setState({resolved: true});
        });
      }

      cacheContractProps() {
        // Cache the result of mapContractToProps since the input won't change.
        this.contractProps = mapContractToProps(
          this.context.store.contracts[contract.contractName]
        );
      }

      getContractProps() {
        const {
          state: {resolved},
          context: {store: {account}},
          contractProps
        } = this;

        return {
          // Only apply contractProps if the contract is resolved
          ...(resolved && contractProps),
          // Provide props relevant to provided configuration
          ...(hocOpts.subscribeToAccountChange && {account}),
          ...(hocOpts.renderCountProp && {renderCount: ++this.renderCount})
        };
      }

      render() {
        // Render the component once the contract is resolved unless configured otherwise
        return this.state.resolved || hocOpts.renderBeforeContractResolves ? (
          <WrappedComponent {...this.getContractProps()} />
        ) : null;
      }
    }

    WithContract.contextTypes = {
      store: PropTypes.instanceOf(ContractStore).isRequired
    };

    return WithContract;
  };
}
