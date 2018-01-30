import {MockBasicComponent, MockContractStore} from '../mocks/MockComponents';
import {
  throwLogsAsErrors,
  getNodeWrappedWithHoc,
  getComponentTreeWithContext
} from '../testUtils';

throwLogsAsErrors({error: true, warn: false});

describe('WithContract:', () => {
  test('it throws an error if the contract is invalid', () => {
    expect(() => {
      getNodeWrappedWithHoc({contract: {}});
    }).toThrow(/Invalid contract provided/);
  });

  test('it logs a warning to the console when mapFunction is neither undefined or a function', () => {
    throwLogsAsErrors({error: true, warn: true});
    expect(() => {
      getNodeWrappedWithHoc({mapFunction: true});
    }).toThrow(/expected a function/);
    throwLogsAsErrors({error: true, warn: false});
  });

  test('it logs a warning to the console when opts is neither undefined or an object', () => {
    throwLogsAsErrors({error: true, warn: true});
    expect(() => {
      getNodeWrappedWithHoc({opts: true});
    }).toThrow(/expected type object/);
    throwLogsAsErrors({error: true, warn: false});
  });

  describe('When the store cache is empty:', () => {
    test("it doesn't render until contract resolution", async () => {
      const WithContract = getNodeWrappedWithHoc();

      // Get the provider and HOC nodes
      const {provider, hoc} = getComponentTreeWithContext(WithContract);

      // HOC awaits a promise to resolve for the contract to be ready.
      // By default it renders null in the meantime.
      expect(hoc.state.resolved).toBe(false);
      expect(() => {
        provider.findByType(MockBasicComponent);
      }).toThrow(/No instances found/);

      // "Wait" for the contract to be ready and state to update.
      // Now we should find the wrapped component.
      await Promise.resolve();
      expect(hoc.state.resolved).toBe(true);

      const {instance: wrappedComponent} = provider.findByType(
        MockBasicComponent
      );

      expect(wrappedComponent).toBeTruthy();
    });

    test('it renders the wrapped component before contract resolution with renderBeforeContractResolves set to true', () => {
      const opts = {renderBeforeContractResolves: true};
      const WithContract = getNodeWrappedWithHoc({opts});

      // Get the provider, HOC, and wrappedComponent nodes
      const {provider, hoc, wrappedComponent} = getComponentTreeWithContext(
        WithContract,
        opts
      );

      expect(provider).toBeTruthy();
      expect(hoc).toBeTruthy();
      expect(wrappedComponent).toBeTruthy();
    });

    test('it provides the entire contract as props.contract when no map function is provided', async () => {
      const WithContract = getNodeWrappedWithHoc();

      // Get the provider node (wrappedComponent won't be rendered until after the await)
      const {provider} = getComponentTreeWithContext(WithContract);

      await Promise.resolve();
      const {instance: wrappedComponent} = provider.findByType(
        MockBasicComponent
      );

      expect(wrappedComponent.props.contract).toBeTruthy();
    });

    test('it provides props.renderCount with renderCountProp set to true', async () => {
      const WithContract = getNodeWrappedWithHoc({
        opts: {renderCountProp: true}
      });

      // Get the provider node (wrappedComponent won't be rendered until after the await)
      const {provider} = getComponentTreeWithContext(WithContract);

      await Promise.resolve();
      const {instance: wrappedComponent} = provider.findByType(
        MockBasicComponent
      );

      expect(wrappedComponent.props.renderCount).toBe(1);
    });
  });

  describe('When the store cache is populated:', () => {
    test('it finds the cached contract and renders the wrapped component immediately', () => {
      const mockStore = new MockContractStore();
      mockStore.cacheNewContract({contractName: 'MockContract'});

      const WithContract = getNodeWrappedWithHoc();

      // Get the wrappedComponent, it's rendered immediately since the contract is pre-cached
      const {wrappedComponent} = getComponentTreeWithContext(
        WithContract,
        null,
        mockStore
      );

      expect(wrappedComponent.props.contract).toBeTruthy();
    });
  });
});
