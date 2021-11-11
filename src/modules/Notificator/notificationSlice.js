import { createSlice } from '@reduxjs/toolkit';

const notificationInitialState = {
  list: [],
  error: null,
  display: true,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState: notificationInitialState,
  reducers: {
    enqueueSnackbar: (state, { payload }) => {
      const {
        options: { key },
        message,
        options,
      } = payload;
      state.list.push({ key, message, options });
    },
    closeSnackbar: (state, { payload }) => {
      state.list = state.list.filter((notification) => {
        if (notification.key === payload)
          return (notification.dismissed = true);
        else return notification;
      });
    },
    clearSnackbar: (state, { payload }) => {
      state.list = state.list.forEach(
        (notification) => (notification.dismissed = true)
      );
    },
    removeSnackbar: (state, { payload }) => {
      state.list = state.list.filter(
        (notification) => notification.key !== payload
      );
    },
  },
});

export const { enqueueSnackbar, closeSnackbar, clearSnackbar, removeSnackbar } =
  notificationSlice.actions;

export default notificationSlice;
