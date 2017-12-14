import ContractStore from '../../store/ContractStore';
import {getWeb3} from '../../utils';

jest.mock('../../utils/getWeb3', () => {
  let a = 0;
  return Promise.resolve({
    eth: {
      getAccounts: jest.fn(cb => {
        // Incrementing a here gives us a new account number every time this fn
        // is called on. This is ideal for testing polling for new account logic.
        cb(null, [a++]);
      })
    }
  });
});

jest.useFakeTimers();
let store;
beforeEach(() => {
  store = new ContractStore();
});

describe('ContractStore:', () => {
  test('it polls for account changes', () => {
    const maybeUpdateAccountSpy = jest.spyOn(store, 'maybeUpdateAccount');

    expect(maybeUpdateAccountSpy).toHaveBeenCalledTimes(0);
    jest.runOnlyPendingTimers();
    expect(maybeUpdateAccountSpy).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(maybeUpdateAccountSpy).toHaveBeenCalledTimes(2);
  });

  test('it notifies subscribers on account change', async () => {
    const notifySubscribersSpy = jest.spyOn(store, 'notifySubscribers');

    expect(notifySubscribersSpy).toHaveBeenCalledTimes(0);

    await Promise.resolve(jest.runOnlyPendingTimers());
    expect(notifySubscribersSpy).toHaveBeenCalledTimes(1);
    await Promise.resolve(jest.runOnlyPendingTimers());
    expect(notifySubscribersSpy).toHaveBeenCalledTimes(2);
  });

  test('it adds subscribers to the subscriptions array', () => {
    store.subscribe(() => {});
    expect(store.subscriptions.length).toBe(1);
  });

  test('it notifies subscribers', () => {
    const subscriber = jest.fn();

    store.subscribe(subscriber);
    store.notifySubscribers();
    expect(subscriber).toHaveBeenCalled();
  });

  test('subscribers can unsubscribe', () => {
    const subscriber = jest.fn();
    const unsubscribe = store.subscribe(subscriber);

    expect(store.subscriptions.length).toBe(1);
    unsubscribe();
    expect(store.subscriptions.length).toBe(0);
    store.notifySubscribers();
    expect(subscriber).toHaveBeenCalledTimes(0);
  });
});
