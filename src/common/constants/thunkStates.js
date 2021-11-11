export const PENDING = 'pending';
export const REJECTED = 'rejected';
export const FULFILLED = 'fulfilled';
export const STATES_LIST = [REJECTED, FULFILLED, PENDING];
const THUNK_STATE = { PENDING, REJECTED, FULFILLED };

export default THUNK_STATE;

export const STATUS = Object.freeze({
  idle: 'idle', //initial state
  reset: 'reset', //state when programatic reset is done
  pending: 'pending', //state when async actions is dispatched
  loading: 'loading', //state when async action is taking more time usual
  fulifilled: 'fulifilled', //state when async action is resolved correctly
  error: 'error', //state when async action is rejected
  warning: 'warning', //state when asychronous action is partialy rejected or the response is rejected
});
