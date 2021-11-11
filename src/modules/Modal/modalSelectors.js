import _ from 'lodash';

export const modalSelector = (state) => state.modal;
export const lastModalSelector = (state) => _.last(state.modal.stack);
