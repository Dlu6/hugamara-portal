import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  active: null, // { id, number, direction, status }
  history: []
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    startCall(state, action) {
      state.active = { id: Date.now(), number: action.payload, direction: 'outbound', status: 'dialing' };
    },
    incomingCall(state, action) {
      state.active = { id: Date.now(), number: action.payload, direction: 'inbound', status: 'ringing' };
    },
    updateCallStatus(state, action) {
      if (state.active) state.active.status = action.payload;
    },
    endCall(state) {
      if (state.active) {
        state.history.unshift(state.active);
      }
      state.active = null;
    }
  }
});

export const { startCall, incomingCall, updateCallStatus, endCall } = callSlice.actions;
export default callSlice.reducer;
