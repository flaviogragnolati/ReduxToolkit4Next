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

export const toAbsoluteUrl = (pathname) => process.env.PUBLIC_URL + pathname;

export const isEmptyOrNil = (item) => {
  if (_.isObject(item)) {
    return _.isEmpty(item);
  } else {
    return _.isNil(item);
  }
};
