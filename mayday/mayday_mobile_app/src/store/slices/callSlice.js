import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  active: null, // { id, number, direction, status, isMuted, isOnHold }
  history: [],
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
  },
});

export const {
  startCall,
  incomingCall,
  updateCallStatus,
  endCall,
  setMute,
  setHold,
} = callSlice.actions;
export default callSlice.reducer;
