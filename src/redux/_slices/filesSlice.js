import fileDownload from 'js-file-download';
// import { saveAs } from 'file-saver';
import {
  createSlice,
  createAsyncThunk,
  isPending,
  isFulfilled,
  isRejected,
} from '@reduxjs/toolkit';

import { STATUS } from 'constants/thunkStates';
import { OPERATION_STATUS } from 'constants/operationStatus';
import { getFilters } from 'utils/helpers';

const filesInitialState = {
  status: STATUS.idle,
  error: null,
  files: null,
};

export const bulkAdd = createAsyncThunk(
  'files/bulkAdd',
  async (payload, { rejectWithValue, extra }) => {
    try {
      const [bulkAddResponse] = await extra.API.backoffice.bulkAdd(payload);
      if (!bulkAddResponse || bulkAddResponse.code !== 200) {
        return rejectWithValue({
          message: 'No se pudo subir y/o guardar la informacion correctamente',
        });
      }
      return bulkAddResponse;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const generateLinks = createAsyncThunk(
  'files/generateLinks',
  async (payload, { extra }) => {
    const filters = getFilters(payload);
    const generateLinksResponse = await extra.API.backoffice.generateLinks(
      filters
    );
    return fileDownload(generateLinksResponse, `LINKS-${Date.now()}.txt`);
  }
);

export const exportSuccessfulOperations = createAsyncThunk(
  'files/exportSuccessfulOperations',
  async (_, { extra }) => {
    const filters = {
      operationStatus: OPERATION_STATUS.success,
    };
    const exportOkOpResponse =
      await extra.API.backoffice.exportSuccessfulOperations(filters);
    return fileDownload(
      exportOkOpResponse,
      `SUCESSFUL_OPERATIONS-${Date.now()}.txt`
    );
  }
);

export const exportFile = createAsyncThunk(
  'files/exportFile',
  async (payload, { extra }) => {
    const filters = getFilters(payload);
    const exportFileResponse =
      await extra.API.backoffice.exportFilteredOperations(filters);
    return fileDownload(
      exportFileResponse,
      `FILTERED_OPERATIONS-${Date.now()}.xlsx`
    );
  }
);

const isPendingAction = isPending(
  bulkAdd,
  generateLinks,
  exportFile,
  exportSuccessfulOperations
);
const isFulfilledAction = isFulfilled(
  bulkAdd,
  generateLinks,
  exportFile,
  exportSuccessfulOperations
);
const isRejectedAction = isRejected(
  bulkAdd,
  generateLinks,
  exportFile,
  exportSuccessfulOperations
);

const filesSlice = createSlice({
  name: 'files',
  initialState: filesInitialState,
  reducers: {
    resetState: (state, { payload }) => {
      state.status = STATUS.idle;
      state.error = null;
    },
    setError: (state, { payload }) => {
      state.status = STATUS.error;
      state.error = payload;
    },
  },
  extraReducers: (builder) => {
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

export const { resetState, setError } = filesSlice.actions;

export default filesSlice;
