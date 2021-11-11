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
  dataById: null,
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

const mockById = async () => {
  return P.delay(
    1500,
    P.resolve({
      id: 1,
      item: 'De mentira',
      content: 'contenido mock',
    })
  );
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

export const getById = createAsyncThunk(
  'dashboard/getById',
  async (payload, { rejectWithValue }) => {
    const data = await mockById(payload);
    if (!data) {
      rejectWithValue({ message: 'No se recibieron datos' });
    }
    return data;
  }
);

const isPendingAction = isPending(getData, getById);
const isFulfilledAction = isFulfilled(getData, getById);
const isRejectedAction = isRejected(getData, getById);

const dataSlice = createSlice({
  name: 'dashboard',
  initialState: dataInitialState,
  reducers: {
    toggleDisplayData: (state, action) => {
      state.display = !state.display;
    },
    deleteData: (state, action) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getData.fulfilled, (state, { payload }) => {
      state.data = payload;
    });
    builder.addCase(getById.fulfilled, (state, { payload }) => {
      state.dataById = payload;
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

export const { toggleDisplayData, deleteData } = dataSlice.actions;
export default dataSlice;
