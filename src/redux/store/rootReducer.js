import { combineReducers } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import counterSlice from '@/modules/Counter/counterSlice';
import modalSlice from '@/modules/Modal/modalSlice';
import notificationSlice from '@/modules/Notificator/notificationSlice';

const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      console.log('HYDRATE');
      return action.payload;

    default: {
      const combineReducer = combineReducers({
        [counterSlice.name]: counterSlice.reducer,
        [modalSlice.name]: modalSlice.reducer,
        [notificationSlice.name]: notificationSlice.reducer,
      });
      return combineReducer(state, action);
    }
  }
};

export default rootReducer;
