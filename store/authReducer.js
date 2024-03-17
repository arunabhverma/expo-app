import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user_id: "",
    user: {},
    keyboardHeight: 0,
  },
  reducers: {
    setUserId: (state, action) => {
      state.user_id = action?.payload;
    },
    setUser: (state, action) => {
      state.user = action?.payload;
    },
    setKeyboardHeight: (state, action) => {
      state.keyboardHeight = action?.payload;
    },
  },
});

export const { setUserId, setUser, setKeyboardHeight } = authSlice.actions;
export default authSlice.reducer;
