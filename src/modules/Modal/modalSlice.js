import P from 'bluebird';
import _ from 'lodash';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { STATUS } from 'constants/thunkStates';
import { MODAL_TYPES } from '@/common/config/modalTypes';

const modalShape = {
  status: STATUS.idle,
  display: false,
  key: null,
  type: null,
  error: null,
  modalProps: undefined,
};

const modalInitialState = {
  status: STATUS.idle,
  error: null,
  stack: [],
  confirmation: {
    isConfirmed: null,
    isDeclined: null,
  },
};

export const confirmationModal = createAsyncThunk(
  'modal/confirmationModal',
  async (payload, { extra, dispatch }) => {
    const store = extra.store;
    dispatch(openConfirmationModal(payload));
    return new P((resolve) => {
      const unsubscribe = store.subscribe(() => {
        const {
          modal: { confirmation },
        } = store.getState();
        if (confirmation.isConfirmed) {
          unsubscribe();
          resolve(true);
        }
        if (confirmation.isDeclined) {
          unsubscribe();
          resolve(false);
        }
      });
    });
  }
);

const modalSlice = createSlice({
  name: 'modal',
  initialState: modalInitialState,
  reducers: {
    setModal: (state, { payload }) => {
      state.stack.push(_.merge({}, modalShape, payload));
    },
    openModal: (state, { payload }) => {
      if (!state.type) return; // only opens a modal if the type has already been set
      state.display = true;
    },
    closeModal: (state, { payload }) => {
      state.stack.pop();
    },
    clearAllModals: (state, { payload }) => {
      state = { ...modalInitialState };
    },
    openConfirmationModal: (state, { payload }) => {
      payload = _.isEmpty(payload) ? modalShape : payload;
      payload.display = true;
      payload.type = MODAL_TYPES.confirmationModal;
      state.stack.push(_.merge({}, modalShape, payload));
    },
    confirmConfirmationModal: (state, { payload }) => {
      state.confirmation.isConfirmed = true;
      state.confirmation.isDeclined = false;
      state.stack.pop();
    },
    declineConfirmationModal: (state, { payload }) => {
      state.confirmation.isConfirmed = false;
      state.confirmation.isDeclined = true;
      state.stack.pop();
    },
  },
});

export const {
  setModal,
  openModal,
  closeModal,
  clearAllModals,
  openConfirmationModal,
  confirmConfirmationModal,
  declineConfirmationModal,
} = modalSlice.actions;

export default modalSlice.reducer;
