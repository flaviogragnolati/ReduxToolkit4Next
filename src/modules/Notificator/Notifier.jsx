import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationSelector } from '@/modules/Notificator/notificatorSelectors';
import { removeSnackbar } from '@/modules/Notificator/notificationSlice';

let displayed = [];

// TODO: convert to custom hook
function Notifier() {
  const dispatch = useDispatch();
  const notifications = useSelector(notificationSelector);
  console.log('notifications', notifications);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const storeDisplayed = (id) => {
    displayed = [...displayed, id];
  };

  const removeDisplayed = (id) => {
    displayed = [...displayed.filter((key) => id !== key)];
  };
  useEffect(() => {
    notifications &&
      notifications.forEach(
        ({ key, message, options = {}, dismissed = false }) => {
          if (dismissed) {
            // dismiss snackbar using notistack
            closeSnackbar(key);
            return;
          }

          // do nothing if snackbar is already displayed
          if (displayed.includes(key)) return;

          // display snackbar using notistack
          enqueueSnackbar(message, {
            key,
            ...options,
            onClose: (event, reason, myKey) => {
              if (options.onClose) {
                options.onClose(event, reason, myKey);
              }
            },
            onExited: (event, myKey) => {
              // remove this snackbar from redux store
              dispatch(removeSnackbar(myKey));
              removeDisplayed(myKey);
            },
          });

          // keep track of snackbars that we've displayed
          storeDisplayed(key);
        }
      );
  }, [notifications, closeSnackbar, enqueueSnackbar, dispatch]);

  return null;
}

export default Notifier;
