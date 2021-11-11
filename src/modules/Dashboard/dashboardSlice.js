import _ from 'lodash';
import P from 'bluebird';
import {
  createSlice,
  createAsyncThunk,
  isPending,
  isFulfilled,
  isRejected,
} from '@reduxjs/toolkit';
import { STATUS } from '@/constants/thunkStates';

const dataInitialState = {
  status: STATUS.idle,
  error: null,
  data: null,
  display: false,
};

const data = [
  {
    id: 1,
    title: 'titulo de la data',
    content: 'contenido de la data',
    extra: 'cosas random',
  },
  {
    id: 2,
    title: 'componente feo',
    content: 'sin css',
    extra: '...',
  },
];
const mockData = async () => {
  return P.delay(2000, P.resolve(data));
};

export const getData = createAsyncThunk(
  'dashboard/getData',
  async (payload, { rejectWithValue }) => {
    try {
      const getDataResponse = await mockData();
      console.log('getDataResponse', getDataResponse);
      if (!getDataResponse) {
        return rejectWithValue({ message: 'No se recibieron datos' });
      }
      return getDataResponse;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const isPendingAction = isPending(getData);
const isFulfilledAction = isFulfilled(getData);
const isRejectedAction = isRejected(getData);

const dataSlice = createSlice({
  name: 'dashboard',
  initialState: dataInitialState,
  reducers: {
    toggleDisplayData: (state, action) => {
      state.display = !state.display;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getData.fulfilled, (state, { payload }) => {
      state.data = payload;
    });
    builder.addMatcher(isPendingAction, (state, { payload }) => {
      state.status = STATUS.pending;
    });
    builder.addMatcher(isRejectedAction, (state, action) => {
      const { payload, error } = action;
      state.status = STATUS.error;
      state.error = error.message || error || payload.message || payload;
    });
    builder.addMatcher(isFulfilledAction, (state, { payload }) => {
      state.status = STATUS.fulfilled;
    });
  },
});

export const { toggleDisplayData } = dataSlice.actions;
export default dataSlice;
