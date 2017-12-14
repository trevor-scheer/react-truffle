import React from 'react';
import ContractStore from '../../store/ContractStore';
import {MockChildWithContext} from '../mocks/MockComponents';
import {throwLogsAsErrors, getProviderWithMockChildren} from '../testUtils';

throwLogsAsErrors({error: true, warn: true});

describe('ContractProvider:', () => {
  test('it renders', () => {
    expect(() => {
      getProviderWithMockChildren(<div />);
    }).toBeTruthy();
  });

  test('it expects only a single child element', () => {
    expect(() => {
      getProviderWithMockChildren();
    }).toThrow(/The prop `children` is marked as required/);

    // TODO: am I doing something wrong?
    // For whatever reason when this particular test throws it perma-breaks
    // the environment. Unassigning and reassigning console.error after the
    // exception prevents this broken state.
    throwLogsAsErrors({error: false, warn: false});
    expect(() => {
      getProviderWithMockChildren([<div />, <div />]);
    }).toThrow(/expected to receive a single React element child/);
    throwLogsAsErrors({error: true, warn: true});
  });

  test('it uses a custom store from props if provided', () => {
    const customStore = new ContractStore();
    const {provider} = getProviderWithMockChildren(<div />, {
      store: customStore
    });

    expect(provider.store).toBe(customStore);
  });

  test('it provides the ContractStore to its children on context', () => {
    const customStore = new ContractStore();
    const {root} = getProviderWithMockChildren(<MockChildWithContext />, {
      store: customStore
    });

    const {instance: child} = root.findByType(MockChildWithContext);
    expect(child.context.store).toBe(customStore);
  });

  test('it passes extra props to the store constructor as opts', () => {
    const storeOpts = {
      autoPoll: false,
      pollInterval: 1
    };

    const {provider} = getProviderWithMockChildren(<div />, storeOpts);

    expect(provider.store.opts).toEqual(storeOpts);
  });
});
