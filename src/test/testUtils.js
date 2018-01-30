import React from 'react';
import renderer from 'react-test-renderer';
import withContract from '../hocs/withContract';
import ContractProvider from '../provider/ContractProvider';
import MockContract from './mocks/MockContract.json';
import {MockContractProvider, MockBasicComponent} from './mocks/MockComponents';

const throwErr = err => {
  throw new Error(err);
};

const noop = () => {};

export function throwLogsAsErrors({error, warn}) {
  console.error = error ? throwErr : noop;
  console.warn = warn ? throwErr : noop;
}

export function getNodeWrappedWithHoc({
  opts = {},
  contract = MockContract,
  mapFunction
} = {}) {
  const WithContract = withContract(contract, mapFunction, opts)(
    MockBasicComponent
  );
  return WithContract;
}

/**
 * Helper function for rendering the WithContract hoc inside a mock provider
 *
 * @param Node  {Element} A React Node to be rendered within the mock provider
 * @param opts  {object}  Opts relevant to the WithContract hoc
 * @param store {MockContractStore} Optional custom store (allows for pre-caching contracts)
 */
export function getComponentTreeWithContext(Node, opts = {}, store) {
  const {root} = renderer.create(
    <MockContractProvider store={store}>
      <Node />
    </MockContractProvider>
  );

  const hoc = root.findByType(Node).instance;
  return {
    provider: root,
    hoc,
    ...((hoc.state.resolved || opts.renderBeforeContractResolves) && {
      wrappedComponent: root.findByType(MockBasicComponent).instance
    })
  };
}

/**
 * Helper function for rendering the ContractProvider with mock children
 *
 * @param children      {Element} Node(s) to render inside the provider
 * @param providerProps {object}  Object to spread onto the provider as props
 */
export function getProviderWithMockChildren(children, providerProps) {
  const provider = renderer.create(
    <ContractProvider {...providerProps}>{children}</ContractProvider>
  );

  return {
    provider: provider.getInstance(),
    root: provider.root
  };
}
