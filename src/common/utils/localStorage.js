const logError = (error, key, type) => {
  console.warn(
    `Error in localstorage, ${type}ing key ['${key}'], error: ${JSON.stringify(
      error
    )}`
  );
};

export const getItem = (key) => {
  const now = Date.now();
  let expiresIn = localStorage.getItem(key + '_expiresIn');
  expiresIn = !expiresIn ? 0 : Math.abs(expiresIn);

  // key has expired
  if (expiresIn < now) {
    removeItem(key);
    return false;
  }
  try {
    return localStorage.getItem(key);
  } catch (error) {
    logError(error, key, 'get');
    return false;
  }
};

// default expires 1day
export const setItem = (key, item, expires = 24 * 60 * 60) => {
  try {
    localStorage.setItem(key, item);
    localStorage.setItem(key + '_expiresIn', Date.now() + expires * 1000);
  } catch (error) {
    logError(error, key, 'set');
    return false;
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(key + '_expiresIn');
    return true;
  } catch (error) {
    logError(error, key, 'remove');
    return false;
  }
};

const LocalStorage = { setItem, getItem, removeItem };
export default LocalStorage;
