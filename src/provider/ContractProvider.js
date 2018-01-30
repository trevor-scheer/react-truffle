import {Component, Children} from 'react';
import PropTypes from 'prop-types';
import ContractStore from '../store/ContractStore';

class ContractProvider extends Component {
  constructor(props) {
    super(props);

    // Pass extra props through to the store as opts
    const {children, store, ...opts} = props;
    this.store = store || new ContractStore(opts);
  }

  componentWillUnmount() {
    this.store.stopPolling();
    this.store = null;
  }

  getChildContext() {
    return {
      store: this.store
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}

ContractProvider.propTypes = {
  children: PropTypes.node.isRequired,
  store: PropTypes.instanceOf(ContractStore)
};

ContractProvider.childContextTypes = {
  store: PropTypes.instanceOf(ContractStore).isRequired
};

export default ContractProvider;
