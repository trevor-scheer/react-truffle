import React, {Component} from "react";
import PropTypes from "prop-types";

const withWeb3 = mapWeb3ToProps => WrappedComponent =>
  class WithWeb3 extends Component {
    static contextTypes = {
      web3: PropTypes.object
    };

    render() {
      let web3Props = {};
      if (this.context.web3) {
        // If a mapping function was provided then use it, otherwise pass the whole web3 down
        web3Props = mapWeb3ToProps
          ? mapWeb3ToProps(this.context.web3)
          : {web3: this.context.web3};
      }
      return <WrappedComponent {...this.props} {...web3Props} />;
    }
  };

export default withWeb3;
