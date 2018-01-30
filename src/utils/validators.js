import truffleContract from 'truffle-contract';

export function validateContract(contract) {
  try {
    truffleContract(contract).at('0x0000000000000000000000000000000000000000');
  } catch (err) {
    console.error(`WithContract: Invalid contract provided\n ${err}`);
    return false;
  }
  return true;
}

export function validateMapFunction(mapFunction, componentName) {
  if (typeof mapFunction === 'function' || typeof mapFunction === 'undefined') {
    return typeof mapFunction === 'function';
  } else {
    console.warn(
      `${componentName}: expected a function, instead got ${typeof mapFunction}. Falling back to default contract mapping.`
    );
  }
  return false;
}

export function validateHocOpts(hocOpts, componentName) {
  if (typeof hocOpts === 'object' || typeof hocOpts === 'undefined') {
    return true;
  } else {
    console.warn(
      `${componentName}: hocOpts expected type object, instead received ${typeof hocOpts}. Falling back to default options.`
    );
    return false;
  }
}
