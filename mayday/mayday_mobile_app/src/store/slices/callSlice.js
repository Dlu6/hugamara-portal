import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import callHistoryService from "../../services/callHistoryService";

// Async thunk for fetching call history
export const fetchCallHistory = createAsyncThunk(
  "call/fetchCallHistory",
  async ({ token, extension, limit = 50 }, { rejectWithValue }) => {
    try {
      const result = await callHistoryService.getEnhancedCallHistory(
        token,
        extension,
        limit
      );
      return result.data.records || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  active: null, // { id, number, direction, status, isMuted, isOnHold }
  history: [],
  // Call history state
  callHistory: [],
  callHistoryLoading: false,
  callHistoryError: null,
  historyFilters: {
    type: "all", // "all", "inbound", "outbound", "missed"
    search: "",
  },
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    startCall(state, action) {
      const { number } = action.payload;
      state.active = {
        id: Date.now(),
        number,
        direction: "outbound",
        status: "connecting",
        isMuted: false,
        isOnHold: false,
      };
    },
    incomingCall(state, action) {
      const { caller } = action.payload;
      state.active = {
        id: Date.now(),
        number: caller,
        direction: "inbound",
        status: "ringing",
        isMuted: false,
        isOnHold: false,
      };
    },
    updateCallStatus(state, action) {
      if (state.active) state.active.status = action.payload;
    },
    setMute(state, action) {
      if (state.active) state.active.isMuted = action.payload;
    },
    setHold(state, action) {
      if (state.active) state.active.isOnHold = action.payload;
    },
    endCall(state) {
      if (state.active) {
        state.history.unshift({ ...state.active });
      }
      state.active = null;
    },
    // Call history actions
    setCallHistory(state, action) {
      state.callHistory = action.payload;
    },
    setHistoryLoading(state, action) {
      state.callHistoryLoading = action.payload;
    },
    setHistoryError(state, action) {
      state.callHistoryError = action.payload;
    },
    setHistoryFilters(state, action) {
      state.historyFilters = { ...state.historyFilters, ...action.payload };
    },
    clearCallHistory(state) {
      state.callHistory = [];
      state.callHistoryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCallHistory.pending, (state) => {
        state.callHistoryLoading = true;
        state.callHistoryError = null;
      })
      .addCase(fetchCallHistory.fulfilled, (state, action) => {
        state.callHistoryLoading = false;
        state.callHistory = action.payload;
        state.callHistoryError = null;
      })
      .addCase(fetchCallHistory.rejected, (state, action) => {
        state.callHistoryLoading = false;
        state.callHistoryError = action.payload;
      });
  },
});

export const {
  startCall,
  incomingCall,
  updateCallStatus,
  endCall,
  setMute,
  setHold,
  setCallHistory,
  setHistoryLoading,
  setHistoryError,
  setHistoryFilters,
  clearCallHistory,
} = callSlice.actions;
export default callSlice.reducer;
