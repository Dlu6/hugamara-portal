import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  outlets: [
    {
      id: 'cs',
      name: 'Server Room',
      domain: 'cs.hugamara.com',
      type: 'HQ',
      location: 'Server Room',
      status: 'active'
    },
    {
      id: 'villa',
      name: 'The Villa Ug',
      type: 'Nightclub',
      location: 'Bukoto Ntinda Rd',
      status: 'active'
    },
    {
      id: 'luna',
      name: 'Luna',
      type: 'Nightclub',
      location: 'Cube Kisementi',
      status: 'active'
    },
    {
      id: 'cueva',
      name: 'La Cueva',
      type: 'Nightclub',
      location: 'Bukoto, Ntinda Road',
      status: 'active'
    },
    {
      id: 'patio',
      name: 'Patio Bella',
      type: 'Restaurant',
      location: 'Arena Mall',
      status: 'active'
    },
    {
      id: 'maze',
      name: 'Maze',
      type: 'Restaurant',
      location: 'Forest Mall',
      status: 'active'
    },
    {
      id: 'maze-bistro',
      name: 'The Maze Bistro',
      type: 'Restaurant',
      location: 'Mbuya Ismael Road',
      status: 'active'
    }
  ],
  currentOutlet: null,
  loading: false,
  error: null
};

const outletSlice = createSlice({
  name: 'outlet',
  initialState,
  reducers: {
    setCurrentOutlet: (state, action) => {
      state.currentOutlet = action.payload;
    },
    clearCurrentOutlet: (state) => {
      state.currentOutlet = null;
    },
    setOutlets: (state, action) => {
      state.outlets = action.payload;
    },
    addOutlet: (state, action) => {
      state.outlets.push(action.payload);
    },
    updateOutlet: (state, action) => {
      const index = state.outlets.findIndex(outlet => outlet.id === action.payload.id);
      if (index !== -1) {
        state.outlets[index] = action.payload;
      }
    },
    removeOutlet: (state, action) => {
      state.outlets = state.outlets.filter(outlet => outlet.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setCurrentOutlet,
  clearCurrentOutlet,
  setOutlets,
  addOutlet,
  updateOutlet,
  removeOutlet,
  setLoading,
  setError,
  clearError
} = outletSlice.actions;

export default outletSlice.reducer;