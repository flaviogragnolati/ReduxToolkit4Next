import _ from 'lodash';

import THUNK_STATE, { STATES_LIST } from '@/constants/thunkStates';
import syncNotifications from './notifications/syncNotifications';
import thunkNotifications from './notifications/thunkNotifications';

const { REJECTED, FULFILLED } = THUNK_STATE;

function createThunkNotifications(thunkActions) {
  const snackbars = {};
  const slices = _.keys(thunkActions);
  const fullPaths = [];
  _.forEach(slices, (slice) => {
    const actions = _.map(
      _.keys(thunkActions[slice]),
      (action) => slice + '.' + action
    );
    _.forEach(actions, (action) => {
      const subAction = _.get(thunkActions, action);
      let fullPath;
      if (_.some(_.keys(subAction), (key) => _.includes(STATES_LIST, key))) {
        _.forOwn(subAction, (val, key) => {
          fullPath = action + '.' + key;
          fullPaths.push(fullPath);
        });
      } else {
        fullPath = action;
        fullPaths.push(fullPath);
      }
    });
  });
  _.forEach(fullPaths, (path) => {
    const snackbarContent = _.get(thunkActions, path);
    if (path.split('.').length !== 3) {
      const key = _.replace(path, /\./g, '/') + '/' + FULFILLED; // if thunk action state is not specifed notification is set to 'fulfilled'
      snackbars[key] = snackbarContent;
    } else {
      snackbars[_.replace(path, /\./g, '/')] = snackbarContent;
    }
  });
  return snackbars;
}

function createSyncNotifications(syncActions) {
  const snackbars = {};
  const slices = _.keys(syncActions);
  const fullPaths = [];
  _.forEach(slices, (slice) => {
    const actions = _.map(
      _.keys(syncActions[slice]),
      (action) => slice + '.' + action
    );
    _.forEach(actions, (action) => {
      fullPaths.push(action);
    });
  });
  _.forEach(fullPaths, (path) => {
    snackbars[_.replace(path, /\./g, '/')] = _.get(syncActions, path);
  });
  return snackbars;
}

// creates full snacbkar object
function createSnackbars(thunkNotifications, syncNotifications) {
  const thunkSnackbars = createThunkNotifications(thunkNotifications);
  const syncSnackbars = createSyncNotifications(syncNotifications);
  return _.merge({}, thunkSnackbars, syncSnackbars);
}

const snackbars = createSnackbars(thunkNotifications, syncNotifications);

const defaultSnackbar = {
  message: '',
  options: {
    key: new Date().getTime() + Math.random(),
    variant: 'default', // info|error|success|warning|default
    anchorOrigin: {
      vertical: 'top', // top|bottom
      horizontal: 'center', // left|center|right
    },
    // action: (key) => (
    //   <Button onClick={() => dispatch(closeSnackbar(key))}>X</Button>
    // ),
  },
};

const defaultRejectedSnackbar = {
  message: 'Ha ocurrido un error, intente nuevamente',
  variant: 'error',
};

export default function getSnackbar(action) {
  let content = snackbars[action.type];
  console.log('GET SNACKBAR', action);

  // adds default error notifitacion to all async actions
  if (!content && action.type.split('/').pop() === REJECTED) {
    content = defaultRejectedSnackbar;
  }

  // if no content and no other condition is met, early return
  if (!content) return null;

  const snackbar = _.cloneDeep(defaultSnackbar);
  snackbar.message = content.message || defaultSnackbar.message;
  snackbar.options.variant = content.variant || defaultSnackbar.options.variant;
  snackbar.options.anchorOrigin =
    content.anchorOrigin || defaultSnackbar.options.anchorOrigin;

  return snackbar;
}
