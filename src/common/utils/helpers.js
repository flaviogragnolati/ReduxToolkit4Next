import _ from 'lodash';

export const mirrorKeys = (keys) => {
  if (!keys || !_.isArray(keys)) throw new Error('keys must be an array');
  return _.reduce(
    keys,
    (accObj, key) => {
      accObj[key] = key;
      return accObj;
    },
    {}
  );
};

export const toAbsoluteUrl = (pathname) =>
  process.env.REACT_APP_PUBLIC_URL + pathname;

export const getFilters = (payload) => {
  const { operationStatus, contractDate, name, document } = payload;
  const filters = {
    operationStatus,
    contractDate,
    name,
    document,
    tributaryKey: document, // we dont know if the input is document or tributaryKey
  };
  return filters;
};

export const isEmptyOrNil = (item) => {
  if (_.isObject(item)) {
    return _.isEmpty(item);
  } else {
    return _.isNil(item);
  }
};
