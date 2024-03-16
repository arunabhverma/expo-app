import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user_id: "",
  },
  reducers: {
    setUserId: (state, action) => {
      state.user_id = action?.payload;
    },
  },
});

export const { setUserId } = authSlice.actions;
export default authSlice.reducer;
