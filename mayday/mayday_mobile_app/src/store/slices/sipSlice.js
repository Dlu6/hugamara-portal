import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ENDPOINTS } from '../../config/endpoints';

export const fetchSipBootstrap = createAsyncThunk('sip/bootstrap', async (token, thunkAPI) => {
  // For agent-login, backend already returns SIP bootstrap in the login payload
  // So this can be a no-op or a future call if separate endpoint exists
  return {};
});

const initialState = {
  status: 'idle',
  error: null,
  registered: false,
  connecting: false,
  domain: null,
  wsServers: [],
  iceServers: [],
  realm: null
};

const sipSlice = createSlice({
  name: 'sip',
  initialState,
  reducers: {
    setRegistered(state, action) { state.registered = action.payload; },
    setConnecting(state, action) { state.connecting = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSipBootstrap.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSipBootstrap.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const data = action.payload || {};
        state.domain = data.server || data.domain || null;
        state.wsServers = data.ws_servers || [];
        state.iceServers = data.iceServers || [];
        state.realm = data.realm || state.domain;
      })
      .addCase(fetchSipBootstrap.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setRegistered, setConnecting } = sipSlice.actions;
export default sipSlice.reducer;
