import {
  createSlice,
  createAsyncThunk,
  isPending,
  isFulfilled,
  isRejected,
} from '@reduxjs/toolkit';
import { STATUS } from 'constants/thunkStates';
import TokenManager from 'api/TokenManager';

const tokenInitialState = {
  status: STATUS.idle,
  failedRestore: false,
  fullJWT: TokenManager.getJWT() || {},
  token: TokenManager.getAccessToken() || null,
  refreshToken: TokenManager.getRefreshToken() || null,
  error: null,
};

// validates the 'recovered' JWT from local storage
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (payload, { getState, dispatch, rejectWithValue, extra }) => {
    const state = getState();
    const { token, refreshToken } = state.token;
    const restoredSession = await extra.Api.auth.restoreSession({
      token,
      refreshToken,
    });
    if (!restoredSession) {
      rejectWithValue('ERROR restoring session');
    }
    return restoredSession;
  },
  {
    condition: (payload, { getState }) => {
      const {
        token: { failedRestore },
      } = getState();
      if (failedRestore) return false;
    },
  }
);

export const restoreToken = createAsyncThunk(
  'token/restoreToken',
  async (payload, { rejectWithValue }) => {
    try {
      const token = await TokenManager.getAccessToken();
      if (!token) return rejectWithValue('No token');
      return token;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const isPendingAction = isPending(restoreToken, restoreSession);
const isFulfilledAction = isFulfilled(restoreToken, restoreSession);
const isRejectedAction = isRejected(restoreToken, restoreSession);

const tokenSlice = createSlice({
  name: 'token',
  initialState: tokenInitialState,
  reducers: {
    updateToken: (state, { payload }) => {
      state.fullJWT = payload;
      state.token = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      TokenManager.updateToken(payload);
    },
    deleteToken: (state, { payload }) => {
      state.fullJWT = null;
      state.token = null;
      state.refreshToken = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreToken.fulfilled, (state, { payload }) => {
      state.token = payload;
      state.failedRestore = false;
    });
    builder.addCase(restoreToken.rejected, (state, { payload }) => {
      state.failedRestored = true;
    });
    builder.addMatcher(isPendingAction, (state, { payload }) => {
      state.status = STATUS.pending;
    });
    builder.addMatcher(isFulfilledAction, (state, { payload }) => {
      state.status = STATUS.success;
    });
    builder.addMatcher(isRejectedAction, (state, { payload }) => {
      state.status = STATUS.error;
      state.error = payload;
    });
  },
});

export const { updateToken, setStateReset, deleteToken, setFailedRestore } =
  tokenSlice.actions;

export default tokenSlice;
