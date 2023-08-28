// store/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDark:
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches, // Default theme
  },
  reducers: {
    setTheme: (state, action) => {
      state.isDark = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
