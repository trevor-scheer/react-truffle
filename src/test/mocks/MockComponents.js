import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ContractStore from '../../store/ContractStore';

export class MockContractProvider extends Component {
  constructor(props) {
    super(props);
    this.store = props.store || new MockContractStore();
  }

  getChildContext() {
    return {
      store: this.store
    };
  }

  render() {
    return this.props.children;
  }
}
MockContractProvider.childContextTypes = {
  store: PropTypes.instanceOf(ContractStore).isRequired
};

export class MockChildWithContext extends Component {
  render() {
    return <div />;
  }
}
MockChildWithContext.contextTypes = {
  store: PropTypes.instanceOf(ContractStore).isRequired
};

export class MockBasicComponent extends Component {
  render() {
    return <div />;
  }
}

export class MockContractStore extends ContractStore {
  getContract(contract) {
    if (this.contracts.hasOwnProperty(contract.contractName)) {
      return Promise.resolve();
    } else {
      return this.cacheNewContract(contract);
    }
  }

  cacheNewContract(contract) {
    this.contracts[contract.contractName] = {
      get() {},
      set() {}
    };
    return Promise.resolve();
  }
}
