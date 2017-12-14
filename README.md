# ReactTruffle

### Help wanted!

🚧 ReactTruffle is a WIP 🚧

* Expand the feature set
* Improve testing strategy
* QA / identifying potential problems or performance issues

The purpose of this package is to provide an excellent developer experience for those looking to integrate Ethereum smart contracts into their web app. The project itself is heavily inspired by ReactRedux, so any familiarity there will make understanding this API a breeze.

This package makes use of the Truffle framework, and more specifically the `truffle-contract` node package. It's recommended that you first become familiar with writing and compiling smart contracts with Truffle, then use this package to utilize your contracts with ease.

## Getting Started

### Installing

This package can be installed using npm.

```
npm install --save react-truffle
```

### Just get me up and running!

You can easily get a truffle development environment up and running by following the instructions outlined on their page. For simplicity I recommend the React box: http://truffleframework.com/boxes/react. Basic contracts and functions are provided for you in their boxes, making it easy to jump right in.

Once that's set up you can simply install this package (see above) and start using the components!

## Usage

A very simple example of what wrapping a component with a contract looks like

```
import React, {Component} from 'react';
import Thing from './components/Thing';
import SimpleStorage from './build/SimpleStorage.json';
import {ContractProvider, withContract} from 'react-truffle';

const mapContractToProps = contract => ({
  get: contract.get,
  set: contract.set
});

const ThingWrappedWithContract = withContract(
  SimpleStorage,
  mapContractToProps
)(Thing);

const App = () => (
  <ContractProvider>
    <ThingWrappedWithContract />
  </ContractProvider>
);

export default App;
```

## API

### `<ContractProvider store ...rest />`

This component provides a `ContractStore` to all of your components created by `withContract` within its hierarchy.

#### Props

* `store` (optional) - If for any reason you'd like to pass in your own `ContractStore`. This allows you to initialize a store with opts and/or pre-cached contract objects.
  🚧 In theory this could be built server-side and used to hydrate the provider on the front-end. 🚧
* `...rest` (optional) - All other props will be passed to the `ContractStore` as `opts`.
* `children` (ReactElement) - The root of your component hierarchy

### `withContract(contract, [mapContractToProps()], [opts])(Component)`

This function returns a component that wraps `Component` and provides it with props as specified by a combination of `mapContractToProps` and `{opts}`.

* `contract` - A smart contract compiled into JSON
* `mapContractToProps` (optional) - A function that accepts the contract as an argument and returns an object consisting of the desired props for `Component`. An example of this can be seen above. If no function is provided, the whole contract will be provided as props in a single `contract` object.
* `opts` (optional) - An object of options for configuring the component
  * `subscribeToAccountChange` (true) - receive updates from the `ContractStore` if the web3 account changes
  * `renderBeforeContractResolves` (false) - it takes time to find a contract on the blockchain. By default, the component won't render until the contract is available. If you design your wrapped component to handle a lack of contract props gracefully then you should set this to true.
  * `renderCountProp` (false) - simply provides a prop `renderCount` to `Component` for debugging

### `ContractStore(opts)`

* `opts` (optional) - An object of options for configuring the store
  * `pollInterval` (5000) - In ms, how often the store should poll web3 for account changes
  * `autoPoll` (true) - Set to false if you'd like to disable polling or manually trigger polling

This class performs the underlying work of:

* making web3 requests
* caching contract objects
* polling for account changes and notifying notifySubscribersSpy

You generally shouldn't find a need to perform any operations on it directly unless you're:

* writing your own components that consume `ContractStore` on `context`
* manipulating the `ContractStore` before providing it as a prop to `<ContractProvider>`

#### Functions

* `startPolling()`, `stopPolling()` - Start and stop polling for account changes on the web3 object.
* `subscribe(callback)` - Subscribe to account changes by passing a callback. Returns a callback for unsubscribing.
* `notifySubscribers()` - Call the callbacks of all the subscribers.
* `getContract(contract)` - `contract` is a smart contract compiled to JSON. Find the contract in cache or on the blockchain. Returns a `Promise` that resolves when the contract can be found in cache.

## Testing (jest)

`npm test`

## Resources

* [Truffle](http://truffleframework.com/) - The Truffle toolkit
* [Web3.js](https://github.com/ethereum/web3.js) - The Ethereum Javascript API

## Contributing

Accepting PRs - WIP

## Authors

* **Trevor Scheer** - _Initial work_

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
