import { enqueueSnackbar } from '@/modules/Notificator/notificationSlice';
import getSnackbar from '@/modules/Notificator/notifications';

const notificationMiddleware = (store) => (next) => (action) => {
  const snackbar = getSnackbar(action);
  if (snackbar) {
    store.dispatch(enqueueSnackbar(snackbar));
  }
  return next(action);
};

export default notificationMiddleware;
