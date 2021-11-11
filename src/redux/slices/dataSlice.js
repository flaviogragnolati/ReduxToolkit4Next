import _ from 'lodash';
import moment from 'moment';
import {
  createSlice,
  createAsyncThunk,
  isPending,
  isFulfilled,
  isRejected,
} from '@reduxjs/toolkit';
import { STATUS } from 'constants/thunkStates';

const dataInitialState = {
  fetchStatus: STATUS.idle,
  status: STATUS.idle,
  error: null,
  clientsData: null,
  filters: {
    filterByNameOrDocument: null, // array of strings
    filterByOperationStatus: null, //array of operation status
    filterByOperationDate: null, //date
  },
  appliedFilters: {
    filterByNameOrDocument: null,
    filterByOperationStatus: null,
    filterByOperationDate: null,
  },
};

export const getData = createAsyncThunk(
  'data/getData',
  async (payload, { rejectWithValue, extra }) => {
    try {
      const options = {
        qs: {
          filters: payload || {},
          pageSize: 10000,
        },
      };
      const getDataResponse = await extra.API.backoffice.getOperations(options);
      if (!getDataResponse) {
        return rejectWithValue({ message: 'No se recibieron datos' });
      }
      return getDataResponse;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (payload, { getState }) => {
      const { data } = getState();
      if (
        _.includes([STATUS.pending, STATUS.loading, STATUS.error], data.status)
      ) {
        return false;
      }
    },
  }
);

export const createOne = createAsyncThunk(
  'data/createOne',
  async (payload, { rejectWithValue, extra }) => {
    try {
      const data = _.omitBy(
        payload,
        (val) => _.isNil(val) || (_.isObject(val) && _.isEmpty(val)) || !val
      );
      const createOneResponse = await extra.API.backoffice.addOne(data);
      return createOneResponse;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateOne = createAsyncThunk(
  'data/updateOne',
  async (payload, { rejectWithValue, extra }) => {
    try {
      const data = _.omitBy(
        payload,
        (val) => _.isNil(val) || (_.isObject(val) && _.isEmpty(val)) || !val
      );
      const updateOneResponse = await extra.API.backoffice.updateOne(data);
      return updateOneResponse;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const cancelOne = createAsyncThunk(
  'data/cancelOne',
  async ({ id }, { rejectWithValue, extra }) => {
    try {
      const payload = {
        id,
        id_ob_operation_status: 4, // cancel op status
      };
      const cancelOneResponse = await extra.API.backoffice.updateOne(payload);
      return cancelOneResponse;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const isPendingAction = isPending(getData, createOne, updateOne, cancelOne);
const isFulfilledAction = isFulfilled(getData, createOne, updateOne, cancelOne);
const isRejectedAction = isRejected(getData, createOne, updateOne, cancelOne);

const dataSlice = createSlice({
  name: 'data',
  initialState: dataInitialState,
  reducers: {
    setFilters: (state, { payload }) => {
      _.forOwn(state.filters, (val, key) => {
        if (!payload || payload[key] === undefined) return;
        state.filters[key] = payload[key];
      });
    },
    clearFilters: (state, { payload }) => {
      _.forOwn(state.filters, (val, key) => {
        state.filters[key] = null;
      });
    },
    resetState: (state, { payload }) => {
      state.status = STATUS.idle;
      state.error = null;
    },
    applyFilters: (state, { payload }) => {
      _.forOwn(state.filters, (val, key) => {
        if (key === 'filterByOperationDate') {
          const date = moment(val);
          val = date.isValid() ? date.format('DD/MM/YYYY') : '';
        }
        state.appliedFilters[key] = _.toLower(_.trim(val));
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getData.fulfilled, (state, { payload }) => {
      state.clientsData = payload;
    });
    builder.addCase(cancelOne.fulfilled, (state, { payload }) => {
      const { id, id_ob_operation_status } = payload;
      const row = _.find(
        state.clientsData,
        (row) => _.toInteger(row.id) === _.toInteger(id)
      );
      if (!row) {
        state.error = {};
        state.error.error = true;
        state.error.message = 'No se ha encontrado la operacion a cancelar';
      }
      row.id_ob_operation_status = id_ob_operation_status;
    });
    builder.addCase(updateOne.fulfilled, (state, { payload }) => {
      let row = _.find(
        state.clientsData,
        (row) => _.toInteger(row.id) === _.toInteger(payload.id)
      );
      if (!row) {
        state.error = {};
        state.error.error = true;
        state.error.message = 'No se ha encontrado la operacion a cancelar';
      }
      _.forOwn(row, (val, key) => {
        const newVal = payload[key] || val;
        row[key] = newVal;
      });
    });
    builder.addCase(createOne.fulfilled, (state, { payload }) => {
      state.clientsData = state.clientsData.concat(payload);
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
      state.status = STATUS.success;
    });
  },
});

export const { setFilters, resetState, clearFilters, applyFilters } =
  dataSlice.actions;
export default dataSlice;
