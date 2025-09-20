import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ENDPOINTS } from "../../config/endpoints";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }) => {
    const url = `${ENDPOINTS.BASE_URL}${ENDPOINTS.LOGIN}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, isSoftphone: true }),
    });
    let data = null;
    try {
      data = await res.json();
    } catch (e) {}
    if (!res.ok) {
      const msg =
        data?.message || data?.error || `Login failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }
);

const initialState = {
  status: "idle",
  error: null,
  token: null,
  user: null,
  extension: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.extension = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload;
        const data = payload?.data || payload;
        state.token = data?.tokens?.sip || data?.token || null;
        state.user = data?.user || null;
        state.extension = data?.user?.extension || data?.extension || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
