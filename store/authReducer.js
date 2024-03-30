import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user_id: "",
    user: {},
    keyboardHeight: 0,
    deviceToken: "",
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
    setDeviceToken: (state, action) => {
      state.deviceToken = action?.payload;
    },
  },
});

export const { setUserId, setUser, setKeyboardHeight, setDeviceToken } =
  authSlice.actions;
export default authSlice.reducer;
