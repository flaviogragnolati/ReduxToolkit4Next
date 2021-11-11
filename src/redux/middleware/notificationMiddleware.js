import { enqueueSnackbar } from 'redux/slices/notificationSlice';
// import getSnackbar from 'pages/Notifier/notifications';

const notificationMiddleware = (store) => (next) => (action) => {
  // const snackbar = getSnackbar(action);
  const snackbar = false;
  if (snackbar) {
    store.dispatch(enqueueSnackbar(snackbar));
  }
  return next(action);
};

export default notificationMiddleware;
