import _ from 'lodash';

export const modalSelector = (state) => state.modal;
export const modalStackSelector = (state) => state.modal?.stack;
export const lastModalSelector = (state) => _.last(state.modal.stack);
