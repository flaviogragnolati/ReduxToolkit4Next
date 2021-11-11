import {
  createSlice,
  createAsyncThunk,
  isPending,
  isFulfilled,
  isRejected,
} from '@reduxjs/toolkit';
import { STATUS } from 'constants/thunkStates';
import TokenManager from 'api/TokenManager';
import { updateToken, deleteToken } from './tokenSlice';

const authInitialState = {
  status: STATUS.idle,
  failedLogin: 0,
  error: null,
  user: TokenManager.getUser() || {}, // gets user from stored token
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload, { dispatch, rejectWithValue, extra }) => {
    const loginResponse = await extra.API.auth.login(payload);
    console.log('LOIGIN RESPONSE SLICE', loginResponse);
    if (loginResponse.code !== 200) {
      return rejectWithValue({message:'status code != 200'});
    }
    dispatch(updateToken(loginResponse));
    return loginResponse;
  }
  // {
  //   condition: (payload, { dispatch, getState }) => {
  //     const { auth } = getState();
  //     if (auth.failedLogin > 5) {
  //       // rejectWithValue({ message: 'Maximum login attempts exceeded' });
  //       return false;
  //     }
  //   },
  // }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    dispatch(deleteToken());
  }
);

export const recoverPassword = createAsyncThunk(
  'auth/recoverPassword',
  async (payload, { dispatch, rejectWithValue, extra }) => {
    const recoveredPassword = await extra.API.auth.recoverPassword(payload);
    return recoveredPassword;
  },
  { condition: (payload, { dispatch, getState }) => {} }
);

const isPendingAction = isPending(login, recoverPassword);
const isFulfilledAction = isFulfilled(login, recoverPassword);
const isRejectedAction = isRejected(login, recoverPassword);

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    addFailedLogin: (state, { payload }) => {
      state.failedLogin++;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, { payload }) => {
      state.user = payload.user;
    });
    builder.addCase(login.rejected, (state, { payload }) => {
      state.failedLogin++;
    });
    builder.addCase(logout.fulfilled, (state, { payload }) => {
      state.status = STATUS.reset;
      state.user = {};
      state.error = null;
      TokenManager.logout();
    });
    builder.addMatcher(isPendingAction, (state, { payload }) => {
      state.status = STATUS.pending;
    });
    builder.addMatcher(isFulfilledAction, (state, { payload }) => {
      state.status = STATUS.success;
    });
    builder.addMatcher(isRejectedAction, (state, action) => {
      const { payload, error } = action;
      state.status = STATUS.error;
      state.error = {};
      state.error.message =
        error.message || error || payload.message || payload;
      state.error.code = error.code || error.status || error.statusCode;
      state.error.extra = error && error.extra;
    });
  },
});

export const { addFailedLogin } = authSlice.actions;

export default authSlice;
