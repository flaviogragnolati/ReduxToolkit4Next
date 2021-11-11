import { combineReducers } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import counter from '@/modules/Counter/counterSlice';
import modal from '@/modules/Modal/modalSlice';

const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      console.log('HYDRATE');
      return action.payload;

    default: {
      const combineReducer = combineReducers({
        counter,
        modal,
      });
      return combineReducer(state, action);
    }
  }
};

export default rootReducer;
