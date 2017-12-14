import _getWeb3 from "./utils/getWeb3";
import _Web3Provider from "./provider/Web3Provider";
import _withContract from "./hocs/withContract";
import _withWeb3 from "./hocs/withWeb3";

export const getWeb3 = _getWeb3;
export const Web3Provider = _Web3Provider;
export const withContract = _withContract;
export const withWeb3 = _withWeb3;

export default {
  getWeb3,
  Web3Provider,
  withContract,
  withWeb3
};
