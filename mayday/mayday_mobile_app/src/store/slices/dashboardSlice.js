import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as dashboardService from "../../services/dashboardService";

export const fetchMyPerformanceStats = createAsyncThunk(
  "dashboard/fetchMyStats",
  async (timeframe = "today", { getState }) => {
    const { token, user } = getState().auth;
    const extension = user?.extension || null;
    const response = await dashboardService.getMyPerformanceStats(
      token,
      timeframe,
      extension
    );
    return response.data;
  }
);

export const fetchSystemStats = createAsyncThunk(
  "dashboard/fetchSystemStats",
  async (timeRange = "today", { getState }) => {
    const { token } = getState().auth;
    const response = await dashboardService.getSystemStats(token, timeRange);
    return response.data;
  }
);

export const fetchQueueStatus = createAsyncThunk(
  "dashboard/fetchQueueStatus",
  async (_, { getState }) => {
    const { token } = getState().auth;
    const response = await dashboardService.getQueueStatus(token);
    return response.data;
  }
);

export const fetchActiveAgents = createAsyncThunk(
  "dashboard/fetchActiveAgents",
  async (_, { getState }) => {
    const { token } = getState().auth;
    const response = await dashboardService.getActiveAgents(token);
    return response.data;
  }
);

export const fetchActiveCalls = createAsyncThunk(
  "dashboard/fetchActiveCalls",
  async (_, { getState }) => {
    const { token } = getState().auth;
    const response = await dashboardService.getActiveCalls(token);
    return response.data;
  }
);

const initialState = {
  // Personal stats (existing)
  stats: {
    totalCalls: 0,
    inbound: 0,
    outbound: 0,
    missed: 0,
    answeredCalls: 0,
    avgHandleTime: "0:00",
  },

  // System-wide stats (new)
  systemStats: {
    activeCalls: 0,
    activeAgents: 0,
    totalCalls: 0,
    answeredCalls: 0,
    abandonedCalls: 0,
    inboundCalls: 0,
    outboundCalls: 0,
    abandonRate: 0,
  },

  // Time range (new)
  timeRange: 0, // 0=today, 1=week, 2=month

  // Queue status (new)
  queueStatus: [],

  // Active agents list (new)
  activeAgents: [],

  // Active calls list (new)
  activeCalls: [],

  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  systemStatsStatus: "idle",
  queueStatusStatus: "idle",
  activeAgentsStatus: "idle",
  activeCallsStatus: "idle",
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Personal performance stats
      .addCase(fetchMyPerformanceStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyPerformanceStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchMyPerformanceStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // System stats
      .addCase(fetchSystemStats.pending, (state) => {
        state.systemStatsStatus = "loading";
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.systemStatsStatus = "succeeded";
        state.systemStats = action.payload || state.systemStats;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.systemStatsStatus = "failed";
        state.error = action.error.message;
      })

      // Queue status
      .addCase(fetchQueueStatus.pending, (state) => {
        state.queueStatusStatus = "loading";
      })
      .addCase(fetchQueueStatus.fulfilled, (state, action) => {
        state.queueStatusStatus = "succeeded";
        state.queueStatus = action.payload || [];
      })
      .addCase(fetchQueueStatus.rejected, (state, action) => {
        state.queueStatusStatus = "failed";
      })

      // Active agents
      .addCase(fetchActiveAgents.pending, (state) => {
        state.activeAgentsStatus = "loading";
      })
      .addCase(fetchActiveAgents.fulfilled, (state, action) => {
        state.activeAgentsStatus = "succeeded";
        state.activeAgents = action.payload || [];
      })
      .addCase(fetchActiveAgents.rejected, (state, action) => {
        state.activeAgentsStatus = "failed";
      })

      // Active calls
      .addCase(fetchActiveCalls.pending, (state) => {
        state.activeCallsStatus = "loading";
      })
      .addCase(fetchActiveCalls.fulfilled, (state, action) => {
        state.activeCallsStatus = "succeeded";
        state.activeCalls = action.payload || [];
      })
      .addCase(fetchActiveCalls.rejected, (state, action) => {
        state.activeCallsStatus = "failed";
      });
  },
});

export const { setTimeRange, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
